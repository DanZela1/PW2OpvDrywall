const jwt = require('jsonwebtoken');

const leerToken = (req) => req.headers.authorization?.split(' ')[1];

// Exige token válido: Authorization: Bearer <token>
exports.auth = (req, res, next) => {
  const token = leerToken(req);
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Si hay token válido identifica al usuario; si no, deja pasar (rutas públicas)
exports.authOpcional = (req, res, next) => {
  const token = leerToken(req);
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch { /* se trata como visitante */ }
  }
  next();
};

// Exige rol administrador (usar después de auth)
exports.soloAdmin = (req, res, next) =>
  req.user?.rol === 'admin' ? next() : res.status(403).json({ error: 'No tienes permiso para esta acción' });
