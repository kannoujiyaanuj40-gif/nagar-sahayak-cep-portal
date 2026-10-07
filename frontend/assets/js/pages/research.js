Pages.research = async (root) => {
  const rows = [
    {
      portal: 'MyBMC (Brihanmumbai Municipal Corporation)',
      studied: 'Online complaint registration, complaint categories, complaint ID generation, tracking, department-wise routing, photo attachment, escalation, resolution remarks.',
      gap: 'Based on comparative usability analysis, registration and department routing can be made simpler and more transparent for a first-time citizen user.',
      learned: 'A unique Complaint ID and structured tracking are essential trust-building features.',
      implemented: 'A simplified 5-step registration wizard, an always-visible Complaint ID, and a visual status timeline in place of plain status text.',
    },
    {
      portal: 'Thane Municipal Corporation (TMC) Grievance Portal',
      studied: 'Local civic complaint submission, area/location-based complaints, citizen support access, mobile-friendly design.',
      gap: 'The study identified an opportunity to consolidate complaint-related actions into a single dedicated space rather than spreading them across multiple services.',
      learned: 'Local, area-based context (not just a generic address field) helps route and prioritise civic issues correctly.',
      implemented: 'A dedicated 3-field location step (Area, Address, Landmark + Pincode) and one centralized citizen dashboard for all complaint actions.',
    },
    {
      portal: 'Navi Mumbai Municipal Corporation (NMMC) Grievance Portal',
      studied: 'Online grievance registration, photo evidence, geo/location tagging, tracking, notifications, SLA/resolution timelines, automated escalation.',
      gap: 'The process can be simplified by not requiring the citizen to identify the correct department themselves, and by making resolution timelines more visible.',
      learned: 'Geo-enabled photo and location evidence, paired with a defined SLA, makes complaints easier to verify and prioritise.',
      implemented: 'Our portal uses location + optional GPS coordinates + photo evidence together with a per-category SLA and automatic escalation when it is exceeded.',
    },
    {
      portal: 'Pune Municipal Corporation (PMC) Grievance Redressal Portal',
      studied: 'Complaint lifecycle stages, department/official assignment, escalation hierarchy, citizen feedback, monitoring dashboards and analytics.',
      gap: 'Our proposed portal improves on this by surfacing assignment and escalation status directly to the citizen, rather than only to internal staff.',
      learned: 'A defined complaint lifecycle and escalation hierarchy, combined with citizen feedback, closes the loop on whether a resolution was genuine.',
      implemented: 'Our portal uses transparent assignment (department + team shown to the citizen), a 3-level escalation hierarchy, and a feedback-driven reopen mechanism plus an admin analytics dashboard.',
    },
  ];

  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>Research &amp; Improvements</h1>
  <p class="section-sub">This project was developed after a comparative usability study of four existing municipal/government complaint portals. Their design, branding and code were not copied — only publicly observable features were used as reference to identify improvement opportunities.</p></div></div>

  <div class="section container">
    <div class="alert alert-info">
      Wording note: findings below are phrased as improvement opportunities identified through comparative usability analysis, not as claims that a studied portal lacks a feature. This is an academic prototype, not an official government system.
    </div>

    <div class="grid" style="grid-template-columns:1fr;gap:16px;">
      ${rows.map(r => `
        <div class="card research-card">
          <h3>${UI.escapeHtml(r.portal)}</h3>
          <div class="research-grid">
            <div><span class="label">Features studied</span>${UI.escapeHtml(r.studied)}</div>
            <div><span class="label">Improvement opportunity identified</span>${UI.escapeHtml(r.gap)}</div>
            <div><span class="label">What we learned</span>${UI.escapeHtml(r.learned)}</div>
            <div><span class="label">What we implemented</span>${UI.escapeHtml(r.implemented)}</div>
          </div>
        </div>`).join('')}
    </div>

    <h2 class="section-title mt-3">Gap → Solution summary</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Identified Gap</th><th>Our Solution</th></tr></thead>
        <tbody>
          ${[
            ['Complex complaint registration', '5-step guided wizard (Category → Location → Description → Photo → Submit)'],
            ['Category confusion', 'Visual icon-based categories with short descriptions'],
            ['Citizen may not know the correct department', 'Automatic department suggestion based on category'],
            ['Limited location detail', 'Area, address, landmark, pincode + optional GPS location'],
            ['Unclear status tracking', 'Visual step-by-step status timeline'],
            ['No centralized complaint history', 'A "My Complaints" dashboard with filters'],
            ['Resolution deadlines not prominent', 'Expected resolution date shown with SLA-approaching / SLA-exceeded indicators'],
            ['Escalation not transparent to citizens', '3-level escalation hierarchy visible on every complaint'],
            ['No structured post-resolution feedback', 'Resolved → Feedback → Reopen-if-needed workflow with star ratings'],
            ['No proof of resolution', 'Admin-uploaded resolution remarks and photo, visible before feedback'],
            ['Scattered service channels', 'One centralized portal: Register, Track, My Complaints, Notifications, Feedback, Help'],
            ['Poor mobile usability', 'Mobile-first responsive design throughout'],
          ].map(([g, s]) => `<tr><td>${UI.escapeHtml(g)}</td><td>${UI.escapeHtml(s)}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
};
