import { Request, RequestHandler } from 'express';
import { matchedData } from 'express-validator';
import { FindAttributeOptions, Includeable, Model, ModelStatic, Op, Order, WhereOptions } from 'sequelize';
import ApiError from './ApiError';
import h from './asyncHandler';

type Datos = Record<string, any>;

export interface OpcionesCrud {
  nombre: string;
  include?: Includeable[];
  orden?: Order;
  /** Columnas donde busca el parámetro ?q= (búsqueda por texto parcial) */
  camposBusqueda?: string[];
  /** Condición que se agrega SIEMPRE al listar y al consultar (ej. a los visitantes solo se les muestran los activos) */
  filtroBase?: (req: Request) => WhereOptions;
  /** Columnas que se devuelven (ej. ocultar el correo a los visitantes) */
  atributos?: (req: Request) => FindAttributeOptions | undefined;
  antesDeCrear?: (req: Parameters<RequestHandler>[0], datos: Datos) => Promise<Datos> | Datos;
  antesDeActualizar?: (req: Parameters<RequestHandler>[0], datos: Datos, registro: Model) => Promise<Datos> | Datos;
  antesDeEliminar?: (req: Parameters<RequestHandler>[0], registro: Model & Datos) => Promise<void> | void;
}

/**
 * Genera las 5 operaciones CRUD de un modelo.
 * Solo se guardan los campos que pasaron express-validator (matchedData),
 * así que ningún campo no validado llega a la base de datos.
 *
 * El listado entiende: pagina, limite, q (búsqueda), desde / hasta (fecha de creación),
 * ordenarPor / dir (orden) y cualquier filtro por columna que el validator haya aprobado.
 */
export default function crearCrud(
  Modelo: ModelStatic<any>,
  {
    nombre,
    include = [],
    orden = [['id', 'DESC']],
    camposBusqueda = [],
    filtroBase,
    atributos,
    antesDeCrear,
    antesDeActualizar,
    antesDeEliminar,
  }: OpcionesCrud,
) {
  const buscar = async (id: number | string, req?: Request) => {
    const registro = await Modelo.findOne({
      where: { id, ...(req && filtroBase ? filtroBase(req) : {}) },
      include,
      attributes: req && atributos ? atributos(req) : undefined,
    });
    if (!registro) throw new ApiError(404, `No se encontró ${nombre.toLowerCase()} con id ${id}`);
    return registro;
  };

  return {
    buscar,

    listar: h(async (req, res) => {
      const { pagina = 1, limite = 20, q, desde, hasta, ordenarPor, dir, ...filtros } = matchedData(req, {
        locations: ['query'],
      });

      const where: Record<string | symbol, unknown> = { ...filtros, ...(filtroBase ? filtroBase(req) : {}) };

      if (q && camposBusqueda.length) {
        where[Op.or] = camposBusqueda.map((campo) => ({ [campo]: { [Op.like]: `%${q}%` } }));
      }
      if (desde || hasta) {
        where.createdAt = { ...(desde && { [Op.gte]: desde }), ...(hasta && { [Op.lte]: hasta }) };
      }

      const { rows, count } = await Modelo.findAndCountAll({
        where: where as WhereOptions,
        include,
        attributes: atributos ? atributos(req) : undefined,
        order: ordenarPor ? [[ordenarPor, (dir || 'asc').toUpperCase()], ['id', 'DESC']] : orden,
        limit: limite,
        offset: (pagina - 1) * limite,
        distinct: true,
      });
      res.json({ total: count, pagina, limite, datos: rows });
    }),

    obtener: h(async (req, res) => {
      res.json(await buscar(req.params.id, req));
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
