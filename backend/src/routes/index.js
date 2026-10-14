const fs = require('fs');
const path = require('path');
const router = require('express').Router();

router.get('/salud', (req, res) => res.json({ ok: true, servicio: 'OPV Drywall API' }));

// Monta automáticamente cada archivo "<nombre>.routes.js" en /api/<nombre>
// (ej. cotizaciones.routes.js -> /api/cotizaciones). Agregar un módulo no obliga a editar este archivo.
fs.readdirSync(__dirname)
  .filter((archivo) => archivo.endsWith('.routes.js'))
  .forEach((archivo) => {
    router.use(`/${archivo.replace('.routes.js', '')}`, require(path.join(__dirname, archivo)));
  });

module.exports = router;
