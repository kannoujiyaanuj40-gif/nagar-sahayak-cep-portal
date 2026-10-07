const crypto = require('crypto');
const { transact, hashPassword } = require('./db');
const { TOKEN_TTL_MS } = require('../config/config');

function isValidMobile(mobile) {
  return /^[6-9]\d{9}$/.test(String(mobile || '').trim());
}
function isValidEmail(email) {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPassword(pw) {
  return typeof pw === 'string' && pw.length >= 6;
}

function register({ name, mobile, email, password, address }) {
  if (!name || !name.trim()) throw httpError(400, 'Name is required');
  if (!isValidMobile(mobile)) throw httpError(400, 'Enter a valid 10-digit mobile number');
  if (!isValidEmail(email)) throw httpError(400, 'Enter a valid email address');
  if (!isValidPassword(password)) throw httpError(400, 'Password must be at least 6 characters');

  return transact((data) => {
    if (data.users.some(u => u.mobile === mobile)) {
      throw httpError(409, 'An account with this mobile number already exists');
    }
    if (email && data.users.some(u => u.email === email)) {
      throw httpError(409, 'An account with this email already exists');
    }
    const user_id = ++data.counters.user;
    const user = {
      user_id, name: name.trim(), mobile, email: email || null,
      password_hash: hashPassword(password), address: address || '',
      role: 'citizen', is_active: true, created_at: new Date().toISOString(),
    };
    data.users.push(user);
    const token = issueToken(data, user_id);
    return { user: publicUser(user), token };
  });
}

function login({ mobile, password }) {
  if (!mobile || !password) throw httpError(400, 'Mobile number and password are required');
  return transact((data) => {
    const user = data.users.find(u => u.mobile === mobile);
    if (!user || user.password_hash !== hashPassword(password)) {
      throw httpError(401, 'Invalid mobile number or password');
    }
    if (!user.is_active) throw httpError(403, 'This account has been deactivated');
    const token = issueToken(data, user.user_id);
    return { user: publicUser(user), token };
  });
}

function issueToken(data, user_id) {
  const token = crypto.randomBytes(24).toString('hex');
  data.tokens[token] = { user_id, expires: Date.now() + TOKEN_TTL_MS };
  return token;
}

function verifyToken(token) {
  if (!token) return null;
  const data = require('./db').load();
  const entry = data.tokens[token];
  if (!entry || entry.expires < Date.now()) return null;
  const user = data.users.find(u => u.user_id === entry.user_id);
  if (!user || !user.is_active) return null;
  return user;
}

function publicUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { register, login, verifyToken, publicUser, isValidMobile, isValidEmail, httpError };
