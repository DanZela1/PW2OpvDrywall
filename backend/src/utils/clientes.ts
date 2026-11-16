import { Transaction } from 'sequelize';
import models from '../models';

const { Cliente } = models;

export interface DatosCliente {
  nombre: string;
  correo: string;
  telefono: string;
  direccion?: string | null;
}

/**
 * Devuelve el cliente que tiene ese correo; si no existe, lo crea.
 * Se usa DENTRO de una transacción: si la cotización falla después, el cliente nuevo también se deshace.
 * Un cliente que ya existe NO se modifica (sus datos solo cambian desde el panel de clientes).
 */
export async function buscarOCrearCliente(datos: DatosCliente, t: Transaction): Promise<{ cliente: any; creado: boolean }> {
  const [cliente, creado] = await Cliente.findOrCreate({
    where: { correo: datos.correo },
    defaults: { nombre: datos.nombre, telefono: datos.telefono, direccion: datos.direccion ?? null },
    transaction: t,
  });
  return { cliente, creado };
}
