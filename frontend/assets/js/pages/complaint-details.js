Pages.complaintDetails = async (root, params) => {
  root.innerHTML = `<div class="section container"><div class="app-shell">${citizenSideNav('my-complaints')}<div id="cdMain">${UI.loadingHtml()}</div></div></div>`;
  const main = document.getElementById('cdMain');

  let payload;
  try { payload = await Api.get(`/complaints/${encodeURIComponent(params.id)}`); }
  catch (err) { main.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`; return; }

  const { complaint: c, history, feedback } = payload;
  const user = Auth.getUser();
  const isOwner = c.user_id === user.user_id;

  main.innerHTML = `
    <a href="#/my-complaints" class="hint">← Back to My Complaints</a>
    <div class="mt-2">${renderComplaintCard(c, history, feedback)}</div>
    ${isOwner && !feedback && ['Resolved', 'Feedback Pending'].includes(c.status) ? feedbackFormHtml() : ''}
  `;

  if (isOwner && !feedback && ['Resolved', 'Feedback Pending'].includes(c.status)) {
    wireFeedbackForm(c.complaint_id, () => Pages.complaintDetails(root, params));
  }
};

function feedbackFormHtml() {
  return `
  <div class="card form-card mt-3">
    <h3>Give Feedback</h3>
    <p class="hint">Your complaint has been marked resolved. Let us know if the problem was actually fixed.</p>
    <div id="fbAlert"></div>
    <form id="fbForm">
      <div class="form-group">
        <label>Was your problem actually resolved?</label>
        <div class="radio-pill-group" id="resStatusGroup">
          ${['Yes', 'Partially', 'No'].map(v => `<div class="radio-pill" data-val="${v}">${v}</div>`).join('')}
        </div>
      </div>
      <div class="form-group">
        <label>Rate the service</label>
        <div class="star-rating" id="starRating">
          ${[1,2,3,4,5].map(n => `<span class="star" data-star="${n}">★</span>`).join('')}
        </div>
      </div>
      <div class="form-group"><label for="comment">Comments (optional)</label><textarea id="comment" placeholder="Any additional feedback"></textarea></div>
      <button class="btn btn-primary" type="submit">Submit Feedback</button>
    </form>
  </div>`;
}

function wireFeedbackForm(complaintId, onDone) {
  let resStatus = null, rating = 0;
  document.querySelectorAll('#resStatusGroup .radio-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#resStatusGroup .radio-pill').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      resStatus = pill.dataset.val;
    });
  });
  document.querySelectorAll('#starRating .star').forEach(star => {
    star.addEventListener('click', () => {
      rating = Number(star.dataset.star);
      document.querySelectorAll('#starRating .star').forEach(s => s.classList.toggle('filled', Number(s.dataset.star) <= rating));
    });
  });
  document.getElementById('fbForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('fbAlert');
    if (!resStatus) { alertBox.innerHTML = `<div class="alert alert-error">Please select whether the problem was resolved.</div>`; return; }
    try {
      await Api.post(`/complaints/${complaintId}/feedback`, {
        resolution_status: resStatus, rating, comment: document.getElementById('comment').value.trim(),
      });
      UI.toast(resStatus === 'No' ? 'Complaint reopened based on your feedback' : 'Thank you for your feedback!', 'success');
      onDone();
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
    }
  });
}
