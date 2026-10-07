const path = require('path');

module.exports = {
  PORT: process.env.PORT || 4000,
  DATA_FILE: path.join(__dirname, '..', 'data', 'db.json'),
  FRONTEND_DIR: path.join(__dirname, '..', '..', 'frontend'),
  UPLOADS_DIR: path.join(__dirname, '..', 'data', 'uploads'),
  TOKEN_TTL_MS: 1000 * 60 * 60 * 12, // 12 hours

  // SLA & escalation thresholds are read per-category from db.json (categories[].sla_days)
  // Escalation levels shown to citizens:
  ESCALATION_LEVELS: ['None', 'Ward / Department Team', 'Department Officer', 'Senior Officer / Admin'],

  // Placeholders for real integrations. This is an academic prototype, so these
  // are simulated (see notifications model). To connect a real provider:
  //  - SMS: plug in e.g. Twilio/MSG91 inside backend/models/notifications.js -> sendSms()
  //  - Email: plug in e.g. Nodemailer/SendGrid inside sendEmail()
  //  - Maps/GPS: replace the "Use current location" browser Geolocation API call in
  //    frontend/assets/js/pages/register-complaint.js with a real Maps JS API key.
  SMS_API_KEY: process.env.SMS_API_KEY || null,
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || null,
  MAPS_API_KEY: process.env.MAPS_API_KEY || null,
};
