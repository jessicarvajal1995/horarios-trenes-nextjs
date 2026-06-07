import type { ArrivalResult, Station } from './types';

type StationResponse = {
  id_estacion: string;
  nombre: string;
  latitud?: string;
  longitud?: string;
  incluida_en_ramales?: number[];
  operativa_en_ramales?: number[];
};

type ArrivalResponse = {
  results?: ArrivalResult[];
};

function buildApiUrl(path: string): URL {
  return new URL(`/api/trenes${path}`, window.location.origin);
}

function getDepartureDate(result: ArrivalResult): Date | null {
  const departure = result.arribo.salida?.estimada ?? result.arribo.salida?.programada;
  if (!departure) {
    return null;
  }

  const date = new Date(departure);
  return Number.isNaN(date.getTime()) ? null : date;
}

function filterFromDateTime(results: ArrivalResult[], fecha: string, hora: string): ArrivalResult[] {
  const selectedDate = new Date(`${fecha}T${hora}:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return results;
  }

  return results.filter((result) => {
    const departure = getDepartureDate(result);
    return !departure || departure >= selectedDate;
  });
}

export async function searchStations(query: string): Promise<Station[]> {
  if (query.trim().length < 3) {
    return [];
  }

  const url = buildApiUrl('/infraestructura/estaciones');
  url.searchParams.set('nombre', query.trim());
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('No se pudieron buscar estaciones');
  }

  const data = (await response.json()) as StationResponse[];

  return data.map((station) => ({
    id: station.id_estacion,
    nombre: station.nombre,
    latitud: station.latitud,
    longitud: station.longitud,
    ramales: station.operativa_en_ramales ?? station.incluida_en_ramales ?? []
  }));
}

export async function fetchArrivals(params: {
  origenId: string;
  destinoId?: string;
  fecha: string;
  hora: string;
}): Promise<ArrivalResult[]> {
  const url = buildApiUrl(`/arribos/estacion/${params.origenId}`);
  if (params.destinoId) {
    url.searchParams.set('hasta', params.destinoId);
  }
  url.searchParams.set('fecha', params.fecha);
  if (params.hora) {
    url.searchParams.set('hora', params.hora);
  }
  url.searchParams.set('cantidad', '8');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('No se pudieron cargar los viajes');
  }

  const data = (await response.json()) as ArrivalResponse;
  return data.results ?? [];
}
