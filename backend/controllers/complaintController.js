const complaintsModel = require('../models/complaints');
const { requireAuth } = require('../middleware/auth');
const { saveBase64Photo } = require('../utils/fileStore');

module.exports = {
  create: async (req) => {
    const user = requireAuth(req);
    const body = { ...req.body };
    if (body.photo && body.photo.startsWith('data:')) {
      body.photo = saveBase64Photo(body.photo);
    }
    const complaint = complaintsModel.create({ ...body, user_id: user.user_id });
    return { status: 201, body: complaint };
  },

  track: async (req, params) => {
    const result = complaintsModel.getById(params.id);
    return { status: 200, body: result };
  },

  mine: async (req, params, query) => {
    const user = requireAuth(req);
    const list = complaintsModel.listMine(user.user_id, query);
    return { status: 200, body: list };
  },

  feedback: async (req, params) => {
    const user = requireAuth(req);
    const result = complaintsModel.submitFeedback(params.id, req.body, user.user_id);
    return { status: 200, body: result };
  },
};
