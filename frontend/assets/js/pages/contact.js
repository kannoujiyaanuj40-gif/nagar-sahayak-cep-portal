Pages.contact = async (root) => {
  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>Contact &amp; Help</h1><p class="section-sub">Reach out for support with this academic prototype.</p></div></div>
  <div class="section container">
    <div class="grid grid-3">
      <div class="card"><h4>🏛️ Sample Municipal Helpline</h4><p>1800-000-0000<br/><span class="hint">(demo number for this project)</span></p></div>
      <div class="card"><h4>🚨 Emergency Numbers</h4><p>Fire: 101 · Ambulance: 108 · Police: 100</p></div>
      <div class="card"><h4>🎓 Project Guide</h4><p>For academic queries about this CEP project, please contact your BSc IT department coordinator.</p></div>
    </div>
    <div class="card form-card mt-3">
      <h3>Send a Message</h3>
      <p class="hint">This is a demo form for the prototype — messages aren't actually sent anywhere.</p>
      <form id="contactForm">
        <div class="form-row">
          <div class="form-group"><label for="cname">Name</label><input type="text" id="cname" required /></div>
          <div class="form-group"><label for="cemail">Email</label><input type="email" id="cemail" required /></div>
        </div>
        <div class="form-group"><label for="cmsg">Message</label><textarea id="cmsg" required></textarea></div>
        <button class="btn btn-primary" type="submit">Send Message</button>
      </form>
    </div>
  </div>`;

  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    UI.toast('Message noted (demo only — not actually sent).', 'success');
    e.target.reset();
  });
};
