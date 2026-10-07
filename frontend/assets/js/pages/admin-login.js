Pages.adminLogin = async (root) => {
  root.innerHTML = `
  <div class="section container">
    <div class="card auth-card">
      <h2 class="text-center">🛡️ Admin Login</h2>
      <p class="section-sub text-center" style="margin:0 auto 20px;">Restricted access for municipal staff managing complaints.</p>
      <div id="alertBox"></div>
      <form id="adminLoginForm">
        <div class="form-group"><label for="mobile">Mobile Number</label><input type="tel" id="mobile" maxlength="10" required /></div>
        <div class="form-group"><label for="password">Password</label><input type="password" id="password" required /></div>
        <button class="btn btn-primary btn-block" type="submit">Log In as Admin</button>
      </form>
      <p class="hint text-center mt-2">Demo admin: <strong>9999999999</strong> / <strong>Admin@1234</strong></p>
      <hr class="divider" />
      <p class="text-center"><a href="#/login">← Citizen login</a></p>
    </div>
  </div>`;

  document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('alertBox');
    alertBox.innerHTML = '';
    try {
      const { user, token } = await Api.post('/auth/login', { mobile, password });
      if (user.role !== 'admin') throw new Error('This account does not have admin access.');
      Auth.setSession(user, token);
      UI.toast('Welcome, Admin', 'success');
      location.hash = '#/admin';
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  });
};
