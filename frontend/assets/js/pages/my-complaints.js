Pages.myComplaints = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${citizenSideNav('my-complaints')}<div id="mcMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('mcMain');

  let categories = [];
  try { categories = await Api.get('/categories'); } catch (e) {}

  const statuses = ['Registered','Verified','Department Assigned','In Progress','Resolved','Feedback Pending','Closed','Reopened'];

  main.innerHTML = `
    <div class="dash-header"><h2 class="mb-0">My Complaints</h2></div>
    <div class="filter-bar card">
      <select id="fCategory"><option value="">All Categories</option>${categories.map(c => `<option value="${c.category_id}">${c.category_name}</option>`).join('')}</select>
      <select id="fStatus"><option value="">All Statuses</option>${statuses.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
      <input type="text" id="fArea" placeholder="Filter by area" />
      <button class="btn btn-outline btn-sm" id="clearFilters">Clear</button>
    </div>
    <div id="listWrap">${UI.loadingHtml()}</div>`;

  async function load() {
    const query = new URLSearchParams();
    const category_id = document.getElementById('fCategory').value;
    const status = document.getElementById('fStatus').value;
    const area = document.getElementById('fArea').value.trim();
    if (category_id) query.set('category_id', category_id);
    if (status) query.set('status', status);
    if (area) query.set('area', area);

    const wrap = document.getElementById('listWrap');
    wrap.innerHTML = UI.loadingHtml();
    try {
      const list = await Api.get('/complaints/mine?' + query.toString());
      wrap.innerHTML = list.length === 0 ? UI.emptyHtml('📭', 'No complaints match these filters') : `
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Category</th><th>Area</th><th>Date</th><th>Status</th><th>Expected</th><th></th></tr></thead>
          <tbody>
            ${list.map(c => `
              <tr class="clickable" onclick="location.hash='#/complaint/${c.complaint_id}'">
                <td>${c.complaint_id}</td>
                <td>${c.category_icon || ''} ${UI.escapeHtml(c.category_name || '')}</td>
                <td>${UI.escapeHtml(c.area)}</td>
                <td>${UI.formatDate(c.created_at)}</td>
                <td>${UI.statusBadge(c.status)}</td>
                <td>${UI.formatDate(c.expected_resolution_date)}</td>
                <td><a href="#/complaint/${c.complaint_id}">View →</a></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    } catch (err) {
      wrap.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  }

  ['fCategory', 'fStatus'].forEach(id => document.getElementById(id).addEventListener('change', load));
  document.getElementById('fArea').addEventListener('input', debounce(load, 350));
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('fCategory').value = '';
    document.getElementById('fStatus').value = '';
    document.getElementById('fArea').value = '';
    load();
  });

  load();
};

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
