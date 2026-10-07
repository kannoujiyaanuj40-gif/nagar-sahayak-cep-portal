Pages.adminDepartments = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin/departments')}<div id="adDeptMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('adDeptMain');

  async function load() {
    let departments = [];
    try { departments = await Api.get('/admin/departments'); }
    catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

    main.innerHTML = `
      <div class="dash-header"><h2 class="mb-0">Department Management</h2><button class="btn btn-primary" id="addDeptBtn">+ Add Department</button></div>
      <div id="deptAlert"></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
          <tbody>
            ${departments.map(d => `
              <tr>
                <td>${UI.escapeHtml(d.department_name)}</td>
                <td>${UI.escapeHtml(d.description || '')}</td>
                <td class="flex" style="gap:8px;">
                  <button class="btn btn-sm btn-outline" data-edit="${d.department_id}">Edit</button>
                  <button class="btn btn-sm btn-danger" data-del="${d.department_id}">Delete</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

    main.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => openForm(departments.find(d => d.department_id === Number(btn.dataset.edit))));
    });
    main.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const ok = await UI.confirmModal({ title: 'Delete Department', message: 'This cannot be undone. Continue?', confirmText: 'Delete', danger: true });
        if (!ok) return;
        try { await Api.del(`/admin/departments/${btn.dataset.del}`); UI.toast('Department deleted', 'success'); load(); }
        catch (err) { UI.toast(err.message, 'error'); }
      });
    });
    document.getElementById('addDeptBtn').addEventListener('click', () => openForm(null));
  }

  function openForm(dept) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h3>${dept ? 'Edit' : 'Add'} Department</h3>
        <div id="deptFormAlert"></div>
        <form id="deptForm">
          <div class="form-group"><label for="dname">Department Name</label><input type="text" id="dname" value="${dept ? UI.escapeHtml(dept.department_name) : ''}" required /></div>
          <div class="form-group"><label for="ddesc">Description</label><textarea id="ddesc">${dept ? UI.escapeHtml(dept.description || '') : ''}</textarea></div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" id="cancelBtn">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.querySelector('#cancelBtn').addEventListener('click', () => backdrop.remove());
    backdrop.querySelector('#deptForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = { department_name: backdrop.querySelector('#dname').value.trim(), description: backdrop.querySelector('#ddesc').value.trim() };
      try {
        if (dept) await Api.put(`/admin/departments/${dept.department_id}`, body);
        else await Api.post('/admin/departments', body);
        backdrop.remove();
        UI.toast('Department saved', 'success');
        load();
      } catch (err) {
        backdrop.querySelector('#deptFormAlert').innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
      }
    });
  }

  load();
};
