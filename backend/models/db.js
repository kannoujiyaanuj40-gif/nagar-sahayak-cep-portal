/**
 * db.js — lightweight JSON-file data store.
 *
 * WHY NOT A REAL MYSQL CONNECTION HERE?
 * This prototype is built to run instantly on any machine with only Node.js
 * installed — no MySQL server setup, no `npm install` required (see README
 * "Technology Note" for the full reasoning). The table shapes below are a
 * 1:1 mirror of database/schema.sql, so migrating this module to use the
 * `mysql2` driver later is a mechanical swap: each function here becomes a
 * parameterised SQL query against the same columns.
 *
 * Every other file in backend/ (controllers, routes) talks ONLY to this
 * module, never to the file system directly — that is the swap boundary.
 */
const fs = require('fs');
const path = require('path');
const { DATA_FILE, UPLOADS_DIR } = require('../config/config');

function seed() {
  const now = new Date().toISOString();
  return {
    users: [
      { user_id: 1, name: 'Rahul Sharma', mobile: '9876543210', email: 'rahul.demo@example.com',
        password_hash: hashPassword('Demo@1234'), address: 'Sector 12, Kharghar', role: 'citizen',
        is_active: true, created_at: now },
      { user_id: 2, name: 'Priya Deshmukh', mobile: '9876500000', email: 'priya.demo@example.com',
        password_hash: hashPassword('Demo@1234'), address: 'FC Road, Pune', role: 'citizen',
        is_active: true, created_at: now },
      { user_id: 3, name: 'Municipal Admin', mobile: '9999999999', email: 'admin@example.com',
        password_hash: hashPassword('Admin@1234'), address: 'Municipal Office', role: 'admin',
        is_active: true, created_at: now },
    ],
    departments: [
      { department_id: 1, department_name: 'Solid Waste Management', description: 'Garbage collection, dumping and cleanliness' },
      { department_id: 2, department_name: 'Water Supply', description: 'Drinking water supply issues' },
      { department_id: 3, department_name: 'Drainage', description: 'Drainage and sewage related issues' },
      { department_id: 4, department_name: 'Roads', description: 'Road damage and pothole repairs' },
      { department_id: 5, department_name: 'Street Lighting', description: 'Street light repair and maintenance' },
      { department_id: 6, department_name: 'Garden / Parks', description: 'Public gardens and tree related issues' },
      { department_id: 7, department_name: 'Building Department', description: 'Illegal construction / building safety' },
      { department_id: 8, department_name: 'Public Health', description: 'Stray animal and public health issues' },
      { department_id: 9, department_name: 'Encroachment / Traffic', description: 'Encroachment and traffic civic issues' },
      { department_id: 10, department_name: 'General Administration', description: 'Miscellaneous complaints' },
    ],
    categories: [
      { category_id: 1, category_name: 'Garbage', icon: '🗑️', description: 'Uncollected garbage, littering, open dumping', default_department_id: 1, sla_days: 3 },
      { category_id: 2, category_name: 'Road / Pothole', icon: '🛣️', description: 'Damaged roads, potholes, broken footpaths', default_department_id: 4, sla_days: 10 },
      { category_id: 3, category_name: 'Water Supply', icon: '💧', description: 'No water supply, low pressure, contaminated water', default_department_id: 2, sla_days: 2 },
      { category_id: 4, category_name: 'Drainage', icon: '🚰', description: 'Blocked drains, sewage overflow', default_department_id: 3, sla_days: 3 },
      { category_id: 5, category_name: 'Street Light', icon: '💡', description: 'Non-functional or damaged street lights', default_department_id: 5, sla_days: 5 },
      { category_id: 6, category_name: 'Tree / Park', icon: '🌳', description: 'Fallen trees, damaged park equipment', default_department_id: 6, sla_days: 5 },
      { category_id: 7, category_name: 'Building Issue', icon: '🏢', description: 'Illegal construction, unsafe structures', default_department_id: 7, sla_days: 15 },
      { category_id: 8, category_name: 'Stray Animal', icon: '🐕', description: 'Stray dogs/cattle causing nuisance or danger', default_department_id: 8, sla_days: 5 },
      { category_id: 9, category_name: 'Traffic / Civic Issue', icon: '🚦', description: 'Encroachment, illegal parking, obstruction', default_department_id: 9, sla_days: 7 },
      { category_id: 10, category_name: 'Other', icon: '📌', description: 'Any other municipal civic issue', default_department_id: 10, sla_days: 7 },
    ],
    complaints: [],
    complaint_status_history: [],
    feedback: [],
    notifications: [],
    tokens: {}, // token -> { user_id, expires }
    counters: { complaint: 100, user: 3, history: 0, feedback: 0, notification: 0 },
  };
}

const crypto = require('crypto');
function hashPassword(password) {
  const salt = 'cep-portal-static-salt'; // fine for an academic prototype; use per-user salts in production
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

function load() {
  if (!fs.existsSync(DATA_FILE)) {
    save(seed());
  }
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function save(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/** Run a mutation against the store: fn(data) may mutate `data`; result is returned and file is persisted. */
function transact(fn) {
  const data = load();
  const result = fn(data);
  save(data);
  return result;
}

module.exports = { load, save, transact, seed, hashPassword };
