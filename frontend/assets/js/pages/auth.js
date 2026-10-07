Pages.login = async (root) => {
  root.innerHTML = `
  <div class="section container">
    <div class="card auth-card">
      <h2 class="text-center">Citizen Login</h2>
      <p class="section-sub text-center" style="margin:0 auto 20px;">Log in to register complaints and track your history.</p>
      <div id="loginAlert"></div>
      <form id="loginForm">
        <div class="form-group">
          <label for="mobile">Mobile Number</label>
          <input type="tel" id="mobile" maxlength="10" placeholder="10-digit mobile number" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" placeholder="Your password" required />
        </div>
        <button class="btn btn-primary btn-block" type="submit">Log In</button>
      </form>
      <p class="hint text-center mt-2">Demo citizen: <strong>9876543210</strong> / <strong>Demo@1234</strong></p>
      <hr class="divider" />
      <p class="text-center">New here? <a href="#/register">Create a citizen account</a></p>
      <p class="text-center"><a href="#/admin-login">Municipal staff? Admin login →</a></p>
    </div>
  </div>`;

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('loginAlert');
    alertBox.innerHTML = '';
    try {
      const { user, token } = await Api.post('/auth/login', { mobile, password });
      Auth.setSession(user, token);
      UI.toast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
      location.hash = user.role === 'admin' ? '#/admin' : '#/dashboard';
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  });
};

Pages.registerUser = async (root) => {
  root.innerHTML = `
  <div class="section container">
    <div class="card auth-card">
      <h2 class="text-center">Create Citizen Account</h2>
      <p class="section-sub text-center" style="margin:0 auto 20px;">Only takes a minute — no email verification needed for this prototype.</p>
      <div id="regAlert"></div>
      <form id="regForm">
        <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" required /></div>
        <div class="form-group"><label for="mobile">Mobile Number</label><input type="tel" id="mobile" maxlength="10" placeholder="10-digit mobile number" required /></div>
        <div class="form-group"><label for="email">Email (optional)</label><input type="email" id="email" /></div>
        <div class="form-group"><label for="address">Address (optional)</label><input type="text" id="address" placeholder="e.g. Sector 12, Kharghar" /></div>
        <div class="form-group"><label for="password">Password</label><input type="password" id="password" placeholder="At least 6 characters" required /></div>
        <button class="btn btn-primary btn-block" type="submit">Create Account</button>
      </form>
      <p class="text-center mt-2">Already registered? <a href="#/login">Log in</a></p>
    </div>
  </div>`;

  document.getElementById('regForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('name').value.trim(),
      mobile: document.getElementById('mobile').value.trim(),
      email: document.getElementById('email').value.trim(),
      address: document.getElementById('address').value.trim(),
      password: document.getElementById('password').value,
    };
    const alertBox = document.getElementById('regAlert');
    alertBox.innerHTML = '';
    try {
      const { user, token } = await Api.post('/auth/register', payload);
      Auth.setSession(user, token);
      UI.toast('Account created successfully!', 'success');
      location.hash = '#/dashboard';
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  });
};
