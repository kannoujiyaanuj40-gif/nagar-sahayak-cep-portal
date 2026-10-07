/**
 * server.js — vanilla Node.js HTTP server (no external dependencies).
 *
 * WHY VANILLA NODE INSTEAD OF EXPRESS?
 * See README.md "Technology Note" for the full explanation. In short: this
 * build environment has no package registry access, so `npm install` cannot
 * run here. Everything below is implemented with only Node's built-in
 * modules so the project runs with just `node backend/server.js` — no
 * install step needed. The route table, controller and model layering is
 * deliberately kept identical in shape to a typical Express app, so porting
 * to Express + mysql2 (instructions in README.md) is a mechanical exercise,
 * not a redesign.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { PORT, FRONTEND_DIR, UPLOADS_DIR } = require('./config/config');
const routes = require('./routes/routes');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml; charset=utf-8', '.ico': 'image/x-icon',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Access-Control-Allow-Origin': '*', ...headers });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), { 'Content-Type': 'application/json; charset=utf-8' });
}

function matchRoute(method, pathname) {
  const pathSegments = pathname.split('/').filter(Boolean);
  for (const route of routes) {
    if (route.method !== method) continue;
    const routeSegments = route.pattern.split('/').filter(Boolean);
    if (routeSegments.length !== pathSegments.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i], ps = pathSegments[i];
      if (rs.startsWith(':')) params[rs.slice(1)] = decodeURIComponent(ps);
      else if (rs !== ps) { ok = false; break; }
    }
    if (ok) return { route, params };
  }
  return null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) { // 8MB cap (covers base64 photo payloads)
        reject(Object.assign(new Error('Request body too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')));
      } catch (e) {
        reject(Object.assign(new Error('Invalid JSON in request body'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  let baseDir = FRONTEND_DIR;
  let relPath = pathname;
  if (pathname.startsWith('/uploads/')) {
    baseDir = UPLOADS_DIR;
    relPath = pathname.replace('/uploads/', '/');
  }
  let filePath = path.join(baseDir, decodeURIComponent(relPath));

  // Prevent path traversal
  if (!filePath.startsWith(baseDir)) {
    return send(res, 403, 'Forbidden');
  }
  if (pathname === '/' || (!path.extname(filePath) && baseDir === FRONTEND_DIR)) {
    filePath = path.join(FRONTEND_DIR, 'index.html'); // SPA fallback for client-side routes
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (baseDir === FRONTEND_DIR) {
        fs.readFile(path.join(FRONTEND_DIR, 'index.html'), (err2, fallback) => {
          if (err2) return send(res, 404, 'Not found');
          send(res, 200, fallback, { 'Content-Type': 'text/html; charset=utf-8' });
        });
      } else {
        send(res, 404, 'Not found');
      }
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, content, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (req.method === 'OPTIONS') {
    return send(res, 204, '', {
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
  }

  if (!pathname.startsWith('/api/')) {
    return serveStatic(req, res, pathname);
  }

  const matched = matchRoute(req.method, pathname);
  if (!matched) return sendJson(res, 404, { error: 'API route not found' });

  try {
    const body = ['POST', 'PUT', 'DELETE'].includes(req.method) ? await readBody(req) : {};
    req.body = body;
    const { status, body: responseBody } = await matched.route.handler(req, matched.params, parsed.query);
    sendJson(res, status, responseBody);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    sendJson(res, status, { error: err.message || 'Something went wrong. Please try again.' });
  }
});

server.listen(PORT, () => {
  console.log(`\n  Complaint Registration Management Portal`);
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  API base:          http://localhost:${PORT}/api`);
  console.log(`  Demo citizen login: 9876543210 / Demo@1234`);
  console.log(`  Demo admin login:   9999999999 / Admin@1234\n`);
});
