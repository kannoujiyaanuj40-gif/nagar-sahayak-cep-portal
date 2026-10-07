/* ui.js — small shared UI helpers used across all page modules */
const UI = (() => {

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function toast(message, type = '') {
    const root = document.getElementById('toastRoot');
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }

  function formatDate(iso, withTime) {
    if (!iso) return '—';
    const d = new Date(iso);
    const opts = { day: '2-digit', month: 'short', year: 'numeric' };
    if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
    return d.toLocaleDateString('en-IN', opts);
  }

  function daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function statusBadge(status) {
    const map = {
      'Registered': 'badge-grey', 'Verified': 'badge-blue', 'Department Assigned': 'badge-blue',
      'In Progress': 'badge-amber', 'Resolved': 'badge-green', 'Feedback Pending': 'badge-amber',
      'Closed': 'badge-green', 'Reopened': 'badge-red',
    };
    return `<span class="badge ${map[status] || 'badge-grey'}">${escapeHtml(status)}</span>`;
  }

  function slaBadge(sla_state) {
    if (sla_state === 'breached') return `<span class="badge badge-red">🔴 SLA exceeded</span>`;
    if (sla_state === 'approaching') return `<span class="badge badge-amber">⚠️ Deadline approaching</span>`;
    return `<span class="badge badge-green">On track</span>`;
  }

  function avatarInitial(name) {
    return (name || '?').trim().charAt(0).toUpperCase();
  }

  function confirmModal({ title, message, confirmText = 'Confirm', danger = false }) {
    return new Promise((resolve) => {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(message)}</p>
          <div class="modal-actions">
            <button class="btn btn-outline" data-act="cancel">Cancel</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${escapeHtml(confirmText)}</button>
          </div>
        </div>`;
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop || e.target.dataset.act === 'cancel') { backdrop.remove(); resolve(false); }
        if (e.target.dataset.act === 'ok') { backdrop.remove(); resolve(true); }
      });
    });
  }

  function loadingHtml(label = 'Loading…') {
    return `<div class="loading-state"><div class="spinner"></div>${escapeHtml(label)}</div>`;
  }

  function emptyHtml(emoji, title, sub = '') {
    return `<div class="empty-state"><div class="emoji">${emoji}</div><h4>${escapeHtml(title)}</h4><p>${escapeHtml(sub)}</p></div>`;
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderHeaderAuth() {
    const el = document.getElementById('navAuth');
    const user = Auth.getUser();
    if (!user) {
      // Only the citizen login is shown here — admin sign-in is a discreet
      // link in the footer, not something offered to every visitor.
      el.innerHTML = `
        <a href="#/login" class="btn btn-ghost btn-sm">Citizen Login</a>`;
      return;
    }
    if (user.role === 'admin') {
      // Admins can jump between the admin panel and the citizen-facing
      // dashboard from the same header.
      el.innerHTML = `
        <a href="#/admin" class="btn btn-ghost btn-sm">Admin Panel</a>
        <a href="#/dashboard" class="btn btn-ghost btn-sm">My Dashboard</a>
        <button class="btn btn-accent btn-sm" id="logoutBtn">Logout</button>`;
    } else {
      el.innerHTML = `
        <a href="#/dashboard" class="btn btn-ghost btn-sm">My Dashboard</a>
        <button class="btn btn-accent btn-sm" id="logoutBtn">Logout</button>`;
    }
    document.getElementById('logoutBtn').addEventListener('click', () => {
      Auth.clearSession();
      toast('You have been logged out');
      location.hash = '#/';
      renderHeaderAuth();
    });
  }

  return {
    escapeHtml, toast, formatDate, daysBetween, statusBadge, slaBadge, avatarInitial,
    confirmModal, loadingHtml, emptyHtml, fileToDataUrl, renderHeaderAuth,
  };
})();
