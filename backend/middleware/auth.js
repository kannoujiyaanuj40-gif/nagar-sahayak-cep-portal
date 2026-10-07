const { verifyToken, httpError } = require('../models/auth');

function getUserFromRequest(req) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  return verifyToken(token);
}

function requireAuth(req) {
  const user = getUserFromRequest(req);
  if (!user) throw httpError(401, 'Please log in to continue');
  return user;
}

function requireAdmin(req) {
  const user = requireAuth(req);
  if (user.role !== 'admin') throw httpError(403, 'Admin access required');
  return user;
}

module.exports = { getUserFromRequest, requireAuth, requireAdmin };
