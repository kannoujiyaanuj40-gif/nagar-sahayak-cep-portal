const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { UPLOADS_DIR } = require('../config/config');

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

/**
 * Accepts a data URL (data:image/png;base64,....), validates type/size, writes
 * it to backend/data/uploads and returns a public URL path served by the app.
 */
function saveBase64Photo(dataUrl) {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    const err = new Error('Invalid photo format. Please upload a JPG, PNG, WEBP or GIF image.');
    err.status = 400;
    throw err;
  }
  const mime = match[1];
  const ext = ALLOWED[mime];
  if (!ext) {
    const err = new Error('Unsupported image type. Allowed: JPG, PNG, WEBP, GIF.');
    err.status = 400;
    throw err;
  }
  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) {
    const err = new Error('Image is too large. Maximum size is 5MB.');
    err.status = 400;
    throw err;
  }
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const filename = crypto.randomBytes(10).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return '/uploads/' + filename;
}

module.exports = { saveBase64Photo };
