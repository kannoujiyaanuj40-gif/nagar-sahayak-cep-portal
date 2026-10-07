Pages.notifications = async (root) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${citizenSideNav('notifications')}<div id="notMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('notMain');

  async function load() {
    let list = [];
    try { list = await Api.get('/notifications'); }
    catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

    main.innerHTML = `
      <div class="dash-header">
        <h2 class="mb-0">Notifications</h2>
        ${list.some(n => !n.is_read) ? `<button class="btn btn-outline btn-sm" id="markAllBtn">Mark all as read</button>` : ''}
      </div>
      ${list.length === 0 ? UI.emptyHtml('🔕', 'No notifications yet') : `
      <div class="card" style="padding:0;overflow:hidden;">
        ${list.map(n => `
          <div class="flex-between" style="padding:14px 20px;border-bottom:1px solid var(--ink-100);${n.is_read ? '' : 'background:var(--blue-50);'}">
            <div>
              <p class="mb-0" style="font-weight:${n.is_read ? '400' : '700'};">${UI.escapeHtml(n.message)}</p>
              <span class="hint">${UI.formatDate(n.created_at, true)} ${n.complaint_id ? '· ' + n.complaint_id : ''}</span>
            </div>
            <div class="flex" style="gap:8px;">
              ${n.complaint_id ? `<a class="btn btn-outline btn-sm" href="#/complaint/${n.complaint_id}">View</a>` : ''}
              ${!n.is_read ? `<button class="btn btn-sm btn-primary" data-read="${n.notification_id}">Mark read</button>` : ''}
            </div>
          </div>`).join('')}
      </div>`}`;

    const markAllBtn = document.getElementById('markAllBtn');
    if (markAllBtn) markAllBtn.addEventListener('click', async () => { await Api.put('/notifications/read-all'); load(); });
    main.querySelectorAll('[data-read]').forEach(btn => {
      btn.addEventListener('click', async () => { await Api.put(`/notifications/${btn.dataset.read}/read`); load(); });
    });
  }
  load();
};
