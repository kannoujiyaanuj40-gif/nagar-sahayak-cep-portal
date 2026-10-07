Pages.adminComplaintDetails = async (root, params) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin/complaints')}<div id="acdMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('acdMain');

  async function load() {
    let payload, departments;
    try {
      [payload, departments] = await Promise.all([
        Api.get(`/complaints/${encodeURIComponent(params.id)}`),
        Api.get('/departments'),
      ]);
    } catch (err) {
      main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
      return;
    }
    render(payload, departments);
  }

  function render({ complaint: c, history, feedback }, departments) {
    const statuses = ['Registered','Verified','Department Assigned','In Progress','Resolved','Feedback Pending','Closed'];
    main.innerHTML = `
      <a href="#/admin/complaints" class="hint">← Back to All Complaints</a>
      <div class="flex-between mt-2">
        <div><h2 class="mb-0">${UI.escapeHtml(c.title)}</h2><p class="hint mb-0">${c.complaint_id} · ${UI.formatDate(c.created_at, true)}</p></div>
        <div class="flex" style="gap:8px;">${UI.statusBadge(c.status)}${UI.slaBadge(c.sla_state)}</div>
      </div>

      <div class="grid grid-2 mt-2">
        <div class="card">
          <h4>Citizen &amp; Complaint Details</h4>
          <p><strong>Category:</strong> ${c.category_icon || ''} ${UI.escapeHtml(c.category_name || '')}</p>
          <p><strong>Description:</strong> ${UI.escapeHtml(c.description)}</p>
          <p><strong>Location:</strong> ${UI.escapeHtml(c.address)}, ${UI.escapeHtml(c.area)} ${c.pincode ? '- ' + UI.escapeHtml(c.pincode) : ''}</p>
          ${c.landmark ? `<p><strong>Landmark:</strong> ${UI.escapeHtml(c.landmark)}</p>` : ''}
          ${c.latitude ? `<p><strong>GPS:</strong> ${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}</p>` : ''}
          ${c.photo ? `<img src="${c.photo}" class="upload-preview" alt="Complaint photo" />` : '<p class="muted">No photo attached</p>'}
          <p class="mt-2"><strong>Escalation:</strong> <span class="badge ${c.escalation_level > 0 ? 'badge-red' : 'badge-grey'}">${UI.escapeHtml(c.escalation_label)}</span></p>
        </div>

        <div class="card">
          <h4>Manage Complaint</h4>
          <div id="mgAlert"></div>
          <form id="mgForm">
            <div class="form-group">
              <label for="department_id">Department</label>
              <select id="department_id">${departments.map(d => `<option value="${d.department_id}" ${d.department_id === c.department_id ? 'selected' : ''}>${d.department_name}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label for="assigned_to">Assigned Team / Officer</label><input type="text" id="assigned_to" value="${UI.escapeHtml(c.assigned_to || '')}" placeholder="e.g. Ward Sanitation Team B" /></div>
            <div class="form-group"><label for="expected_resolution_date">Expected Resolution Date</label><input type="date" id="expected_resolution_date" value="${c.expected_resolution_date || ''}" /></div>
            <div class="form-group">
              <label for="status">Status</label>
              <select id="status">${statuses.map(s => `<option value="${s}" ${s === c.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
            </div>
            <div class="form-group"><label for="remarks">Remarks (added to history)</label><textarea id="remarks" placeholder="Optional note for this update"></textarea></div>

            <div id="resolutionFields" style="display:none;">
              <div class="form-group"><label for="resolution_remarks">Resolution Remarks</label><textarea id="resolution_remarks" placeholder="Describe how the issue was resolved">${UI.escapeHtml(c.resolution_remarks || '')}</textarea></div>
              <div class="form-group">
                <label>Resolution Photo (optional)</label>
                <div class="upload-box" id="resUploadBox">
                  <div id="resUploadContent">${c.resolution_photo ? `<img src="${c.resolution_photo}" class="upload-preview" alt="Resolution photo" />` : '<p>📷 Tap to upload proof of resolution</p>'}</div>
                  <input type="file" id="resPhotoInput" accept="image/*" style="display:none" />
                </div>
              </div>
            </div>

            <button class="btn btn-primary btn-block mt-2" type="submit">Save Update</button>
          </form>
          <div class="flex" style="gap:10px;margin-top:10px;">
            <button class="btn btn-outline btn-sm" id="escalateBtn">⬆️ Manually Escalate</button>
          </div>
        </div>
      </div>

      <div class="card mt-3">
        <h4>Complaint History</h4>
        <ol class="timeline">
          ${history.map(h => `
            <li class="done"><div class="tl-dot"></div>
              <div class="tl-title">${UI.escapeHtml(h.status)}</div>
              <div class="tl-meta">${UI.escapeHtml(h.remarks || '')} — ${UI.formatDate(h.created_at, true)} (${UI.escapeHtml(h.updated_by)})</div>
            </li>`).join('')}
        </ol>
      </div>

      ${feedback ? `
      <div class="card mt-3">
        <h4>Citizen Feedback</h4>
        <p><strong>Resolved?</strong> ${feedback.resolution_status} ${feedback.rating ? '· Rating: ' + '⭐'.repeat(feedback.rating) : ''}</p>
        ${feedback.comment ? `<p><strong>Comment:</strong> ${UI.escapeHtml(feedback.comment)}</p>` : ''}
      </div>` : ''}
    `;

    let resolutionPhotoDataUrl = null;
    const statusSelect = document.getElementById('status');
    const resolutionFields = document.getElementById('resolutionFields');
    function toggleResolutionFields() { resolutionFields.style.display = statusSelect.value === 'Resolved' ? 'block' : 'none'; }
    statusSelect.addEventListener('change', toggleResolutionFields);
    toggleResolutionFields();

    const resUploadBox = document.getElementById('resUploadBox');
    if (resUploadBox) {
      resUploadBox.addEventListener('click', () => document.getElementById('resPhotoInput').click());
      document.getElementById('resPhotoInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        resolutionPhotoDataUrl = await UI.fileToDataUrl(file);
        document.getElementById('resUploadContent').innerHTML = `<img src="${resolutionPhotoDataUrl}" class="upload-preview" alt="Resolution photo" />`;
      });
    }

    document.getElementById('mgForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const alertBox = document.getElementById('mgAlert');
      const body = {
        department_id: document.getElementById('department_id').value,
        assigned_to: document.getElementById('assigned_to').value.trim(),
        expected_resolution_date: document.getElementById('expected_resolution_date').value,
        status: statusSelect.value,
        remarks: document.getElementById('remarks').value.trim(),
      };
      if (statusSelect.value === 'Resolved') {
        body.resolution_remarks = document.getElementById('resolution_remarks').value.trim();
        if (resolutionPhotoDataUrl) body.resolution_photo = resolutionPhotoDataUrl;
      }
      try {
        await Api.put(`/admin/complaints/${c.complaint_id}`, body);
        UI.toast('Complaint updated', 'success');
        load();
      } catch (err) {
        alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
      }
    });

    document.getElementById('escalateBtn').addEventListener('click', async () => {
      const ok = await UI.confirmModal({ title: 'Escalate Complaint', message: `Manually escalate ${c.complaint_id} to the next level?`, confirmText: 'Escalate' });
      if (!ok) return;
      try {
        await Api.post(`/admin/complaints/${c.complaint_id}/escalate`);
        UI.toast('Complaint escalated', 'success');
        load();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  }

  load();
};
