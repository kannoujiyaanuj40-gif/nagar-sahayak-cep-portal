const complaintsModel = require('../models/complaints');
const miscModel = require('../models/misc');
const { requireAdmin } = require('../middleware/auth');
const { saveBase64Photo } = require('../utils/fileStore');

module.exports = {
  listComplaints: async (req, params, query) => {
    requireAdmin(req);
    return { status: 200, body: complaintsModel.listAll(query) };
  },

  updateComplaint: async (req, params) => {
    const admin = requireAdmin(req);
    const body = { ...req.body };
    if (body.resolution_photo && body.resolution_photo.startsWith('data:')) {
      body.resolution_photo = saveBase64Photo(body.resolution_photo);
    }
    const result = complaintsModel.adminUpdate(params.id, body, admin.name);
    return { status: 200, body: result };
  },

  escalate: async (req, params) => {
    const admin = requireAdmin(req);
    const result = complaintsModel.escalate(params.id, admin.name);
    return { status: 200, body: result };
  },

  analytics: async (req) => {
    requireAdmin(req);
    return { status: 200, body: miscModel.analytics() };
  },

  listUsers: async (req) => {
    requireAdmin(req);
    return { status: 200, body: miscModel.listUsers() };
  },

  setUserActive: async (req, params) => {
    requireAdmin(req);
    const result = miscModel.setUserActive(params.id, req.body.is_active);
    return { status: 200, body: result };
  },

  listDepartments: async (req) => {
    requireAdmin(req);
    return { status: 200, body: miscModel.listDepartments() };
  },
  createDepartment: async (req) => {
    requireAdmin(req);
    return { status: 201, body: miscModel.createDepartment(req.body) };
  },
  updateDepartment: async (req, params) => {
    requireAdmin(req);
    return { status: 200, body: miscModel.updateDepartment(params.id, req.body) };
  },
  deleteDepartment: async (req, params) => {
    requireAdmin(req);
    miscModel.deleteDepartment(params.id);
    return { status: 200, body: { ok: true } };
  },

  listFeedback: async (req) => {
    requireAdmin(req);
    const { load } = require('../models/db');
    const data = load();
    const list = data.feedback.map(f => {
      const c = data.complaints.find(c => c.complaint_id === f.complaint_id);
      return { ...f, complaint_title: c ? c.title : '', area: c ? c.area : '' };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { status: 200, body: list };
  },
};
