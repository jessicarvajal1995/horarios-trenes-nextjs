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
  esperaArribo: string;
  duracion: string;
  origen: string;
  destino: string;
};

type StopTime = { programada?: string; estimada?: string };

type ServiceStop = {
  nombre?: string;
  idElemento?: number;
  llegada?: StopTime;
  salida?: StopTime;
  estacion?: {
    nombre?: string;
    idElemento?: number;
    llegada?: StopTime;
    salida?: StopTime;
  };
};

export type ArrivalResult = {
  arribo: {
    anden?: { nombre?: string };
    llegada?: StopTime;
    salida?: StopTime;
    segundos?: number;
    idElemento?: number;
    nombre?: string;
  };
  servicio: {
    numero: number;
    ramal?: { id?: number; nombre?: string };
    tipo?: { nombre?: string };
    estado?: { nombre?: string };
    desde?: ServiceStop;
    hasta?: ServiceStop;
    estaciones?: ServiceStop[];
  };
};
