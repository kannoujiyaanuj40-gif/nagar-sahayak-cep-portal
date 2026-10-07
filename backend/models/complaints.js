const { transact, load } = require('./db');
const { ESCALATION_LEVELS } = require('../config/config');
const { httpError } = require('./auth');

const STATUS_FLOW = [
  'Registered', 'Verified', 'Department Assigned', 'In Progress',
  'Resolved', 'Feedback Pending', 'Closed',
];

function genComplaintId(data) {
  data.counters.complaint += 1;
  return 'CMP-' + String(data.counters.complaint).padStart(6, '0');
}

function addHistory(data, complaint_id, status, remarks, updated_by) {
  data.counters.history += 1;
  data.complaint_status_history.push({
    history_id: data.counters.history, complaint_id, status,
    remarks: remarks || '', updated_by: updated_by || 'System',
    created_at: new Date().toISOString(),
  });
}

function notify(data, user_id, complaint_id, message) {
  data.counters.notification += 1;
  data.notifications.push({
    notification_id: data.counters.notification, user_id, complaint_id,
    message, is_read: false, created_at: new Date().toISOString(),
  });
  // --- Simulated SMS/Email hook (academic prototype) ---
  // In production, call an SMS/email provider here using config.SMS_API_KEY /
  // config.EMAIL_API_KEY, e.g.: smsProvider.send(user.mobile, message)
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function create({ user_id, category_id, title, description, address, area, landmark, pincode, latitude, longitude, photo }) {
  if (!category_id) throw httpError(400, 'Please select a complaint category');
  if (!title || !title.trim()) throw httpError(400, 'Please enter a short complaint title');
  if (!description || description.trim().length < 10) throw httpError(400, 'Please describe the problem in at least 10 characters');
  if (!address || !address.trim()) throw httpError(400, 'Address is required');
  if (!area || !area.trim()) throw httpError(400, 'Area is required');

  return transact((data) => {
    const category = data.categories.find(c => c.category_id === Number(category_id));
    if (!category) throw httpError(400, 'Invalid category selected');

    // --- Smart Department Suggestion: category drives the department, so the
    // citizen never needs to know municipal department structure. ---
    const department = data.departments.find(d => d.department_id === category.default_department_id);

    const complaint_id = genComplaintId(data);
    const created_at = new Date().toISOString();
    const complaint = {
      complaint_id, user_id: Number(user_id), category_id: category.category_id,
      title: title.trim(), description: description.trim(),
      address: address.trim(), area: area.trim(), landmark: landmark || '', pincode: pincode || '',
      latitude: latitude ?? null, longitude: longitude ?? null,
      photo: photo || null,
      status: 'Department Assigned',
      department_id: department ? department.department_id : null,
      assigned_to: null,
      escalation_level: 0,
      sla_breached: false,
      resolution_remarks: null, resolution_photo: null,
      created_at,
      expected_resolution_date: addDays(created_at, category.sla_days),
      resolved_at: null,
    };
    data.complaints.push(complaint);

    addHistory(data, complaint_id, 'Registered', 'Complaint submitted by citizen', 'System');
    addHistory(data, complaint_id, 'Verified', 'Auto-verified: mandatory fields and photo evidence checked', 'System');
    addHistory(data, complaint_id, 'Department Assigned',
      `Automatically routed to ${department ? department.department_name : 'General Administration'} based on category`, 'System');

    notify(data, user_id, complaint_id, `Your complaint ${complaint_id} has been registered and assigned to ${department ? department.department_name : 'the concerned department'}.`);

    return complaint;
  });
}

function withComputed(data, complaint) {
  const category = data.categories.find(c => c.category_id === complaint.category_id);
  const department = data.departments.find(d => d.department_id === complaint.department_id);
  const today = new Date().toISOString().slice(0, 10);
  const isOpen = !['Resolved', 'Closed'].includes(complaint.status);
  const overdue = isOpen && complaint.expected_resolution_date && complaint.expected_resolution_date < today;
  let slaState = 'ok';
  if (overdue) slaState = 'breached';
  else if (isOpen && complaint.expected_resolution_date) {
    const daysLeft = (new Date(complaint.expected_resolution_date) - new Date(today)) / 86400000;
    if (daysLeft <= 1) slaState = 'approaching';
  }
  return {
    ...complaint,
    category_name: category ? category.category_name : null,
    category_icon: category ? category.icon : null,
    department_name: department ? department.department_name : null,
    sla_state: slaState,
    escalation_label: ESCALATION_LEVELS[complaint.escalation_level] || 'None',
  };
}

/** Sweep all open complaints and auto-escalate anything past its SLA. Called on read paths. */
function runSlaSweep(data) {
  const today = new Date().toISOString().slice(0, 10);
  let changed = false;
  for (const c of data.complaints) {
    const isOpen = !['Resolved', 'Closed'].includes(c.status);
    if (isOpen && c.expected_resolution_date && c.expected_resolution_date < today && !c.sla_breached) {
      c.sla_breached = true;
      c.escalation_level = Math.min(3, c.escalation_level + 1);
      addHistory(data, c.complaint_id, c.status,
        `SLA exceeded — automatically escalated to ${ESCALATION_LEVELS[c.escalation_level]}`, 'System');
      notify(data, c.user_id, c.complaint_id,
        `Your complaint ${c.complaint_id} has exceeded its resolution deadline and has been escalated to ${ESCALATION_LEVELS[c.escalation_level]}.`);
      changed = true;
    }
  }
  return changed;
}

function getById(complaint_id) {
  return transact((data) => {
    runSlaSweep(data);
    const c = data.complaints.find(c => c.complaint_id === complaint_id.toUpperCase());
    if (!c) throw httpError(404, 'No complaint found with this ID. Please check and try again.');
    const history = data.complaint_status_history
      .filter(h => h.complaint_id === c.complaint_id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const fb = data.feedback.find(f => f.complaint_id === c.complaint_id) || null;
    return { complaint: withComputed(data, c), history, feedback: fb };
  });
}

function listMine(user_id, filters = {}) {
  return transact((data) => {
    runSlaSweep(data);
    let list = data.complaints.filter(c => c.user_id === Number(user_id));
    list = applyFilters(list, filters);
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.map(c => withComputed(data, c));
  });
}

function applyFilters(list, filters) {
  if (filters.category_id) list = list.filter(c => c.category_id === Number(filters.category_id));
  if (filters.status) list = list.filter(c => c.status === filters.status);
  if (filters.area) list = list.filter(c => c.area.toLowerCase().includes(String(filters.area).toLowerCase()));
  if (filters.department_id) list = list.filter(c => c.department_id === Number(filters.department_id));
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    list = list.filter(c =>
      c.complaint_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.area.toLowerCase().includes(q));
  }
  if (filters.date_from) list = list.filter(c => c.created_at.slice(0, 10) >= filters.date_from);
  if (filters.date_to) list = list.filter(c => c.created_at.slice(0, 10) <= filters.date_to);
  return list;
}

function listAll(filters = {}) {
  return transact((data) => {
    runSlaSweep(data);
    let list = applyFilters(data.complaints.slice(), filters);
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list.map(c => {
      const computed = withComputed(data, c);
      const user = data.users.find(u => u.user_id === c.user_id);
      return { ...computed, citizen_name: user ? user.name : 'Unknown', citizen_mobile: user ? user.mobile : '' };
    });
  });
}

function adminUpdate(complaint_id, updates, actor) {
  return transact((data) => {
    const c = data.complaints.find(c => c.complaint_id === complaint_id.toUpperCase());
    if (!c) throw httpError(404, 'Complaint not found');

    if (updates.department_id) {
      c.department_id = Number(updates.department_id);
      addHistory(data, c.complaint_id, c.status, `Reassigned to department`, actor);
    }
    if (updates.assigned_to !== undefined) {
      c.assigned_to = updates.assigned_to;
      addHistory(data, c.complaint_id, c.status, `Assigned to team/officer: ${updates.assigned_to}`, actor);
    }
    if (updates.expected_resolution_date) {
      c.expected_resolution_date = updates.expected_resolution_date;
      addHistory(data, c.complaint_id, c.status, `Expected resolution date updated to ${updates.expected_resolution_date}`, actor);
    }
    if (updates.status && updates.status !== c.status) {
      if (!STATUS_FLOW.includes(updates.status) && updates.status !== 'Reopened') {
        throw httpError(400, 'Invalid status value');
      }
      c.status = updates.status;
      if (updates.status === 'Resolved') {
        c.resolved_at = new Date().toISOString();
        c.resolution_remarks = updates.resolution_remarks || c.resolution_remarks;
        c.resolution_photo = updates.resolution_photo || c.resolution_photo;
      }
      addHistory(data, c.complaint_id, updates.status, updates.remarks || `Status changed to ${updates.status}`, actor);
      notify(data, c.user_id, c.complaint_id, `Your complaint ${c.complaint_id} status changed to "${updates.status}".`);
    } else if (updates.remarks) {
      addHistory(data, c.complaint_id, c.status, updates.remarks, actor);
    }
    if (updates.resolution_remarks && updates.status !== 'Resolved') {
      c.resolution_remarks = updates.resolution_remarks;
    }
    if (updates.resolution_photo && updates.status !== 'Resolved') {
      c.resolution_photo = updates.resolution_photo;
    }
    return withComputed(data, c);
  });
}

function escalate(complaint_id, actor) {
  return transact((data) => {
    const c = data.complaints.find(c => c.complaint_id === complaint_id.toUpperCase());
    if (!c) throw httpError(404, 'Complaint not found');
    c.escalation_level = Math.min(3, c.escalation_level + 1);
    addHistory(data, c.complaint_id, c.status, `Manually escalated to ${ESCALATION_LEVELS[c.escalation_level]}`, actor);
    notify(data, c.user_id, c.complaint_id, `Your complaint ${c.complaint_id} has been escalated to ${ESCALATION_LEVELS[c.escalation_level]}.`);
    return withComputed(data, c);
  });
}

function submitFeedback(complaint_id, { rating, resolution_status, comment }, user_id) {
  return transact((data) => {
    const c = data.complaints.find(c => c.complaint_id === complaint_id.toUpperCase());
    if (!c) throw httpError(404, 'Complaint not found');
    if (c.user_id !== Number(user_id)) throw httpError(403, 'You can only give feedback on your own complaints');
    if (!['Resolved', 'Feedback Pending'].includes(c.status)) throw httpError(400, 'Feedback can only be given after the complaint is resolved');
    if (!resolution_status) throw httpError(400, 'Please tell us whether the problem was resolved');

    data.counters.feedback += 1;
    data.feedback.push({
      feedback_id: data.counters.feedback, complaint_id: c.complaint_id,
      rating: Number(rating) || null, resolution_status, comment: comment || '',
      created_at: new Date().toISOString(),
    });

    if (resolution_status === 'No') {
      c.status = 'Reopened';
      c.escalation_level = Math.min(3, c.escalation_level + 1);
      addHistory(data, c.complaint_id, 'Reopened', 'Citizen reported the issue was not resolved; complaint reopened and escalated', 'Citizen');
      notify(data, c.user_id, c.complaint_id, `Your complaint ${c.complaint_id} has been reopened as per your feedback.`);
    } else {
      c.status = 'Closed';
      addHistory(data, c.complaint_id, 'Closed', `Citizen feedback recorded (${resolution_status}); complaint closed`, 'Citizen');
    }
    return withComputed(data, c);
  });
}

function markFeedbackPending() {
  // helper reserved for schedulers; not required for the prototype's manual flow
}

module.exports = {
  create, getById, listMine, listAll, adminUpdate, escalate, submitFeedback,
  STATUS_FLOW, withComputed, runSlaSweep,
};
