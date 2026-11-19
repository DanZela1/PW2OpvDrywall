import { isAxiosError } from 'axios';

// Forma de todos los listados de la API: { total, pagina, limite, datos }
export interface RespuestaLista<T> {
  total: number;
  pagina: number;
  limite: number;
  datos: T[];
}

// Estados de la cotización y a cuáles se puede pasar (tabla 9.5 de la documentación; la API valida lo mismo)
export type EstadoCotizacion = 'pendiente' | 'en_revision' | 'enviada' | 'aceptada' | 'rechazada';
export const ESTADOS_COTIZACION: EstadoCotizacion[] = ['pendiente', 'en_revision', 'enviada', 'aceptada', 'rechazada'];
export const TRANSICIONES: Record<EstadoCotizacion, EstadoCotizacion[]> = {
  pendiente: ['en_revision', 'enviada', 'rechazada'],
  en_revision: ['enviada', 'rechazada'],
  enviada: ['aceptada', 'rechazada'],
  aceptada: [],
  rechazada: ['pendiente'],
};

export interface Linea {
  id: number;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Cotizacion {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  tipoServicio: string;
  ubicacion: string;
  descripcion: string;
  estado: EstadoCotizacion;
  subtotal: number | null;
  impuesto: number | null;
  total: number | null;
  cliente?: { id: number; nombre: string; correo: string } | null;
  proyecto?: { id: number; codigo: string; estado: string } | null;
  detalle?: Linea[];
}

export interface Historial {
  id: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  comentario: string | null;
  createdAt: string;
  autor: { id: number; nombre: string } | null;
}

export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string | null;
  notas: string | null;
}

export type EstadoProyecto = 'Cotización enviada' | 'En ejecución' | 'Finalizado';
export const ESTADOS_PROYECTO: EstadoProyecto[] = ['Cotización enviada', 'En ejecución', 'Finalizado'];

export interface Proyecto {
  id: number;
  codigo: string;
  clienteCorreo: string;
  estado: EstadoProyecto;
  notas: string | null;
  cotizacionId: number | null;
}

// La API siempre responde los errores como { error, errores?: [{ mensaje }] }
export function mensajeError(e: unknown): string {
  if (isAxiosError(e)) {
    const d = e.response?.data as { error?: string; errores?: { mensaje: string }[] } | undefined;
    return d?.errores?.map((x) => x.mensaje).join(' · ') || d?.error || 'No se pudo conectar con la API.';
  }
  return 'Ocurrió un error inesperado.';
}

// Dinero: null significa "la cotización aún no tiene detalle"
export const dinero = (n: number | null | undefined): string => (n === null || n === undefined ? '—' : `L ${n.toFixed(2)}`);