/*
 * TIPOS (interfaces) del CRUD transaccional de órdenes.
 * Se usan para tipar el body y los query params de cada petición,
 * así no hace falta usar "any" en ninguna parte del proyecto.
 */

// Un producto dentro de la orden, tal como llega en el body
export interface DetalleEntrada {
  producto: string;
  cantidad: number;
  precioUnitario: number;
}

// Body de POST /api/transac-crud/guardar
export interface CuerpoCrearOrden {
  numeroOrden: string;
  clienteNombre: string;
  observaciones?: string | null;
  detalles: DetalleEntrada[];
  simularError?: boolean;
}

// Body de PUT /api/transac-crud/actualizar (todos los campos son opcionales)
export interface CuerpoActualizarOrden {
  clienteNombre?: string;
  observaciones?: string | null;
  detalles?: DetalleEntrada[];
  simularError?: boolean;
}

// Query param ?id=... (llega como texto; las validaciones comprueban que sea un entero)
export interface ConsultaId {
  id?: string;
}
