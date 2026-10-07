Pages.faq = async (root) => {
  const faqs = [
    ['Do I need to create an account to register a complaint?', 'Yes, a quick citizen account (name, mobile number, and password) lets you track your complaint history. Anyone can track an existing complaint using its ID without logging in.'],
    ['How do I know which department will handle my complaint?', 'You don\'t need to know. Select the category that matches your issue and the system automatically suggests the right department based on that category.'],
    ['What if my complaint isn\'t resolved by the expected date?', 'Complaints that cross their expected resolution date are automatically escalated to the next level, and you\'ll see an "SLA exceeded" indicator along with the updated escalation status.'],
    ['Can I reopen a complaint that was marked resolved incorrectly?', 'Yes. After a complaint is marked resolved, you\'ll be asked whether it was actually fixed. Choosing "No" automatically reopens and escalates the complaint.'],
    ['Is my personal information visible to other citizens?', 'No. Your contact details are private and only visible to the assigned municipal staff handling your complaint.'],
    ['Is this connected to an actual Municipal Corporation?', 'No — this is an academic prototype built for a BSc IT Community Engagement Project. It is not an official government system and does not route complaints anywhere in real life.'],
  ];
  root.innerHTML = `
  <div class="page-hero"><div class="container"><h1>Help &amp; FAQ</h1><p class="section-sub">Common questions about using the portal.</p></div></div>
  <div class="section container">
    <div class="grid" style="grid-template-columns:1fr;max-width:800px;gap:14px;">
      ${faqs.map(([q, a]) => `<div class="card"><h4>${UI.escapeHtml(q)}</h4><p class="mb-0">${UI.escapeHtml(a)}</p></div>`).join('')}
    </div>
    <div class="alert alert-info mt-3" style="max-width:800px;">Still stuck? Visit the <a href="#/contact">Contact</a> page or call the sample municipal helpline <strong>1800-000-0000</strong> shown in the footer.</div>
  </div>`;
};
