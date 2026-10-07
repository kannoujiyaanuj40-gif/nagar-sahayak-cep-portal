function citizenSideNav(active) {
  const items = [
    ['dashboard', '📊', 'Dashboard'],
    ['my-complaints', '🗂️', 'My Complaints'],
    ['register-complaint', '📝', 'New Complaint'],
    ['notifications', '🔔', 'Notifications'],
    ['profile', '👤', 'Profile'],
  ];
  return `<nav class="side-nav">${items.map(([p, icon, label]) =>
    `<a href="#/${p}" class="${active === p ? 'active' : ''}">${icon} ${label}</a>`).join('')}</nav>`;
}

Pages.dashboard = async (root) => {
  const user = Auth.getUser();
  root.innerHTML = `<div class="section container"><div class="app-shell">${citizenSideNav('dashboard')}<div id="dashMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('dashMain');

  let complaints = [];
  try { complaints = await Api.get('/complaints/mine'); }
  catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

  const counts = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Department Assigned').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved: complaints.filter(c => ['Resolved', 'Closed'].includes(c.status)).length,
  };

  main.innerHTML = `
    <div class="dash-header">
      <div><h2 class="mb-0">Welcome, ${UI.escapeHtml(user.name.split(' ')[0])}</h2><p class="hint mb-0">Here's a summary of your complaints.</p></div>
      <a href="#/register-complaint" class="btn btn-primary">+ New Complaint</a>
    </div>
    <div class="grid grid-4 mb-3">
      <div class="card stat-card"><div class="num">${counts.total}</div><div class="label">Total Complaints</div></div>
      <div class="card stat-card"><div class="num">${counts.pending}</div><div class="label">Pending</div></div>
      <div class="card stat-card"><div class="num">${counts.inProgress}</div><div class="label">In Progress</div></div>
      <div class="card stat-card"><div class="num">${counts.resolved}</div><div class="label">Resolved</div></div>
    </div>
    <div class="card">
      <div class="flex-between"><h3 class="mb-0">Recent Complaints</h3><a href="#/my-complaints">View all →</a></div>
      ${complaints.length === 0 ? UI.emptyHtml('📭', 'No complaints yet', 'Register your first complaint to see it here.') : `
      <div class="table-wrap mt-2">
        <table>
          <thead><tr><th>ID</th><th>Category</th><th>Status</th><th>Expected</th><th></th></tr></thead>
          <tbody>
            ${complaints.slice(0, 5).map(c => `
              <tr class="clickable" onclick="location.hash='#/complaint/${c.complaint_id}'">
                <td>${c.complaint_id}</td>
                <td>${c.category_icon || ''} ${UI.escapeHtml(c.category_name || '')}</td>
                <td>${UI.statusBadge(c.status)}</td>
                <td>${UI.formatDate(c.expected_resolution_date)}</td>
                <td><a href="#/complaint/${c.complaint_id}">View →</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;
};
