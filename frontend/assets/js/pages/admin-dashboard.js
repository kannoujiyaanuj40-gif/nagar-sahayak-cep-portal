function adminSideNav(active) {
  const items = [
    ['admin', '📊', 'Dashboard'],
    ['admin/complaints', '🗂️', 'All Complaints'],
    ['admin/departments', '🏢', 'Departments'],
    ['admin/users', '👥', 'Users'],
    ['admin/feedback', '⭐', 'Feedback'],
    ['admin/reports', '📈', 'Reports & Analytics'],
  ];
  return `<nav class="side-nav">${items.map(([p, icon, label]) =>
    `<a href="#/${p}" class="${active === p ? 'active' : ''}">${icon} ${label}</a>`).join('')}</nav>`;
}

Pages.adminDashboard = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin')}<div id="adMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('adMain');

  let a;
  try { a = await Api.get('/admin/analytics'); }
  catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

  main.innerHTML = `
    <div class="dash-header"><h2 class="mb-0">Admin Dashboard</h2><a href="#/admin/complaints" class="btn btn-primary">Manage Complaints</a></div>
    <div class="grid grid-4 mb-2">
      <div class="card stat-card"><div class="num">${a.total}</div><div class="label">Total Complaints</div></div>
      <div class="card stat-card"><div class="num">${a.new}</div><div class="label">New</div></div>
      <div class="card stat-card"><div class="num">${a.pending}</div><div class="label">Pending</div></div>
      <div class="card stat-card"><div class="num">${a.inProgress}</div><div class="label">In Progress</div></div>
    </div>
    <div class="grid grid-4 mb-3">
      <div class="card stat-card"><div class="num">${a.resolved}</div><div class="label">Resolved</div></div>
      <div class="card stat-card"><div class="num" style="color:var(--red-600)">${a.slaBreached}</div><div class="label">SLA Breached</div></div>
      <div class="card stat-card"><div class="num" style="color:var(--amber-600)">${a.escalated}</div><div class="label">Escalated</div></div>
      <div class="card stat-card"><div class="num">${a.reopened}</div><div class="label">Reopened</div></div>
    </div>
    <div class="grid grid-2">
      <div class="card">
        <h4>Complaints by Category</h4>
        ${barChart(a.byCategory)}
      </div>
      <div class="card">
        <h4>Complaints by Status</h4>
        ${barChart(a.byStatus)}
      </div>
    </div>
    <div class="grid grid-2 mt-2">
      <div class="card stat-card"><div class="num">${a.avgResolutionDays}</div><div class="label">Avg. Resolution Time (days)</div></div>
      <div class="card stat-card"><div class="num">${a.avgRating ?? '—'}</div><div class="label">Avg. Citizen Rating</div></div>
    </div>`;
};

function barChart(obj) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return `<p class="hint">No data yet.</p>`;
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return `<div class="bar-chart">${entries.map(([k, v]) => `
    <div class="bar-row">
      <span>${UI.escapeHtml(k)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(v / max) * 100}%"></div></div>
      <span>${v}</span>
    </div>`).join('')}</div>`;
}
