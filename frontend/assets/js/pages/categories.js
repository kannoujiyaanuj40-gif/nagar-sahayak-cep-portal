Pages.categories = async (root) => {
  root.innerHTML = UI.loadingHtml();
  let categories = [];
  try { categories = await Api.get('/categories'); }
  catch (e) { root.innerHTML = `<div class="section container"><div class="alert alert-error">${UI.escapeHtml(e.message)}</div></div>`; return; }

  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>Complaint Categories</h1>
  <p class="section-sub">Pick the category that matches your issue — each maps automatically to the right department, so you never need to know municipal department names.</p></div></div>
  <div class="section container">
    <div class="grid grid-4">
      ${categories.map(c => `
        <div class="card card-hover cat-card" onclick="location.hash='#/register-complaint'">
          <span class="cat-icon">${c.icon}</span>
          <h4>${UI.escapeHtml(c.category_name)}</h4>
          <p>${UI.escapeHtml(c.description)}</p>
          <span class="badge badge-blue">Typical resolution: ${c.sla_days} day${c.sla_days > 1 ? 's' : ''}</span>
        </div>`).join('')}
    </div>
  </div>`;
};
