import { NextFunction, Request, RequestHandler, Response } from 'express';

type Manejador = (req: Request, res: Response, next: NextFunction) => unknown;

// Envuelve una función async para que cualquier error llegue a errorHandler sin try/catch
export default (fn: Manejador): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
