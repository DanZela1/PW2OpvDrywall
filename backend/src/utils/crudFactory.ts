import { RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import { Includeable, Model, ModelStatic, Order } from 'sequelize';
import ApiError from './ApiError';
import h from './asyncHandler';

type Datos = Record<string, any>;

export interface OpcionesCrud {
  nombre: string;
  include?: Includeable[];
  orden?: Order;
  antesDeCrear?: (req: Parameters<RequestHandler>[0], datos: Datos) => Promise<Datos> | Datos;
  antesDeActualizar?: (req: Parameters<RequestHandler>[0], datos: Datos, registro: Model) => Promise<Datos> | Datos;
  antesDeEliminar?: (req: Parameters<RequestHandler>[0], registro: Model & Datos) => Promise<void> | void;
}

/**
 * Genera las 5 operaciones CRUD de un modelo.
 * Solo se guardan los campos que pasaron express-validator (matchedData),
 * así que ningún campo no validado llega a la base de datos.
 */
export default function crearCrud(
  Modelo: ModelStatic<any>,
  { nombre, include = [], orden = [['id', 'DESC']], antesDeCrear, antesDeActualizar, antesDeEliminar }: OpcionesCrud,
) {
  const buscar = async (id: number | string) => {
    const registro = await Modelo.findByPk(id, { include });
    if (!registro) throw new ApiError(404, `No se encontró ${nombre.toLowerCase()} con id ${id}`);
    return registro;
  };

  return {
    buscar,

    listar: h(async (req, res) => {
      const { pagina = 1, limite = 20, ...filtros } = matchedData(req, { locations: ['query'] });
      const { rows, count } = await Modelo.findAndCountAll({
        where: filtros,
        include,
        order: orden,
        limit: limite,
        offset: (pagina - 1) * limite,
        distinct: true,
      });
      res.json({ total: count, pagina, limite, datos: rows });
    }),

    obtener: h(async (req, res) => {
      res.json(await buscar(req.params.id));
    }),

    crear: h(async (req, res) => {
      let datos: Datos = matchedData(req, { locations: ['body'] });
      if (antesDeCrear) datos = await antesDeCrear(req, datos);
      const creado = await Modelo.create(datos);
      res.status(201).json(await buscar(creado.id));
    }),

    actualizar: h(async (req, res) => {
      const registro = await buscar(req.params.id);
      let datos: Datos = matchedData(req, { locations: ['body'] });
      if (antesDeActualizar) datos = await antesDeActualizar(req, datos, registro);
      await registro.update(datos);
      res.json(await buscar(registro.id));
    }),

    eliminar: h(async (req, res) => {
      const registro = await buscar(req.params.id);
      if (antesDeEliminar) await antesDeEliminar(req, registro);
      await registro.destroy();
      res.json({ mensaje: `${nombre} eliminado correctamente`, id: registro.id });
    }),
  };
}
