/* app.js — hash router. Each page module registers a render function on
   window.Pages (initialised in a tiny inline script before the page
   modules load); this file matches the URL, guards auth, and mounts it. */
const Pages = window.Pages;

const ROUTES = [
  { path: '/', page: 'home' },
  { path: '/about', page: 'about' },
  { path: '/how-it-works', page: 'howItWorks' },
  { path: '/categories', page: 'categories' },
  { path: '/research', page: 'research' },
  { path: '/faq', page: 'faq' },
  { path: '/contact', page: 'contact' },

  { path: '/login', page: 'login' },
  { path: '/register', page: 'registerUser' },

  { path: '/register-complaint', page: 'registerComplaint', auth: 'citizen' },
  { path: '/track', page: 'track' },
  { path: '/track/:id', page: 'track' },

  { path: '/dashboard', page: 'dashboard', auth: 'citizen' },
  { path: '/my-complaints', page: 'myComplaints', auth: 'citizen' },
  { path: '/complaint/:id', page: 'complaintDetails', auth: 'citizen' },
  { path: '/notifications', page: 'notifications', auth: 'citizen' },
  { path: '/profile', page: 'profile', auth: 'citizen' },

  { path: '/admin-login', page: 'adminLogin' },
  { path: '/admin', page: 'adminDashboard', auth: 'admin' },
  { path: '/admin/complaints', page: 'adminComplaints', auth: 'admin' },
  { path: '/admin/complaints/:id', page: 'adminComplaintDetails', auth: 'admin' },
  { path: '/admin/departments', page: 'adminDepartments', auth: 'admin' },
  { path: '/admin/users', page: 'adminUsers', auth: 'admin' },
  { path: '/admin/feedback', page: 'adminFeedback', auth: 'admin' },
  { path: '/admin/reports', page: 'adminReports', auth: 'admin' },
];

function matchRoute(hash) {
  const clean = (hash || '#/').replace(/^#/, '') || '/';
  const [pathOnly, queryStr] = clean.split('?');
  const segs = pathOnly.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryStr || ''));

  for (const route of ROUTES) {
    const rsegs = route.path.split('/').filter(Boolean);
    if (rsegs.length !== segs.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < rsegs.length; i++) {
      if (rsegs[i].startsWith(':')) params[rsegs[i].slice(1)] = decodeURIComponent(segs[i]);
      else if (rsegs[i] !== segs[i]) { ok = false; break; }
    }
    if (ok) return { route, params, query };
  }
  return null;
}

function setActiveNav(pathOnly) {
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    a.classList.toggle('active', href === '#' + pathOnly);
  });
}

async function router() {
  const app = document.getElementById('app');
  const matched = matchRoute(location.hash);

  document.getElementById('mainNav').classList.remove('open');
  UI.renderHeaderAuth();

  if (!matched) {
    app.innerHTML = `<div class="section container text-center">
      <h2>Page not found</h2><p>The page you're looking for doesn't exist.</p>
      <a class="btn btn-primary" href="#/">Go Home</a></div>`;
    window.scrollTo(0, 0);
    return;
  }

  const { route, params, query } = matched;

  if (route.auth === 'citizen' && !Auth.isLoggedIn()) {
    UI.toast('Please log in to continue', 'error');
    location.hash = '#/login';
    return;
  }
  if (route.auth === 'admin' && !Auth.isAdmin()) {
    UI.toast('Admin login required', 'error');
    location.hash = '#/admin-login';
    return;
  }

  const renderFn = Pages[route.page];
  app.innerHTML = UI.loadingHtml();
  try {
    if (typeof renderFn === 'function') {
      await renderFn(app, params, query);
    } else {
      app.innerHTML = `<div class="section container">Page under construction.</div>`;
    }
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="section container"><div class="alert alert-error">${UI.escapeHtml(err.message || 'Something went wrong.')}</div></div>`;
  }
  setActiveNav('/' + (route.path.split('/')[1] || ''));
  app.focus();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navToggle').addEventListener('click', () => {
    const nav = document.getElementById('mainNav');
    const open = nav.classList.toggle('open');
    document.getElementById('navToggle').setAttribute('aria-expanded', open);
  });
  router();
});
