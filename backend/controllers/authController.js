const authModel = require('../models/auth');
const miscModel = require('../models/misc');
const { requireAuth } = require('../middleware/auth');

module.exports = {
  register: async (req) => {
    const result = authModel.register(req.body);
    return { status: 201, body: result };
  },

  login: async (req) => {
    const result = authModel.login(req.body);
    return { status: 200, body: result };
  },

  me: async (req) => {
    const user = requireAuth(req);
    return { status: 200, body: authModel.publicUser(user) };
  },

  updateProfile: async (req) => {
    const user = requireAuth(req);
    const updated = miscModel.updateProfile(user.user_id, req.body);
    return { status: 200, body: updated };
  },
};
