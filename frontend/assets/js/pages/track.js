Pages.track = async (root, params) => {
  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>Track Complaint</h1>
  <p class="section-sub">Enter your Complaint ID to see its current status, timeline and expected resolution date.</p></div></div>
  <div class="section container">
    <div class="card form-card">
      <form id="trackForm" class="flex" style="gap:10px;">
        <input type="text" id="cid" placeholder="e.g. CMP-000101" value="${params.id ? UI.escapeHtml(params.id) : ''}" style="flex:1;" />
        <button class="btn btn-primary" type="submit">Track</button>
      </form>
    </div>
    <div id="result" class="mt-3"></div>
  </div>`;

  const resultEl = document.getElementById('result');

  async function doTrack(id) {
    if (!id) return;
    resultEl.innerHTML = UI.loadingHtml('Fetching complaint details…');
    try {
      const { complaint, history, feedback } = await Api.get(`/complaints/${encodeURIComponent(id)}`);
      resultEl.innerHTML = renderComplaintCard(complaint, history, feedback);
    } catch (err) {
      resultEl.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  }

  document.getElementById('trackForm').addEventListener('submit', (e) => {
    e.preventDefault();
    doTrack(document.getElementById('cid').value.trim().toUpperCase());
  });

  if (params.id) doTrack(params.id.toUpperCase());
};

function renderComplaintCard(c, history, feedback) {
  const steps = ['Registered', 'Verified', 'Department Assigned', 'In Progress', 'Resolved', 'Feedback Pending', 'Closed'];
  const currentIdx = steps.indexOf(c.status);
  const isReopened = c.status === 'Reopened';

  return `
  <div class="card form-card">
    <div class="flex-between">
      <div>
        <h3 class="mb-0">${UI.escapeHtml(c.title)}</h3>
        <p class="hint mb-0">${c.complaint_id} · Registered on ${UI.formatDate(c.created_at, true)}</p>
      </div>
      ${UI.statusBadge(c.status)}
    </div>
    <hr class="divider" />
    <div class="grid grid-2">
      <div>
        <p><strong>Category:</strong> ${c.category_icon || ''} ${UI.escapeHtml(c.category_name || '')}</p>
        <p><strong>Location:</strong> ${UI.escapeHtml(c.address)}, ${UI.escapeHtml(c.area)}</p>
        <p><strong>Department:</strong> ${UI.escapeHtml(c.department_name || 'Being assigned')}</p>
        <p><strong>Assigned Team:</strong> ${UI.escapeHtml(c.assigned_to || 'Not yet assigned')}</p>
      </div>
      <div>
        <p><strong>Expected Resolution:</strong> ${UI.formatDate(c.expected_resolution_date)}</p>
        <p><strong>SLA Status:</strong> ${UI.slaBadge(c.sla_state)}</p>
        <p><strong>Escalation Status:</strong> <span class="badge ${c.escalation_level > 0 ? 'badge-red' : 'badge-grey'}">${UI.escapeHtml(c.escalation_label)}</span></p>
        ${c.photo ? `<p><strong>Photo Evidence:</strong></p><img src="${c.photo}" class="upload-preview" alt="Complaint evidence" />` : ''}
      </div>
    </div>
    <p class="mt-2">${UI.escapeHtml(c.description)}</p>

    ${c.resolution_remarks ? `
    <div class="alert alert-success">
      <strong>Resolution remarks:</strong> ${UI.escapeHtml(c.resolution_remarks)}
      ${c.resolution_photo ? `<br/><img src="${c.resolution_photo}" class="upload-preview mt-1" alt="Resolution evidence" />` : ''}
    </div>` : ''}

    ${isReopened ? `<div class="alert alert-warn">This complaint was reopened after citizen feedback indicated the issue was not resolved.</div>` : ''}

    <h4 class="mt-3">Status Timeline</h4>
    <ol class="timeline">
      ${steps.map((s, i) => `
        <li class="${i < currentIdx || (i === currentIdx && ['Resolved','Closed'].includes(c.status)) ? 'done' : i === currentIdx ? 'current' : ''}">
          <div class="tl-dot"></div>
          <div class="tl-title">${s}</div>
        </li>`).join('')}
    </ol>

    <h4 class="mt-3">Update History</h4>
    <ol class="timeline">
      ${history.map(h => `
        <li class="done">
          <div class="tl-dot"></div>
          <div class="tl-title">${UI.escapeHtml(h.status)}</div>
          <div class="tl-meta">${UI.escapeHtml(h.remarks || '')} — ${UI.formatDate(h.created_at, true)} (${UI.escapeHtml(h.updated_by)})</div>
        </li>`).join('')}
    </ol>

    ${feedback ? `<div class="alert alert-info mt-2"><strong>Feedback given:</strong> ${feedback.resolution_status} ${feedback.rating ? '· Rating: ' + '⭐'.repeat(feedback.rating) : ''}</div>` : ''}
  </div>`;
}
