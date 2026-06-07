export type Station = {
  id: string;
  nombre: string;
  ramales: number[];
  latitud?: string;
  longitud?: string;
};

export type Trip = {
  id: number;
  ramal: string;
  anden: string;
  tipoServicio: string;
  estado: string;
  horaSalida: string;
  horaLlegada: string;
  duracion: string;
  origen: string;
  destino: string;
};

export type ArrivalResult = {
  arribo: {
    anden?: { nombre?: string };
    llegada?: { programada?: string; estimada?: string };
    salida?: { programada?: string; estimada?: string };
    segundos?: number;
    idElemento?: number;
    nombre?: string;
  };
  servicio: {
    numero: number;
    ramal?: { id?: number; nombre?: string };
    tipo?: { nombre?: string };
    estado?: { nombre?: string };
    desde?: { nombre?: string; idElemento?: number; estacion?: { nombre?: string; idElemento?: number } };
    hasta?: { nombre?: string; idElemento?: number; estacion?: { nombre?: string; idElemento?: number } };
  };
};
