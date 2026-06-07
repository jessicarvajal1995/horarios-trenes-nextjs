import type { ArrivalResult, Trip } from './types';

const formatter = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
});

function formatTime(value?: string): string {
  if (!value) {
    return '--:--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return formatter.format(date);
}

function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds < 0) {
    return '';
  }

  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

function formatWaitUntil(value?: string): string {
  if (!value) {
    return '--';
  }

  const departure = new Date(value);
  if (Number.isNaN(departure.getTime())) {
    return '--';
  }

  const secondsUntilDeparture = (departure.getTime() - Date.now()) / 1000;
  if (secondsUntilDeparture <= 60) {
    return 'Saliendo';
  }

  return formatDuration(secondsUntilDeparture) || '--';
}

type StationSelection = { id?: string; nombre?: string } | null | undefined;

type TripStop = NonNullable<ArrivalResult['servicio']['estaciones']>[number];

function stopMatchesStation(stop: TripStop | undefined, station: StationSelection): stop is TripStop {
  if (!stop || !station) {
    return false;
  }

  return String(stop.estacion?.idElemento ?? stop.idElemento) === station.id;
}

function findServiceStop(result: ArrivalResult, station: StationSelection): TripStop | undefined {
  return result.servicio.estaciones?.find((stop) => stopMatchesStation(stop, station));
}

function stopName(stop: TripStop | undefined, fallback: string): string {
  return stop?.estacion?.nombre ?? stop?.nombre ?? fallback;
}

function stopArrivalTime(stop: TripStop | undefined): string | undefined {
  const arrival = stop?.estacion?.llegada ?? stop?.llegada;
  const departure = stop?.estacion?.salida ?? stop?.salida;

  return arrival?.estimada ?? arrival?.programada ?? departure?.estimada ?? departure?.programada;
}

function stopDepartureTime(stop: TripStop | undefined): string | undefined {
  const departure = stop?.estacion?.salida ?? stop?.salida;
  const arrival = stop?.estacion?.llegada ?? stop?.llegada;

  return departure?.estimada ?? departure?.programada ?? arrival?.estimada ?? arrival?.programada;
}

function secondsBetween(start?: string, end?: string): number | undefined {
  if (!start || !end) {
    return undefined;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return undefined;
  }

  return (endDate.getTime() - startDate.getTime()) / 1000;
}

export function mapArrivalToTrip(
  result: ArrivalResult,
  selectedOrigin?: StationSelection,
  selectedDestination?: StationSelection
): Trip {
  const originStop = findServiceStop(result, selectedOrigin) ?? result.servicio.desde?.estacion ?? result.servicio.desde;
  const destinationStop = findServiceStop(result, selectedDestination) ?? result.servicio.hasta?.estacion ?? result.servicio.hasta;
  const departure = stopDepartureTime(originStop) ?? result.arribo.salida?.programada ?? result.arribo.salida?.estimada;
  const arrival = stopArrivalTime(destinationStop) ?? result.arribo.llegada?.estimada ?? result.arribo.llegada?.programada;

  return {
    id: result.servicio.numero,
    ramal: result.servicio.ramal?.nombre ?? 'Sin ramal',
    anden: result.arribo.anden?.nombre ?? '-',
    tipoServicio: result.servicio.tipo?.nombre ?? 'Servicio',
    estado: result.servicio.estado?.nombre ?? 'Confirmado',
    horaSalida: formatTime(departure),
    horaLlegada: formatTime(arrival),
    esperaArribo: formatWaitUntil(departure),
    duracion: formatDuration(secondsBetween(departure, arrival)),
    origen: stopName(originStop, result.arribo.nombre ?? selectedOrigin?.nombre ?? 'Origen'),
    destino: stopName(destinationStop, selectedDestination?.nombre ?? 'Destino')
  };
}

export function groupTripsByBranch(trips: Trip[]) {
  return trips.reduce<Record<string, Trip[]>>((groups, trip) => {
    groups[trip.ramal] ??= [];
    groups[trip.ramal].push(trip);
    return groups;
  }, {});
}
