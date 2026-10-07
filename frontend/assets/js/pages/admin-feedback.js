Pages.adminFeedback = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${adminSideNav('admin/feedback')}<div id="afMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('afMain');

  let list = [];
  try { list = await Api.get('/admin/feedback'); }
  catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

  main.innerHTML = `
    <div class="dash-header"><h2 class="mb-0">Feedback Management</h2></div>
    ${list.length === 0 ? UI.emptyHtml('⭐', 'No feedback submitted yet') : `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Complaint</th><th>Area</th><th>Resolved?</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
        <tbody>
          ${list.map(f => `
            <tr class="clickable" onclick="location.hash='#/admin/complaints/${f.complaint_id}'">
              <td>${f.complaint_id}<br/><span class="hint">${UI.escapeHtml(f.complaint_title)}</span></td>
              <td>${UI.escapeHtml(f.area)}</td>
              <td><span class="badge ${f.resolution_status === 'Yes' ? 'badge-green' : f.resolution_status === 'No' ? 'badge-red' : 'badge-amber'}">${f.resolution_status}</span></td>
              <td>${f.rating ? '⭐'.repeat(f.rating) : '—'}</td>
              <td>${UI.escapeHtml(f.comment || '—')}</td>
              <td>${UI.formatDate(f.created_at)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`}`;
};
