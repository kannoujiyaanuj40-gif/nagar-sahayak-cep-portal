Pages.adminUsers = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin/users')}<div id="auMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('auMain');

  async function load() {
    let users = [];
    try { users = await Api.get('/admin/users'); }
    catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

    main.innerHTML = `
      <div class="dash-header"><h2 class="mb-0">User Management</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Mobile</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${UI.escapeHtml(u.name)}</td>
                <td>${UI.escapeHtml(u.mobile)}</td>
                <td>${UI.escapeHtml(u.email || '—')}</td>
                <td><span class="badge badge-blue">${u.role}</span></td>
                <td><span class="badge ${u.is_active ? 'badge-green' : 'badge-red'}">${u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>${UI.formatDate(u.created_at)}</td>
                <td>${u.role === 'admin' ? '' : `<button class="btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-outline'}" data-toggle="${u.user_id}" data-active="${u.is_active}">${u.is_active ? 'Deactivate' : 'Activate'}</button>`}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    main.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const nextActive = btn.dataset.active !== 'true';
        try { await Api.put(`/admin/users/${btn.dataset.toggle}/active`, { is_active: nextActive }); UI.toast('User updated', 'success'); load(); }
        catch (err) { UI.toast(err.message, 'error'); }
      });
    });
  }
  load();
};
