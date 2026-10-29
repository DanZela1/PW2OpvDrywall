// Error con código HTTP: el controlador lo lanza y errorHandler lo convierte en respuesta
export default class ApiError extends Error {
  status: number;

  constructor(status: number, mensaje: string) {
    super(mensaje);
    this.status = status;
  }
}
