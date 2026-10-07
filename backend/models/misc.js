const { transact, load } = require('./db');
const { httpError } = require('./auth');

// ---------------------------------------------------------------- Notifications
function listNotifications(user_id) {
  return transact((data) => {
    return data.notifications
      .filter(n => n.user_id === Number(user_id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  });
}
function markRead(notification_id, user_id) {
  return transact((data) => {
    const n = data.notifications.find(n => n.notification_id === Number(notification_id) && n.user_id === Number(user_id));
    if (!n) throw httpError(404, 'Notification not found');
    n.is_read = true;
    return n;
  });
}
function markAllRead(user_id) {
  return transact((data) => {
    data.notifications.filter(n => n.user_id === Number(user_id)).forEach(n => n.is_read = true);
    return true;
  });
}

// ---------------------------------------------------------------- Departments
function listDepartments() {
  return load().departments;
}
function createDepartment({ department_name, description }) {
  if (!department_name || !department_name.trim()) throw httpError(400, 'Department name is required');
  return transact((data) => {
    const department_id = Math.max(0, ...data.departments.map(d => d.department_id)) + 1;
    const dept = { department_id, department_name: department_name.trim(), description: description || '' };
    data.departments.push(dept);
    return dept;
  });
}
function updateDepartment(department_id, { department_name, description }) {
  return transact((data) => {
    const d = data.departments.find(d => d.department_id === Number(department_id));
    if (!d) throw httpError(404, 'Department not found');
    if (department_name) d.department_name = department_name;
    if (description !== undefined) d.description = description;
    return d;
  });
}
function deleteDepartment(department_id) {
  return transact((data) => {
    const inUse = data.complaints.some(c => c.department_id === Number(department_id));
    if (inUse) throw httpError(400, 'Cannot delete a department that has complaints assigned to it');
    data.departments = data.departments.filter(d => d.department_id !== Number(department_id));
    return true;
  });
}

// ---------------------------------------------------------------- Categories
function listCategories() {
  return load().categories;
}

// ---------------------------------------------------------------- Users (admin)
function listUsers() {
  return load().users.map(({ password_hash, ...rest }) => rest);
}
function setUserActive(user_id, is_active) {
  return transact((data) => {
    const u = data.users.find(u => u.user_id === Number(user_id));
    if (!u) throw httpError(404, 'User not found');
    if (u.role === 'admin') throw httpError(400, 'Cannot deactivate an admin account');
    u.is_active = !!is_active;
    return u;
  });
}
function updateProfile(user_id, { name, email, address }) {
  return transact((data) => {
    const u = data.users.find(u => u.user_id === Number(user_id));
    if (!u) throw httpError(404, 'User not found');
    if (name) u.name = name;
    if (email !== undefined) u.email = email;
    if (address !== undefined) u.address = address;
    const { password_hash, ...rest } = u;
    return rest;
  });
}

// ---------------------------------------------------------------- Analytics
function analytics() {
  const data = load();
  require('./complaints').runSlaSweep(data);
  const complaints = data.complaints;
  const byStatus = {};
  const byCategory = {};
  const byDepartment = {};
  const byArea = {};
  const byMonth = {};
  let totalResolutionDays = 0, resolvedCount = 0;
  let ratingSum = 0, ratingCount = 0;

  for (const c of complaints) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    const cat = data.categories.find(x => x.category_id === c.category_id);
    const catName = cat ? cat.category_name : 'Other';
    byCategory[catName] = (byCategory[catName] || 0) + 1;
    const dep = data.departments.find(x => x.department_id === c.department_id);
    const depName = dep ? dep.department_name : 'Unassigned';
    byDepartment[depName] = (byDepartment[depName] || 0) + 1;
    byArea[c.area] = (byArea[c.area] || 0) + 1;
    const month = c.created_at.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
    if (c.resolved_at) {
      totalResolutionDays += (new Date(c.resolved_at) - new Date(c.created_at)) / 86400000;
      resolvedCount++;
    }
  }
  for (const f of data.feedback) {
    if (f.rating) { ratingSum += f.rating; ratingCount++; }
  }

  return {
    total: complaints.length,
    new: complaints.filter(c => c.status === 'Registered' || c.status === 'Verified').length,
    pending: complaints.filter(c => c.status === 'Department Assigned').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
    slaBreached: complaints.filter(c => c.sla_breached).length,
    escalated: complaints.filter(c => c.escalation_level > 0).length,
    reopened: complaints.filter(c => c.status === 'Reopened').length,
    byStatus, byCategory, byDepartment, byArea, byMonth,
    avgResolutionDays: resolvedCount ? +(totalResolutionDays / resolvedCount).toFixed(1) : 0,
    avgRating: ratingCount ? +(ratingSum / ratingCount).toFixed(1) : null,
  };
}

module.exports = {
  listNotifications, markRead, markAllRead,
  listDepartments, createDepartment, updateDepartment, deleteDepartment,
  listCategories, listUsers, setUserActive, updateProfile, analytics,
};
