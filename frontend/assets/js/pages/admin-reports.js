Pages.adminReports = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin/reports')}<div id="arMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('arMain');

  let a;
  try { a = await Api.get('/admin/analytics'); }
  catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

  main.innerHTML = `
    <div class="dash-header"><h2 class="mb-0">Reports &amp; Analytics</h2></div>
    <div class="grid grid-4 mb-3">
      <div class="card stat-card"><div class="num">${a.total}</div><div class="label">Total Complaints</div></div>
      <div class="card stat-card"><div class="num">${a.avgResolutionDays}</div><div class="label">Avg. Resolution (days)</div></div>
      <div class="card stat-card"><div class="num">${a.avgRating ?? '—'}</div><div class="label">Avg. Citizen Rating</div></div>
      <div class="card stat-card"><div class="num" style="color:var(--red-600)">${a.slaBreached}</div><div class="label">SLA Breached</div></div>
    </div>
    <div class="grid grid-2">
      <div class="card"><h4>Category-wise Complaints</h4>${barChart(a.byCategory)}</div>
      <div class="card"><h4>Status-wise Complaints</h4>${barChart(a.byStatus)}</div>
    </div>
    <div class="grid grid-2 mt-2">
      <div class="card"><h4>Area-wise Complaints</h4>${barChart(a.byArea)}</div>
      <div class="card"><h4>Department-wise Complaints</h4>${barChart(a.byDepartment)}</div>
    </div>
    <div class="card mt-2">
      <h4>Monthly Complaint Trend</h4>
      ${barChart(a.byMonth)}
    </div>`;
};
