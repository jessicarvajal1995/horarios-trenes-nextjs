'use client';

import { CircleDot } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Trip } from '@/lib/types';

type ResultCardProps = {
  trip: Trip;
};

function formatDuration(seconds: number): string {
  const totalMinutes = Math.max(0, Math.round(seconds / 60));
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
}

function formatWaitUntil(value: string): string {
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

  return formatDuration(secondsUntilDeparture);
}

export function ResultCard({ trip }: ResultCardProps) {
  const [waitUntilDeparture, setWaitUntilDeparture] = useState(() => formatWaitUntil(trip.salida));

  useEffect(() => {
    setWaitUntilDeparture(formatWaitUntil(trip.salida));

    const timer = window.setInterval(() => {
      setWaitUntilDeparture(formatWaitUntil(trip.salida));
    }, 30_000);

    return () => window.clearInterval(timer);
  }, [trip.salida]);

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
          <span>{waitUntilDeparture === 'Saliendo' ? 'Saliendo' : `en ${waitUntilDeparture}`}</span>
        </div>

        <div className="trip-card__stations">
          <div>
            <span>Origen</span>
            <strong>{trip.origen}</strong>
          </div>
          <div>
            <span>Destino</span>
            <strong>{trip.destino}</strong>
          </div>
        </div>
      </div>
    </article>
  );
}
