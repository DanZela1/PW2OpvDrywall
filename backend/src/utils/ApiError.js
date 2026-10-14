// Error con código HTTP; lo captura el middleware central de errores
class ApiError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}
module.exports = ApiError;
