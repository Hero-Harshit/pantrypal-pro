// ============ PantryPal Pro — Main App Logic ============

// ---------- State ----------
let currentUser = JSON.parse(localStorage.getItem('pp_user')) || null;
let darkMode = localStorage.getItem('pp_dark') === 'true';
let activeFilters = new Set();
let detectedIngredients = [];

// ---------- Utilities ----------
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function applyDarkMode() {
  document.documentElement.classList.toggle('dark', darkMode);
  localStorage.setItem('pp_dark', darkMode);
  const icon = $('#darkToggleIcon');
  if (icon) icon.textContent = darkMode ? '☀️' : '🌙';
}

function toggleDark() {
  darkMode = !darkMode;
  applyDarkMode();
}

// ---------- Auth ----------
function saveUser(user) {
  currentUser = user;
  localStorage.setItem('pp_user', JSON.stringify(user));
}

function logout() {
  currentUser = null;
  localStorage.removeItem('pp_user');
  window.location.href = 'index.html';
}

function isLoggedIn() { return !!currentUser; }

// ---------- Init on every page ----------
document.addEventListener('DOMContentLoaded', () => {
  applyDarkMode();

  // Update nav auth buttons
  const authBtns = $('#navAuthBtns');
  if (authBtns) {
    if (isLoggedIn()) {
      const isPremium = currentUser.plan === 'plus' || currentUser.plan === 'pro';
      const badgeIcon = isPremium ? '<span title="Premium User">💎</span>' : '';
      authBtns.innerHTML = `
        <span class="nav-user">👋 ${currentUser.name.split(' ')[0]} ${badgeIcon}</span>
        <a href="dashboard.html" class="btn btn-sm btn-outline">Dashboard</a>
        <button onclick="logout()" class="btn btn-sm btn-ghost">Logout</button>`;
    } else {
      authBtns.innerHTML = `
        <a href="auth.html" class="btn btn-primary btn-nav">Get Started Free &rarr;</a>`;
    }
  }

  // Mobile menu
  const burger = $('#burgerBtn');
  const mobileMenu = $('#mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      burger.classList.toggle('active');
    });
  }

  // Page-specific init
  if (document.body.dataset.page === 'landing') initLanding();
  if (document.body.dataset.page === 'auth') initAuth();
  if (document.body.dataset.page === 'dashboard') initDashboard();
});

// ===================== LANDING PAGE =====================
function initLanding() {
  renderTestimonials();
  renderPricing();
  initScrollAnimations();
}

function renderTestimonials() {
  const grid = $('#testimonialGrid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card glass-card">
      <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="avatar">${t.avatar}</div>
        <div><strong>${t.name}</strong><br><small>${t.role}</small></div>
      </div>
    </div>`).join('');
}

function renderPricing() {
  const grid = $('#pricingGrid');
  if (!grid) return;
  const keys = ['free', 'plus', 'pro'];
  grid.innerHTML = keys.map(k => {
    const p = PLANS[k];
    const popular = k === 'pro';
    return `
    <div class="pricing-card glass-card ${popular ? 'popular' : ''}">
      ${popular ? '<span class="badge-popular">Most Popular</span>' : ''}
      <h3>${p.name}</h3>
      <div class="price">${p.price}</div>
      <p class="recipe-count">${p.recipes} recipes</p>
      <ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>
      <a href="auth.html${k === 'free' ? '#signup' : '#login'}" class="btn ${popular ? 'btn-primary' : 'btn-outline'} btn-full">
        ${k === 'free' ? 'Start Free' : 'Get ' + p.name}
      </a>
    </div>`;
  }).join('');
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  $$('.fade-up').forEach(el => observer.observe(el));
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  const mobileMenu = $('#mobileMenu');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// ===================== AUTH PAGE =====================
function initAuth() {
  initScrollAnimations();
  if (isLoggedIn()) { window.location.href = 'dashboard.html'; return; }

  const loginTab = $('#loginTab');
  const signupTab = $('#signupTab');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList.add('active');
    signupForm.classList.remove('active');
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#loginEmail').value;
    const pass = $('#loginPass').value;
    if (!email || !pass) return showToast('Please fill all fields', 'error');
    // Mock login
    saveUser({ name: email.split('@')[0], email, plan: 'free' });
    showToast('Welcome back!', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });

  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#signupName').value;
    const phone = $('#signupPhone').value;
    const email = $('#signupEmail').value;
    const age = $('#signupAge').value;
    const country = $('#signupCountry').value;
    const pass = $('#signupPass').value;
    const confirm = $('#signupConfirm').value;
    
    if (!name || !phone || !email || !age || !country || !pass || !confirm) {
      return showToast('Please fill all fields', 'error');
    }
    if (pass !== confirm) return showToast('Passwords do not match', 'error');
    if (pass.length < 6) return showToast('Password must be at least 6 characters', 'error');
    
    saveUser({ name, email, plan: 'free' });
    showToast('Account created!', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });

  const loginToSignupBtn = $('#loginToSignupBtn');
  if (loginToSignupBtn) {
    loginToSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupTab.click();
      window.history.pushState(null, null, '#signup');
    });
  }

  if (window.location.hash === '#signup') {
    signupTab.click();
  } else if (window.location.hash === '#login') {
    loginTab.click();
  }
}

// ===================== DASHBOARD =====================
function initDashboard() {
  if (!isLoggedIn()) { window.location.href = 'auth.html'; return; }

  // Greet user
  const greet = $('#userGreeting');
  if (greet) {
    const isPremium = currentUser.plan === 'plus' || currentUser.plan === 'pro';
    const badgeIcon = isPremium ? '<span title="Premium User">💎</span>' : '';
    greet.innerHTML = `Hello, ${currentUser.name} 👋 ${badgeIcon}`;
  }

  // Plan badge
  const badge = $('#planBadge');
  if (badge) {
    badge.textContent = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1) + ' Plan';
    badge.className = 'plan-badge plan-' + currentUser.plan;
  }

  const upgradeSidebar = $('#upgradeSidebar');
  if (upgradeSidebar) {
    if (currentUser.plan === 'pro') {
      upgradeSidebar.innerHTML = `
        <div style="padding: 1.5rem;">
          <h4>Your Pro Plan</h4>
          <p class="text-muted"><small>Unlimited access and priority support.</small></p>
          <div style="margin-top: 1rem;">
            <div class="flex justify-between"><small>Daily Scans</small><small>10/10</small></div>
            <div class="goal-bar mt-8" style="height:4px; margin-top:4px;"><div class="goal-fill" style="width:100%"></div></div>
            
            <div class="flex justify-between" style="margin-top: 1rem;"><small>Monthly Quota</small><small>25/25</small></div>
            <div class="goal-bar mt-8" style="height:4px; margin-top:4px;"><div class="goal-fill gf-green" style="width:100%"></div></div>
          </div>
        </div>
      `;
    } else if (currentUser.plan === 'plus') {
      upgradeSidebar.innerHTML = `
        <div style="padding: 1.5rem;">
          <h4>Upgrade to Pro</h4>
          <p class="text-muted"><small>Get 10 daily scans and priority 24/7 support.</small></p>
          <div style="margin-top: 1rem;">
            <div class="flex justify-between"><small>Daily Scans</small><small>5/5</small></div>
            <div class="goal-bar mt-8" style="height:4px; margin-top:4px;"><div class="goal-fill" style="width:100%"></div></div>
          </div>
          <button class="btn btn-primary btn-full btn-sm" style="margin-top:1.5rem;"
            onclick="showToast('Upgraded to Pro (Demo)', 'success'); currentUser.plan='pro'; saveUser(currentUser); location.reload();">Upgrade to Pro</button>
        </div>
      `;
    }
  }

  // Upload area
  const uploadArea = $('#uploadArea');
  const fileInput = $('#fileInput');
  const pantryScannerSection = $('#pantryScannerSection');

  if (currentUser.plan === 'free') {
    if (pantryScannerSection) {
      pantryScannerSection.innerHTML = `
        <div class="glass-card text-center" style="padding: 3rem;">
          <h3 style="margin-bottom: 1rem;">🔒 Fridge Scanning is Locked</h3>
          <p class="text-muted" style="margin-bottom: 2rem;">Upgrade to Plus or Pro to unlock AI Fridge Scanning and get personalized recipes based on your ingredients.</p>
          <button class="btn btn-primary" onclick="showToast('Upgraded to Plus (Demo)', 'success'); currentUser.plan='plus'; saveUser(currentUser); location.reload();">Upgrade to Plus</button>
        </div>
      `;
    }
  } else {
    if (uploadArea && fileInput) {
      uploadArea.addEventListener('click', () => fileInput.click());
      uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('dragover'); });
      uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
      uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleImageUpload(e.dataTransfer.files[0]);
      });
      fileInput.addEventListener('change', e => handleImageUpload(e.target.files[0]));
    }
  }

  // Dietary filter chips
  $$('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const tag = chip.dataset.tag;
      activeFilters.has(tag) ? activeFilters.delete(tag) : activeFilters.add(tag);
      renderRecipes();
    });
  });

  renderRecipes();
}

function handleImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) return showToast('Please upload an image', 'error');

  const preview = $('#uploadPreview');
  const uploadContent = $('#uploadContent');
  const scanBtn = $('#scanBtn');
  const reader = new FileReader();

  reader.onload = e => {
    preview.src = e.target.result;
    preview.style.display = 'block';
    uploadContent.style.display = 'none';
    scanBtn.style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
}

// Ensure function is attached to window so inline onclick="scanPantry()" works
window.scanPantry = function () {
  const scanBtn = $('#scanBtn');
  const resultsArea = $('#scanResults');
  scanBtn.textContent = 'Scanning...';
  scanBtn.disabled = true;

  // Simulate AI scanning
  setTimeout(() => {
    detectedIngredients = [...MOCK_INGREDIENTS];
    resultsArea.innerHTML = `
      <h3 style="margin-bottom: 1rem;">🔍 AI Detected Ingredients</h3>
      <div class="recipe-tags">
        ${detectedIngredients.map(i => `<span class="tag tag-veg">✓ ${i}</span>`).join('')}
      </div>`;
    resultsArea.style.display = 'block';
    scanBtn.textContent = 'Scan Complete ✓';
    showToast('Ingredients detected!', 'success');
    renderRecipes();
  }, 1500);
}

function renderRecipes() {
  const grid = $('#recipeGrid');
  if (!grid) return;

  let filtered = [...RECIPES];
  if (activeFilters.size > 0) {
    filtered = filtered.filter(r => [...activeFilters].some(f => r.tags.includes(f)));
  }

  const sortOpt = $('#sortRecipes') ? $('#sortRecipes').value : 'popular';

  if (sortOpt === 'popular') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortOpt === 'time' || sortOpt === 'easy') {
    filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
  } else if (sortOpt === 'calories') {
    filtered.sort((a, b) => parseInt(a.calories) - parseInt(b.calories));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-muted text-center" style="grid-column: 1 / -1; padding: 2rem;">No recipes match your filters. Try adjusting your preferences.</p>';
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const locked = r.premium && currentUser.plan === 'free';
    return `
    <div class="recipe-card glass-card ${locked ? 'locked' : ''}">
      <div class="recipe-img-wrap">
        <img src="${r.image}" alt="${r.name}" loading="lazy">
        ${locked ? '<div class="lock-overlay"><span>🔒</span><p>Premium Recipe</p></div>' : ''}
        ${r.premium ? '<span class="premium-badge">PRO</span>' : ''}
      </div>
      <div class="recipe-info">
        <h3>${r.name}</h3>
        <p class="recipe-desc text-muted">${r.description}</p>
        <div class="recipe-meta">
          <span>🕐 ${r.time}</span>
          <span>🔥 ${r.calories}</span>
          <span>⭐ ${r.rating}</span>
        </div>
        <div class="recipe-tags">
          ${r.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('')}
        </div>
        ${locked ? `<button class="btn btn-primary btn-full btn-sm" onclick="showToast('Upgrade to Pro to unlock!','info')">Unlock Recipe</button>` : `<button class="btn btn-outline btn-full btn-sm">View Recipe</button>`}
      </div>
    </div>`;
  }).join('');
}

// ---------- Toast Notifications ----------
window.showToast = function (msg, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------- Smooth scroll for anchor links ----------
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (a) {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }
});
