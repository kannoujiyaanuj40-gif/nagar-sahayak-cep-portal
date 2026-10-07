Pages.about = async (root) => {
  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>About This Project</h1>
  <p class="section-sub">A BSc IT Community Engagement Project (CEP) developed under the National Education Policy (NEP) 2020.</p></div></div>
  <div class="section container">
    <div class="grid grid-2">
      <div class="card">
        <h3>Project Topic</h3>
        <p><strong>Complaint Registration Management Portal</strong> — a citizen-friendly web platform for registering, tracking and resolving municipal civic complaints.</p>
        <h3>Community Beneficiary</h3>
        <p>Municipal Corporation administration and the citizens they serve.</p>
      </div>
      <div class="card">
        <h3>Objective</h3>
        <p>To study existing municipal complaint portals, identify genuine usability gaps through comparative analysis, and design an original, improved civic complaint system that is easier for an ordinary citizen to use — without copying the design, branding or code of any existing portal.</p>
      </div>
    </div>

    <h2 class="section-title mt-3">Methodology</h2>
    <div class="steps" style="grid-template-columns:repeat(4,1fr);">
      <div class="step card"><h4>1. Study</h4><p>Comparative review of four existing municipal/government complaint portals' publicly observable features.</p></div>
      <div class="step card"><h4>2. Identify</h4><p>Usability gaps and improvement opportunities based on the comparative study.</p></div>
      <div class="step card"><h4>3. Design</h4><p>An original UI/UX combining the strongest concepts, with targeted improvements for each identified gap.</p></div>
      <div class="step card"><h4>4. Build</h4><p>A working academic prototype implementing the improved workflow end-to-end.</p></div>
    </div>

    <div class="alert alert-info mt-3">
      This project is an academic prototype built for a BSc IT CEP submission. It is <strong>not</strong> an official Municipal Corporation system, and is not affiliated with, endorsed by, or connected to MyBMC, TMC, NMMC, PMC or any government body. See the <a href="#/research">Research &amp; Improvements</a> page for the full comparative study.
    </div>
  </div>`;
};
