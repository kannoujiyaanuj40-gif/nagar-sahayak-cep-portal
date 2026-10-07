const miscModel = require('../models/misc');
const { requireAuth } = require('../middleware/auth');

module.exports = {
  list: async (req) => {
    const user = requireAuth(req);
    return { status: 200, body: miscModel.listNotifications(user.user_id) };
  },
  markRead: async (req, params) => {
    const user = requireAuth(req);
    return { status: 200, body: miscModel.markRead(params.id, user.user_id) };
  },
  markAllRead: async (req) => {
    const user = requireAuth(req);
    miscModel.markAllRead(user.user_id);
    return { status: 200, body: { ok: true } };
  },
};
