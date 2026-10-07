Pages.adminComplaints = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin/complaints')}<div id="acMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('acMain');

  let categories = [], departments = [];
  try {
    [categories, departments] = await Promise.all([Api.get('/categories'), Api.get('/departments')]);
  } catch (e) {}

  const statuses = ['Registered','Verified','Department Assigned','In Progress','Resolved','Feedback Pending','Closed','Reopened'];

  main.innerHTML = `
    <div class="dash-header"><h2 class="mb-0">All Complaints</h2></div>
    <div class="filter-bar card">
      <input type="text" id="fq" placeholder="Search ID, title, area…" style="min-width:200px;" />
      <select id="fCategory"><option value="">All Categories</option>${categories.map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join('')}</select>
      <select id="fDepartment"><option value="">All Departments</option>${departments.map(d => `<option value="${d.department_id}">${d.department_name}</option>`).join('')}</select>
      <select id="fStatus"><option value="">All Statuses</option>${statuses.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
      <input type="date" id="fFrom" title="From date" />
      <input type="date" id="fTo" title="To date" />
      <button class="btn btn-outline btn-sm" id="clearFilters">Clear</button>
    </div>
    <div id="listWrap">${UI.loadingHtml()}</div>`;

  async function load() {
    const query = new URLSearchParams();
    const q = document.getElementById('fq').value.trim();
    const category_id = document.getElementById('fCategory').value;
    const department_id = document.getElementById('fDepartment').value;
    const status = document.getElementById('fStatus').value;
    const date_from = document.getElementById('fFrom').value;
    const date_to = document.getElementById('fTo').value;
    if (q) query.set('q', q);
    if (category_id) query.set('category_id', category_id);
    if (department_id) query.set('department_id', department_id);
    if (status) query.set('status', status);
    if (date_from) query.set('date_from', date_from);
    if (date_to) query.set('date_to', date_to);

    const wrap = document.getElementById('listWrap');
    wrap.innerHTML = UI.loadingHtml();
    try {
      const list = await Api.get('/admin/complaints?' + query.toString());
      wrap.innerHTML = list.length === 0 ? UI.emptyHtml('📭', 'No complaints match these filters') : `
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Citizen</th><th>Category</th><th>Area</th><th>Department</th><th>Status</th><th>SLA</th><th>Expected</th><th></th></tr></thead>
          <tbody>
            ${list.map(c => `
              <tr class="clickable" onclick="location.hash='#/admin/complaints/${c.complaint_id}'">
                <td>${c.complaint_id}</td>
                <td>${UI.escapeHtml(c.citizen_name)}</td>
                <td>${c.category_icon || ''} ${UI.escapeHtml(c.category_name || '')}</td>
                <td>${UI.escapeHtml(c.area)}</td>
                <td>${UI.escapeHtml(c.department_name || '—')}</td>
                <td>${UI.statusBadge(c.status)}</td>
                <td>${UI.slaBadge(c.sla_state)}</td>
                <td>${UI.formatDate(c.expected_resolution_date)}</td>
                <td><a href="#/admin/complaints/${c.complaint_id}">Manage →</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <p class="hint mt-1">${list.length} complaint(s) found</p>`;
    } catch (err) {
      wrap.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  }

  ['fCategory', 'fDepartment', 'fStatus', 'fFrom', 'fTo'].forEach(id => document.getElementById(id).addEventListener('change', load));
  document.getElementById('fq').addEventListener('input', debounce(load, 350));
  document.getElementById('clearFilters').addEventListener('click', () => {
    ['fq','fCategory','fDepartment','fStatus','fFrom','fTo'].forEach(id => document.getElementById(id).value = '');
    load();
  });

  load();
};
