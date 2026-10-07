Pages.registerComplaint = async (root) => {
  let categories = [];
  try { categories = await Api.get('/categories'); }
  catch (e) { root.innerHTML = `<div class="section container"><div class="alert alert-error">${UI.escapeHtml(e.message)}</div></div>`; return; }

  const state = {
    step: 1,
    category_id: null,
    area: '', address: '', landmark: '', pincode: '', latitude: null, longitude: null,
    title: '', description: '',
    photoDataUrl: null,
  };

  root.innerHTML = `
  <div class="section container">
    <div class="card form-card">
      <h2>Register a Complaint</h2>
      <p class="section-sub">Five quick steps. You can go back and change anything before submitting.</p>
      <div class="wizard-progress">${[1,2,3,4,5].map(n => `<div class="dot" data-dot="${n}"></div>`).join('')}</div>
      <div id="wizardBody"></div>
      <div id="wizardAlert"></div>
      <div class="wizard-nav">
        <button class="btn btn-outline" id="backBtn">← Back</button>
        <button class="btn btn-primary" id="nextBtn">Continue →</button>
      </div>
    </div>
  </div>`;

  const body = document.getElementById('wizardBody');
  const backBtn = document.getElementById('backBtn');
  const nextBtn = document.getElementById('nextBtn');
  const alertBox = document.getElementById('wizardAlert');

  function updateProgress() {
    document.querySelectorAll('.wizard-progress .dot').forEach(d => {
      d.classList.toggle('done', Number(d.dataset.dot) <= state.step);
    });
    backBtn.style.visibility = state.step === 1 ? 'hidden' : 'visible';
    nextBtn.textContent = state.step === 5 ? '✅ Submit Complaint' : 'Continue →';
  }

  function renderStep() {
    alertBox.innerHTML = '';
    if (state.step === 1) {
      body.innerHTML = `
        <h3>Step 1 — Select Category</h3>
        <div class="category-picker">
          ${categories.map(c => `
            <div class="category-option ${state.category_id === c.category_id ? 'selected' : ''}" data-cat="${c.category_id}">
              <div class="cat-icon">${c.icon}</div>
              <span>${UI.escapeHtml(c.category_name)}</span>
            </div>`).join('')}
        </div>
        <p class="hint mt-2" id="catDesc">${state.category_id ? UI.escapeHtml(categories.find(c => c.category_id === state.category_id).description) : 'Select a category to see its description.'}</p>`;
      body.querySelectorAll('.category-option').forEach(el => {
        el.addEventListener('click', () => {
          state.category_id = Number(el.dataset.cat);
          renderStep();
        });
      });
    }

    if (state.step === 2) {
      body.innerHTML = `
        <h3>Step 2 — Enter Location</h3>
        <div class="form-row">
          <div class="form-group"><label for="area">Area *</label><input type="text" id="area" value="${UI.escapeHtml(state.area)}" placeholder="e.g. Kharghar, Sector 12" /></div>
          <div class="form-group"><label for="pincode">Pincode</label><input type="text" id="pincode" maxlength="6" value="${UI.escapeHtml(state.pincode)}" placeholder="e.g. 410210" /></div>
        </div>
        <div class="form-group"><label for="address">Full Address *</label><input type="text" id="address" value="${UI.escapeHtml(state.address)}" placeholder="House/Plot no., street, society" /></div>
        <div class="form-group"><label for="landmark">Landmark (optional)</label><input type="text" id="landmark" value="${UI.escapeHtml(state.landmark)}" placeholder="e.g. Near Central Park" /></div>
        <button type="button" class="btn btn-outline btn-sm" id="locBtn">📍 Use current location</button>
        <span class="hint" id="locStatus">${state.latitude ? `Location captured (${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)})` : ''}</span>`;
      document.getElementById('locBtn').addEventListener('click', () => {
        const status = document.getElementById('locStatus');
        if (!navigator.geolocation) { status.textContent = 'Geolocation is not supported on this device.'; return; }
        status.textContent = 'Detecting location…';
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            state.latitude = pos.coords.latitude;
            state.longitude = pos.coords.longitude;
            status.textContent = `Location captured (${state.latitude.toFixed(4)}, ${state.longitude.toFixed(4)})`;
          },
          () => { status.textContent = 'Could not detect location. You can still submit using the address fields.'; }
        );
      });
    }

    if (state.step === 3) {
      body.innerHTML = `
        <h3>Step 3 — Describe the Problem</h3>
        <div class="form-group"><label for="title">Short Title *</label><input type="text" id="title" maxlength="150" value="${UI.escapeHtml(state.title)}" placeholder="e.g. Garbage not collected for 3 days" /></div>
        <div class="form-group"><label for="description">Detailed Description *</label><textarea id="description" placeholder="Describe the issue with as much detail as possible (at least 10 characters)">${UI.escapeHtml(state.description)}</textarea></div>`;
    }

    if (state.step === 4) {
      body.innerHTML = `
        <h3>Step 4 — Upload Photo (optional)</h3>
        <div class="upload-box" id="uploadBox">
          <div id="uploadContent">
            ${state.photoDataUrl
              ? `<img src="${state.photoDataUrl}" class="upload-preview" alt="Complaint photo preview" />`
              : `<p>📷 Tap to upload a photo of the issue<br/><span class="hint">JPG, PNG, WEBP or GIF — max 5MB</span></p>`}
          </div>
          <input type="file" id="photoInput" accept="image/*" style="display:none" />
        </div>
        ${state.photoDataUrl ? `<button type="button" class="btn btn-outline btn-sm mt-2" id="removePhotoBtn">Remove photo</button>` : ''}`;
      const uploadBox = document.getElementById('uploadBox');
      const input = document.getElementById('photoInput');
      uploadBox.addEventListener('click', () => input.click());
      input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { UI.toast('Image must be under 5MB', 'error'); return; }
        state.photoDataUrl = await UI.fileToDataUrl(file);
        renderStep();
      });
      const removeBtn = document.getElementById('removePhotoBtn');
      if (removeBtn) removeBtn.addEventListener('click', () => { state.photoDataUrl = null; renderStep(); });
    }

    if (state.step === 5) {
      const cat = categories.find(c => c.category_id === state.category_id);
      body.innerHTML = `
        <h3>Step 5 — Review &amp; Submit</h3>
        <div class="card" style="background:var(--ink-50);border:none;">
          <p><strong>Category:</strong> ${cat.icon} ${UI.escapeHtml(cat.category_name)}</p>
          <p><strong>Title:</strong> ${UI.escapeHtml(state.title)}</p>
          <p><strong>Description:</strong> ${UI.escapeHtml(state.description)}</p>
          <p><strong>Location:</strong> ${UI.escapeHtml(state.address)}, ${UI.escapeHtml(state.area)} ${state.pincode ? '- ' + UI.escapeHtml(state.pincode) : ''}</p>
          ${state.landmark ? `<p><strong>Landmark:</strong> ${UI.escapeHtml(state.landmark)}</p>` : ''}
          ${state.photoDataUrl ? `<img src="${state.photoDataUrl}" class="upload-preview" alt="Complaint photo" />` : '<p class="muted">No photo attached</p>'}
        </div>
        <div class="alert alert-info mt-2">Based on the category, this will be automatically routed to the concerned department — you don't need to select one.</div>`;
    }
    updateProgress();
  }

  function validateStep() {
    if (state.step === 1 && !state.category_id) { alertBox.innerHTML = `<div class="alert alert-error">Please select a category to continue.</div>`; return false; }
    if (state.step === 2) {
      state.area = document.getElementById('area').value.trim();
      state.pincode = document.getElementById('pincode').value.trim();
      state.address = document.getElementById('address').value.trim();
      state.landmark = document.getElementById('landmark').value.trim();
      if (!state.area || !state.address) { alertBox.innerHTML = `<div class="alert alert-error">Area and full address are required.</div>`; return false; }
    }
    if (state.step === 3) {
      state.title = document.getElementById('title').value.trim();
      state.description = document.getElementById('description').value.trim();
      if (!state.title) { alertBox.innerHTML = `<div class="alert alert-error">Please enter a short title.</div>`; return false; }
      if (state.description.length < 10) { alertBox.innerHTML = `<div class="alert alert-error">Please describe the problem in at least 10 characters.</div>`; return false; }
    }
    return true;
  }

  nextBtn.addEventListener('click', async () => {
    if (!validateStep()) return;
    if (state.step < 5) { state.step++; renderStep(); window.scrollTo(0, 0); return; }

    nextBtn.disabled = true;
    nextBtn.textContent = 'Submitting…';
    try {
      const complaint = await Api.post('/complaints', {
        category_id: state.category_id, title: state.title, description: state.description,
        address: state.address, area: state.area, landmark: state.landmark, pincode: state.pincode,
        latitude: state.latitude, longitude: state.longitude, photo: state.photoDataUrl,
      });
      root.innerHTML = `
      <div class="section container text-center">
        <div class="card" style="max-width:520px;margin:0 auto;padding:40px;">
          <div style="font-size:48px;">✅</div>
          <h2>Complaint Registered!</h2>
          <p class="section-sub" style="margin:0 auto 16px;">Your complaint has been submitted and automatically routed.</p>
          <div class="card" style="background:var(--ink-50);border:none;text-align:left;">
            <p><strong>Complaint ID:</strong> ${complaint.complaint_id}</p>
            <p><strong>Department:</strong> ${complaint.department_id ? '' : ''}Assigned automatically</p>
            <p><strong>Expected Resolution:</strong> ${UI.formatDate(complaint.expected_resolution_date)}</p>
          </div>
          <div class="hero-actions" style="justify-content:center;margin-top:20px;">
            <a class="btn btn-primary" href="#/complaint/${complaint.complaint_id}">Track This Complaint</a>
            <a class="btn btn-outline" href="#/dashboard">Go to Dashboard</a>
          </div>
        </div>
      </div>`;
      window.scrollTo(0, 0);
    } catch (err) {
      alertBox.innerHTML = `<div class="alert alert-error">${UI.escapeHtml(err.message)}</div>`;
      nextBtn.disabled = false;
      nextBtn.textContent = '✅ Submit Complaint';
    }
  });

  backBtn.addEventListener('click', () => {
    if (state.step > 1) { state.step--; renderStep(); window.scrollTo(0, 0); }
  });

  renderStep();
};
