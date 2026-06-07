import { CircleDot } from 'lucide-react';
import type { Trip } from '@/lib/types';

type ResultCardProps = {
  trip: Trip;
};

export function ResultCard({ trip }: ResultCardProps) {
  return (
    <article className="trip-card">
      <header className="trip-card__header">
        <span>Ramal</span>
        <strong>{trip.ramal}</strong>
      </header>
      <div className="trip-card__body">
        <div className="trip-card__meta">
          <span>Anden {trip.anden}</span>
          <span>
            {trip.tipoServicio}
            {trip.estado ? ` · ${trip.estado}` : ''}
          </span>
        </div>

        <div className="trip-card__times" aria-label="Horarios del viaje">
          <div className="trip-card__time-block">
            <span>Salida</span>
            <strong>{trip.horaSalida}</strong>
          </div>
          <span className="trip-card__line">
            <CircleDot size={18} aria-hidden="true" />
          </span>
          <div className="trip-card__time-block trip-card__time-block--end">
            <span>Llegada</span>
            <strong>{trip.horaLlegada !== '--:--' ? trip.horaLlegada : trip.duracion}</strong>
          </div>
        </div>

        <div className="trip-card__arrival">
          <strong>en {trip.esperaArribo}</strong>
        </div>

        <div className="trip-card__stations">
          <div>
            <span>Origen</span>
            <strong>{trip.origen}</strong>
          </div>
          <div>
            <span>Destino</span>
            <strong>{trip.destino}</strong>
            <small>{trip.id}</small>
          </div>
        </div>
      </div>
    </article>
  );
}
