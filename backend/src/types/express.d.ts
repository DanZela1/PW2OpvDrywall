// Passport guarda en req.user lo que devuelve la estrategia JWT (config/passport.ts).
// Aquí se declara su forma para que TypeScript sepa que tiene `id` y `rol`.
declare global {
  namespace Express {
    interface User {
      id: number;
      rol: 'admin' | 'cliente';
    }
  }
}

export {};
