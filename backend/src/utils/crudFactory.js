const { matchedData } = require('express-validator');
const ApiError = require('./ApiError');
const h = require('./asyncHandler');

/**
 * Genera las 5 operaciones CRUD de un modelo.
 * Solo se guardan los campos que pasaron express-validator (matchedData),
 * así que ningún campo no validado llega a la base de datos.
 */
module.exports = function crearCrud(Modelo, { nombre, include = [], orden = [['id', 'DESC']], antesDeCrear, antesDeActualizar, antesDeEliminar } = {}) {
  const buscar = async (id) => {
    const registro = await Modelo.findByPk(id, { include });
    if (!registro) throw new ApiError(404, `No se encontró ${nombre.toLowerCase()} con id ${id}`);
    return registro;
  };

  return {
    buscar,

    listar: h(async (req, res) => {
      const { pagina = 1, limite = 20, ...filtros } = matchedData(req, { locations: ['query'] });
      const { rows, count } = await Modelo.findAndCountAll({
        where: filtros, include, order: orden, limit: limite, offset: (pagina - 1) * limite, distinct: true,
      });
      res.json({ total: count, pagina, limite, datos: rows });
    }),

    obtener: h(async (req, res) => {
      res.json(await buscar(req.params.id));
    }),

    crear: h(async (req, res) => {
      let datos = matchedData(req, { locations: ['body'] });
      if (antesDeCrear) datos = await antesDeCrear(req, datos);
      const creado = await Modelo.create(datos);
      res.status(201).json(await buscar(creado.id));
    }),

    actualizar: h(async (req, res) => {
      const registro = await buscar(req.params.id);
      let datos = matchedData(req, { locations: ['body'] });
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
};
