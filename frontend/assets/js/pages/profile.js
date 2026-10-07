Pages.profile = async (root) => {
  const user = Auth.getUser();
  root.innerHTML = `<div class="section container"><div class="app-shell">${citizenSideNav('profile')}
    <div>
      <div class="card form-card">
        <div class="flex-center mb-2"><div class="avatar">${UI.avatarInitial(user.name)}</div><div><h3 class="mb-0">${UI.escapeHtml(user.name)}</h3><span class="hint">${UI.escapeHtml(user.mobile)}</span></div></div>
        <div id="profAlert"></div>
        <form id="profForm">
          <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" value="${UI.escapeHtml(user.name)}" /></div>
          <div class="form-group"><label for="email">Email</label><input type="email" id="email" value="${UI.escapeHtml(user.email || '')}" /></div>
          <div class="form-group"><label for="address">Address</label><input type="text" id="address" value="${UI.escapeHtml(user.address || '')}" /></div>
          <div class="form-group"><label>Mobile Number</label><input type="text" value="${UI.escapeHtml(user.mobile)}" disabled /><p class="hint">Mobile number cannot be changed in this prototype.</p></div>
          <button class="btn btn-primary" type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  </div></div>`;

  document.getElementById('profForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('profAlert');
    try {
      const updated = await Api.put('/auth/profile', {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
      });
      Auth.setSession(updated, Auth.getToken());
      alertBox.innerHTML = `<div class="alert alert-success">Profile updated successfully.</div>`;
      UI.renderHeaderAuth();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  });
};
