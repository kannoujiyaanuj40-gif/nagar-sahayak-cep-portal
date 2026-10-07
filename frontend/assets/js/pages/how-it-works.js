Pages.howItWorks = async (root) => {
  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>How It Works</h1>
  <p class="section-sub">From registering a complaint to getting it resolved — the full citizen journey.</p></div></div>

  <div class="section container">
    <h2 class="section-title">1. Registration — 5 simple steps</h2>
    <div class="steps">
      ${['Select Category', 'Enter Location', 'Describe Problem', 'Upload Photo', 'Submit Complaint']
        .map((t, i) => `<div class="step card"><div class="step-num">${i + 1}</div><h4>${t}</h4></div>`).join('')}
    </div>

    <h2 class="section-title mt-3">2. Complaint lifecycle</h2>
    <div class="card">
      <ol class="timeline" style="list-style:none;">
        <li class="done"><div class="tl-dot"></div><div class="tl-title">Complaint Registered</div><div class="tl-meta">Citizen submits the complaint; a unique Complaint ID is generated instantly.</div></li>
        <li class="done"><div class="tl-dot"></div><div class="tl-title">Complaint Verified</div><div class="tl-meta">Mandatory fields and evidence are checked.</div></li>
        <li class="done"><div class="tl-dot"></div><div class="tl-title">Department Assigned</div><div class="tl-meta">The correct department is suggested automatically from the category — the citizen never has to know it.</div></li>
        <li class="current"><div class="tl-dot"></div><div class="tl-title">Work in Progress</div><div class="tl-meta">A team/officer is assigned and works on the issue, with an expected resolution date shown throughout.</div></li>
        <li><div class="tl-dot"></div><div class="tl-title">Resolved</div><div class="tl-meta">Resolution remarks and (optionally) a resolution photo are added.</div></li>
        <li><div class="tl-dot"></div><div class="tl-title">Citizen Feedback</div><div class="tl-meta">The citizen confirms whether the issue was actually resolved and rates the service.</div></li>
        <li><div class="tl-dot"></div><div class="tl-title">Closed</div><div class="tl-meta">If the citizen says the issue wasn't resolved, the complaint reopens and escalates instead of closing.</div></li>
      </ol>
    </div>

    <h2 class="section-title mt-3">3. What happens if a deadline is missed</h2>
    <div class="grid grid-3">
      <div class="card"><h4>Level 1</h4><p>Ward / Department Team handles the complaint under the normal SLA.</p></div>
      <div class="card"><h4>Level 2</h4><p>If the SLA is exceeded, it's automatically escalated to a Department Officer.</p></div>
      <div class="card"><h4>Level 3</h4><p>Continued delay escalates further to a Senior Officer / Admin — visible to the citizen at every step.</p></div>
    </div>

    <h2 class="section-title mt-3">4. Smart department suggestion</h2>
    <div class="card">
      <p><strong>Example:</strong> Citizen writes "Garbage has not been collected for 3 days" and selects the <em>Garbage</em> category.</p>
      <p>The system automatically routes it to <strong>Solid Waste Management</strong> — the citizen is never asked to know or select a department manually.</p>
    </div>
  </div>`;
};
