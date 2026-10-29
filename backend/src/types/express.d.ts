// Agrega la propiedad `user` a Request: la llena el middleware auth con los datos del token
declare global {
  namespace Express {
    interface Request {
      user?: { id: number; rol: 'admin' | 'cliente' };
    }
  }
}

export {};
