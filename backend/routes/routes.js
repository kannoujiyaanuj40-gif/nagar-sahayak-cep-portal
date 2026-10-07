const authController = require('../controllers/authController');
const complaintController = require('../controllers/complaintController');
const notificationController = require('../controllers/notificationController');
const referenceController = require('../controllers/referenceController');
const adminController = require('../controllers/adminController');

/**
 * Each route: { method, pattern, handler }
 * pattern uses :param placeholders, matched against the URL path segments.
 */
module.exports = [
  // Auth
  { method: 'POST', pattern: '/api/auth/register', handler: authController.register },
  { method: 'POST', pattern: '/api/auth/login', handler: authController.login },
  { method: 'GET',  pattern: '/api/auth/me', handler: authController.me },
  { method: 'PUT',  pattern: '/api/auth/profile', handler: authController.updateProfile },

  // Reference data
  { method: 'GET', pattern: '/api/categories', handler: referenceController.categories },
  { method: 'GET', pattern: '/api/departments', handler: referenceController.departments },

  // Citizen complaints
  { method: 'POST', pattern: '/api/complaints', handler: complaintController.create },
  { method: 'GET',  pattern: '/api/complaints/mine', handler: complaintController.mine },
  { method: 'GET',  pattern: '/api/complaints/:id', handler: complaintController.track },
  { method: 'POST', pattern: '/api/complaints/:id/feedback', handler: complaintController.feedback },

  // Notifications
  { method: 'GET',  pattern: '/api/notifications', handler: notificationController.list },
  { method: 'PUT',  pattern: '/api/notifications/:id/read', handler: notificationController.markRead },
  { method: 'PUT',  pattern: '/api/notifications/read-all', handler: notificationController.markAllRead },

  // Admin
  { method: 'GET',  pattern: '/api/admin/complaints', handler: adminController.listComplaints },
  { method: 'PUT',  pattern: '/api/admin/complaints/:id', handler: adminController.updateComplaint },
  { method: 'POST', pattern: '/api/admin/complaints/:id/escalate', handler: adminController.escalate },
  { method: 'GET',  pattern: '/api/admin/analytics', handler: adminController.analytics },
  { method: 'GET',  pattern: '/api/admin/users', handler: adminController.listUsers },
  { method: 'PUT',  pattern: '/api/admin/users/:id/active', handler: adminController.setUserActive },
  { method: 'GET',  pattern: '/api/admin/departments', handler: adminController.listDepartments },
  { method: 'POST', pattern: '/api/admin/departments', handler: adminController.createDepartment },
  { method: 'PUT',  pattern: '/api/admin/departments/:id', handler: adminController.updateDepartment },
  { method: 'DELETE', pattern: '/api/admin/departments/:id', handler: adminController.deleteDepartment },
  { method: 'GET',  pattern: '/api/admin/feedback', handler: adminController.listFeedback },
];
