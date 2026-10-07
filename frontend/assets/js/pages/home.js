Pages.home = async (root) => {
  let categories = [];
  try { categories = await Api.get('/categories'); } catch (e) { /* non-fatal on homepage */ }

  root.innerHTML = `
  <section class="hero">
    <div class="container hero-inner">
      <div>
        <h1>Report civic problems in minutes. Track them until they're fixed.</h1>
        <p class="lead">Nagar Sahayak is a citizen-friendly complaint registration and tracking portal — register a civic issue in a simple 5-step form, see exactly which department is handling it, and follow a visual timeline right up to resolution.</p>
        <div class="hero-actions">
          <a href="#/register-complaint" class="btn btn-accent">📝 Register Complaint</a>
          <a href="#/track" class="btn btn-ghost">🔍 Track Complaint</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><strong>5 steps</strong><span>Simple registration</span></div>
          <div class="hero-stat"><strong>10 categories</strong><span>Visual & easy to pick</span></div>
          <div class="hero-stat"><strong>Auto-routed</strong><span>No dept. knowledge needed</span></div>
          <div class="hero-stat"><strong>SLA tracked</strong><span>Automatic escalation</span></div>
        </div>
      </div>
      <div class="hero-art">
        <h3 style="margin-top:0;color:#fff;">Why citizens use Nagar Sahayak</h3>
        <ul style="color:#e3edf9;">
          <li>No need to know which department to contact — we suggest it automatically</li>
          <li>A visual status timeline instead of vague "pending" labels</li>
          <li>A clear expected resolution date on every complaint</li>
          <li>One dashboard for all your complaints — nothing to hunt for</li>
          <li>Give feedback, and reopen a complaint if the issue isn't actually fixed</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="section container">
    <div class="flex-between">
      <div>
        <h2 class="section-title">How it works</h2>
        <p class="section-sub">A simplified 5-step flow designed after studying multiple existing municipal portals.</p>
      </div>
      <a href="#/how-it-works" class="btn btn-outline">See full workflow</a>
    </div>
    <div class="steps">
      ${[
        ['1', '📋', 'Select Category', 'Pick from 10 visual icons — no guesswork'],
        ['2', '📍', 'Enter Location', 'Area, address, landmark & pincode'],
        ['3', '✍️', 'Describe Problem', 'Short title + detailed description'],
        ['4', '📷', 'Upload Photo', 'Optional photo evidence'],
        ['5', '✅', 'Submit', 'Get a Complaint ID instantly'],
      ].map(([n, icon, title, desc]) => `
        <div class="step card">
          <div class="step-num">${n}</div>
          <div style="font-size:22px">${icon}</div>
          <h4>${title}</h4><p>${desc}</p>
        </div>`).join('')}
    </div>
  </section>

  <section class="section container">
    <div class="flex-between">
      <div>
        <h2 class="section-title">Complaint categories</h2>
        <p class="section-sub">Visual categories remove the confusion citizens often face when unsure how to classify an issue.</p>
      </div>
      <a href="#/categories" class="btn btn-outline">View all categories</a>
    </div>
    <div class="grid grid-4">
      ${categories.slice(0, 8).map(c => `
        <div class="card card-hover cat-card" onclick="location.hash='#/register-complaint'">
          <span class="cat-icon">${c.icon}</span>
          <h4>${UI.escapeHtml(c.category_name)}</h4>
          <p>${UI.escapeHtml(c.description)}</p>
        </div>`).join('') || ''}
    </div>
  </section>

  <section class="section container">
    <h2 class="section-title">Benefits over a typical complaint counter</h2>
    <div class="grid grid-3">
      <div class="card"><h4>🎯 Transparent routing</h4><p>See exactly which department and team is handling your complaint at every stage.</p></div>
      <div class="card"><h4>⏱️ Clear deadlines</h4><p>Every complaint shows an expected resolution date, with warnings before and after it's exceeded.</p></div>
      <div class="card"><h4>📈 Automatic escalation</h4><p>If a complaint isn't resolved in time, it's automatically escalated up the chain — no follow-up calls needed.</p></div>
      <div class="card"><h4>🗂️ One dashboard</h4><p>All your complaints, statuses and notifications in a single place — no juggling multiple counters or numbers.</p></div>
      <div class="card"><h4>⭐ Feedback that matters</h4><p>Rate the resolution and reopen the complaint if the problem persists.</p></div>
      <div class="card"><h4>📱 Mobile-first design</h4><p>Built to be just as usable on a phone in the field as on a desktop at home.</p></div>
    </div>
  </section>

  <section class="section container">
    <div class="card" style="background:var(--blue-50);border:none;text-align:center;padding:36px;">
      <h2 style="margin-bottom:8px;">Have a civic issue to report?</h2>
      <p class="section-sub" style="margin:0 auto 20px;">Registration takes under two minutes and doesn't require creating a complex profile.</p>
      <a href="#/register-complaint" class="btn btn-primary">Register a Complaint Now</a>
    </div>
  </section>
  `;
};
