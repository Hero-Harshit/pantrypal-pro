// ============ PantryPal Pro — Main App Logic ============

// ---------- State ----------
let currentUser = null;
let activeFilters = new Set();
let detectedIngredients = [];

// ---------- Utilities ----------
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

// ---------- Auth (delegates to AuthService) ----------
function saveUser(user) {
  currentUser = user;
  localStorage.setItem('pp_user', JSON.stringify(user));
}

async function logout() {
  if (typeof AuthService !== 'undefined') {
    await AuthService.signOut();
  } else {
    currentUser = null;
    localStorage.removeItem('pp_user');
  }
  window.location.href = 'landing.html';
}

function isLoggedIn() {
  if (typeof AuthService !== 'undefined') return AuthService.isLoggedIn();
  return !!JSON.parse(localStorage.getItem('pp_user') || 'null');
}

// ---------- Init on every page ----------
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load user from storage immediately (sync)
  currentUser = JSON.parse(localStorage.getItem('pp_user') || 'null');
  if (currentUser && currentUser.plan === 'poor') {
    currentUser.plan = 'free';
    localStorage.setItem('pp_user', JSON.stringify(currentUser));
  }

  // 2. Initialize Supabase auth service in background (async)
  if (typeof AuthService !== 'undefined') {
    AuthService.init().then(() => {
      const freshUser = AuthService.getCurrentUser();
      if (freshUser) {
        currentUser = freshUser;
        updateNavAuth();
        // If we are on dashboard, refresh data with fresh plan if it changed
        if (document.body.dataset.page === 'dashboard') initDashboard();
      }
    });
  }

  updateNavAuth();

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
  if (document.body.dataset.page === 'about') initAbout();
});

function updateNavAuth() {
  const authBtns = $('#navAuthBtns');
  if (!authBtns) return;

  if (isLoggedIn()) {
    const user = currentUser || AuthService.getCurrentUser();
    if (!user) return;
    const isPremium = user.plan === 'plus' || user.plan === 'pro';
    const badgeIcon = isPremium ? '<span title="Premium User">💎</span>' : '';
    authBtns.innerHTML = `
      <a href="dashboard.html" class="btn btn-sm btn-outline">Dashboard</a>`;
  } else {
    authBtns.innerHTML = `
      <a href="auth.html" class="btn btn-primary btn-nav">Get Started Free &rarr;</a>`;
  }
}

// ===================== LANDING PAGE =====================
async function initLanding() {
  renderTestimonials();
  renderPricing();
  initScrollAnimations();
}

function initAbout() {
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
    <div class="pricing-card glass-card tier-${k} ${popular ? 'popular' : ''}">
      ${popular ? '<span class="badge-popular">Most Popular</span>' : ''}
      <div class="card-content-wrap">
        <h3>${p.name}</h3>
        <div class="price">${p.price}</div>
        <p class="recipe-count">${p.recipes} recipes</p>
        <ul>${p.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>
        <a href="auth.html${k === 'free' ? '#signup' : '#login'}" class="btn ${popular ? 'btn-primary' : 'btn-outline'} btn-full">
          ${k === 'free' ? 'Start Free' : 'Get ' + p.name}
        </a>
      </div>
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

// --- Authentication Handlers ---
let currentSearchQuery = "";

function handleRecipeSearch() {
  const inputEl = $('#recipeSearchInput');
  if (!inputEl) return;

  const input = inputEl.value.toLowerCase();
  currentSearchQuery = input;

  const suggestionsBox = $('#searchSuggestions');

  if (input.length > 0) {
    const matches = RECIPES.filter(r => r.name.toLowerCase().includes(input)).slice(0, 5);
    if (matches.length > 0) {
      suggestionsBox.innerHTML = matches.map(m => `<div class="suggestion-item" onclick="selectSearch('${m.name.replace(/'/g, "\\'")}')">${m.name}</div>`).join('');
      suggestionsBox.style.display = 'block';
    } else {
      suggestionsBox.style.display = 'none';
    }
  } else {
    suggestionsBox.style.display = 'none';
  }

  renderRecipes();
}

function selectSearch(name) {
  const inputEl = $('#recipeSearchInput');
  if (inputEl) inputEl.value = name;
  currentSearchQuery = name.toLowerCase();
  const suggestionsBox = $('#searchSuggestions');
  if (suggestionsBox) suggestionsBox.style.display = 'none';
  renderRecipes();
}

document.addEventListener('click', (e) => {
  const suggestionsBox = $('#searchSuggestions');
  if (suggestionsBox && !e.target.closest('.search-container')) {
    suggestionsBox.style.display = 'none';
  }
});

// Allergy Modal
window.openAllergyModal = function() {
  const modal = $('#allergyModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeAllergyModal = function(e) {
  if (e && e.target !== $('#allergyModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#allergyModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// Dietary Lock Modal
window.openDietaryLockModal = function() {
  const modal = $('#dietaryLockModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeDietaryLockModal = function(e) {
  if (e && e.target !== $('#dietaryLockModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#dietaryLockModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// ===================== UTILS =====================
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

  // ── Login ──
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#loginEmail').value.trim();
    const pass = $('#loginPass').value;

    const emailV = Validators.email(email);
    if (!emailV.valid) return showToast(emailV.error, 'error');
    if (!pass) return showToast('Password is required.', 'error');

    const btn = loginForm.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Signing in...';

    const { user, error } = await AuthService.signIn(email, pass);

    btn.disabled = false; btn.textContent = 'Log In';
    if (error) return showToast(error, 'error');

    currentUser = AuthService.getCurrentUser();
    showToast('Welcome back! 👋', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });

  // ── Sign Up ──
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#signupName').value.trim();
    const phone = $('#signupPhone').value.trim();
    const email = $('#signupEmail').value.trim();
    const age = $('#signupAge').value;
    const country = $('#signupCountry').value;
    const pass = $('#signupPass').value;
    const confirm = $('#signupConfirm').value;

    const v = Validators.all(
      Validators.required(name, 'Full Name'),
      Validators.email(email),
      Validators.password(pass),
      Validators.passwordMatch(pass, confirm)
    );
    if (!v.valid) return showToast(v.error, 'error');

    const btn = signupForm.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = 'Creating account...';

    const { user, error } = await AuthService.signUp({ email, password: pass, name, phone, country, age });

    btn.disabled = false; btn.textContent = 'Create Account';
    if (error) return showToast(error, 'error');

    // Check if we have a session (if email confirmation is off)
    currentUser = AuthService.getCurrentUser();

    if (currentUser) {
      showToast('Account created! Welcome to PantryPal 🎉', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } else {
      showToast('Signup successful! Please check your email to confirm your account. 📧', 'info');
      // Switch to login tab
      setTimeout(() => {
        const loginTab = $('#loginTab');
        if (loginTab) loginTab.click();
      }, 3000);
    }
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
async function initDashboard() {
  if (!isLoggedIn()) { window.location.href = 'auth.html'; return; }
  if (!currentUser) return; // Wait for user to load

  // Greet user
  const greet = $('#userGreeting');
  if (greet) {
    const isPremium = currentUser.plan === 'plus' || currentUser.plan === 'pro';
    const badgeIcon = isPremium ? '<span title="Premium User">💎</span>' : '';
    greet.innerHTML = `${currentUser.name} ${badgeIcon}`;
  }

  // Plan badge
  const badge = $('#planBadge');
  if (badge) {
    badge.textContent = currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1) + ' Plan';
    badge.className = 'plan-badge plan-' + currentUser.plan;
  }

  // Use localStorage for favorites
  favoriteRecipes = new Set(JSON.parse(localStorage.getItem('pantryPalFavs') || '[]'));

  // Upload area
  const uploadArea = $('#uploadArea');
  const fileInput = $('#fileInput');
  const pantryScannerSection = $('#pantryScannerSection');

  if (currentUser.plan === 'free') {
    if (pantryScannerSection) {
      pantryScannerSection.innerHTML = `
        <div class="glass-card text-center" style="padding: 3rem;">
          <h3 style="margin-bottom: 1rem;">🔒 Fridge Scanning is Locked</h3>
          <p class="text-muted" style="margin-bottom: 2rem;">Explore our Plus or Pro plans to unlock AI Fridge Scanning.</p>
          <button class="btn btn-primary" onclick="upgradePlan('plus')">Explore Plans</button>
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
      openDietaryLockModal();
    });
  });

  renderRecipes();
}



async function upgradePlan(plan) {
  // Redirect to landing page pricing section
  window.location.href = 'landing.html#pricing';
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

let favoriteRecipes = new Set(JSON.parse(localStorage.getItem('pantryPalFavs') || '[]'));
let showFavoritesOnly = false;

window.toggleFavoriteFilter = function () {
  showFavoritesOnly = !showFavoritesOnly;
  const btn = $('#favFilterBtn');
  if (btn) {
    btn.innerHTML = showFavoritesOnly ? '♥' : '♡';
    btn.style.background = showFavoritesOnly ? '#fff0f0' : 'var(--bg)';
    btn.style.borderColor = showFavoritesOnly ? '#ff4d4d' : 'var(--border-color)';
  }
  renderRecipes();
};

window.toggleFavorite = function (event, id) {
  event.stopPropagation();
  if (favoriteRecipes.has(id)) {
    favoriteRecipes.delete(id);
  } else {
    favoriteRecipes.add(id);
  }
  localStorage.setItem('pantryPalFavs', JSON.stringify([...favoriteRecipes]));
  renderRecipes();
};

let activeTier = 'all';
let activeMeal = 'all';
let activeCuisine = 'all';
let activeDifficulty = 'all';
let activeDiet = 'veg'; // Default to veg based on UI state

window.setTierFilter = function (tier) {
  activeTier = tier;
  renderRecipes();
};

window.setMealFilter = function (meal) {
  activeMeal = meal;
  renderRecipes();
};

window.setCuisineFilter = function (cuisine) {
  activeCuisine = cuisine;
  renderRecipes();
};

window.setDifficultyFilter = function (diff) {
  activeDifficulty = diff;
  renderRecipes();
};

window.toggleDietFilter = function () {
  activeDiet = (activeDiet === 'veg') ? 'non-veg' : 'veg';
  
  const btn = $('#dietToggleBtn');
  if (btn) {
    if (activeDiet === 'veg') {
      btn.innerHTML = 'Veg';
      btn.style.borderColor = '#000000';
      btn.style.color = 'var(--primary)';
    } else {
      btn.innerHTML = 'Non-Veg';
      btn.style.borderColor = '#000000';
      btn.style.color = '#ef4444';
    }
  }
  
  renderRecipes();
};

function renderRecipes() {
  const grid = $('#recipeGrid');
  if (!grid) return;

  let filtered = [...RECIPES];

  if (activeTier !== 'all' || activeMeal !== 'all' || activeCuisine !== 'all' || activeDiet !== 'all') {
    filtered = filtered.filter(r => {
      if (activeTier !== 'all' && r.tier !== activeTier) return false;
      if (activeMeal !== 'all' && r.meal !== activeMeal) return false;
      if (activeCuisine !== 'all' && r.cuisine !== activeCuisine) return false;
      if (activeDifficulty !== 'all' && r.difficulty !== activeDifficulty) return false;
      if (activeDiet === 'veg' && !r.tags.includes('veg')) return false;
      if (activeDiet === 'non-veg' && r.tags.includes('veg')) return false;
      return true;
    });
  }

  if (activeFilters && activeFilters.size > 0) {
    filtered = filtered.filter(r => [...activeFilters].some(f => r.tags.includes(f)));
  }

  if (typeof currentSearchQuery !== 'undefined' && currentSearchQuery) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(currentSearchQuery));
  }

  if (typeof showFavoritesOnly !== 'undefined' && showFavoritesOnly) {
    filtered = filtered.filter(r => favoriteRecipes.has(r.id));
  }

  const sortOpt = $('#sortRecipes') ? $('#sortRecipes').value : 'popular';

  if (sortOpt === 'popular') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortOpt === 'easy') {
    filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
  } else if (sortOpt === 'healthy') {
    filtered.sort((a, b) => parseInt(a.calories) - parseInt(b.calories));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="text-muted text-center" style="grid-column: 1 / -1; padding: 2rem;">No recipes match your filters. Try adjusting your preferences.</p>';
    return;
  }

  grid.innerHTML = filtered.map(r => {
    let locked = false;
    if (r.tier === 'pro' && currentUser.plan !== 'pro') {
      locked = true;
    } else if (r.tier === 'plus' && currentUser.plan === 'free') {
      locked = true;
    }

    const isFav = favoriteRecipes.has(r.id);

    return `
    <div class="recipe-card glass-card ${locked ? 'locked' : ''}" ${locked ? `onclick="showToast('Upgrade to ${r.tier.charAt(0).toUpperCase() + r.tier.slice(1)} to unlock!','info')"` : `onclick="openRecipeModal(${r.id})"`}>
      <div class="recipe-img-wrap">
        <img src="${r.image}" alt="${r.name}" loading="lazy">
        <button class="fav-btn" onclick="toggleFavorite(event, ${r.id})" style="position: absolute; top: 0.5rem; left: 0.5rem; z-index: 5; background: var(--bg); border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; color: #ff4d4d; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); transition: transform 0.2s;">
          ${isFav ? '♥' : '♡'}
        </button>
        ${locked ? `<div class="lock-overlay"><p style="font-weight: 700; font-size: 1.2rem;">${r.tier.charAt(0).toUpperCase() + r.tier.slice(1)} Recipe</p></div>` : ''}
        ${r.tier !== 'free' ? `<span class="premium-badge">${r.tier.toUpperCase()}</span>` : ''}
      </div>
      <div class="recipe-info">
        <h3>${r.name}</h3>
        <p class="recipe-desc text-muted">${r.description}</p>
        <div class="recipe-meta">
          <span>🕐 ${r.time}</span>
          <span>🔥 ${r.calories}</span>
          <span>⭐ ${r.rating}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.openRecipeModal = function (id) {
  const r = RECIPES.find(r => r.id === id);
  if (!r) return;

  $('#modalRecipeTitle').textContent = r.name;
  $('#modalRecipeDesc').textContent = r.description;

  const ings = r.ingredients || ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'];
  $('#modalIngredients').innerHTML = ings.map(i => `<li>${i}</li>`).join('');

  const steps = r.steps || [
    'Prepare all ingredients and wash vegetables.',
    'Heat oil in a pan over medium-high heat.',
    'Cook the main ingredients until golden brown.',
    'Mix in the spices and sauces, let it simmer.',
    'Serve hot and enjoy!'
  ];
  $('#modalSteps').innerHTML = steps.map(s => `<li>${s}</li>`).join('');

  const videoContainer = $('#modalVideoContainer');
  const playbarHtml = `<div class="video-playbar"></div>`;
  if (currentUser.plan === 'pro') {
    videoContainer.innerHTML = `
      <div style="text-align: center; position: relative; z-index: 5;">
        <span style="font-size: 3rem;">▶</span>
        <p style="margin-top: 1rem; font-weight: 600;">Play Premium Video Tutorial</p>
      </div>
      ${playbarHtml}`;
  } else {
    videoContainer.innerHTML = `
      <div class="video-locked">
        <h3 style="margin-bottom: 0.5rem; font-size: 1.5rem; color: #fff; position: relative; z-index: 5;">Video Tutorial Locked</h3>
        <p style="margin-bottom: 1.5rem; color: #cbd5e1; position: relative; z-index: 5; max-width: 400px;">Upgrade to Pro to watch guided video tutorials from our expert chefs.</p>
        <button class="btn btn-primary" style="position: relative; z-index: 5;" onclick="window.location.href='dashboard.html'; currentUser.plan='pro'; saveUser(currentUser); location.reload();">Upgrade to Pro</button>
      </div>
      ${playbarHtml}`;
  }

  const commentsContainer = $('#modalCommentsContainer');
  if (currentUser.plan === 'free') {
    commentsContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
        <h3>Community Comments Locked</h3>
        <p class="text-muted" style="margin-bottom: 1.5rem;">Join Plus or Pro to read reviews, tips, and share your own cooking experience.</p>
        <button class="btn btn-outline" onclick="window.location.href='dashboard.html'; currentUser.plan='plus'; saveUser(currentUser); location.reload();">Unlock Comments</button>
      </div>
    `;
  } else {
    commentsContainer.innerHTML = `
      <h3>Community Comments <span style="color: var(--text-muted); font-size: 1rem; font-weight: normal;">(2)</span></h3>
      <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="padding: 1.5rem; background: var(--glass-bg); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong>Sarah M.</strong>
            <span class="text-muted" style="font-size: 0.8rem;">2 hours ago</span>
          </div>
          <p style="margin-top: 0.5rem; font-size: 0.95rem;">Turned out absolutely amazing! Added a bit of extra garlic and it was perfect.</p>
        </div>
        <div style="padding: 1.5rem; background: var(--glass-bg); border-radius: var(--radius-md); border: 1px solid var(--border);">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <strong>Chef John <span class="tag" style="margin-left: 0.5rem; font-size: 0.6rem; padding: 0.1rem 0.3rem;">PRO</span></strong>
            <span class="text-muted" style="font-size: 0.8rem;">Yesterday</span>
          </div>
          <p style="margin-top: 0.5rem; font-size: 0.95rem;">Great recipe. Highly recommend roasting the veggies first for extra flavor.</p>
        </div>
      </div>
      <div style="margin-top: 2rem; display: flex; gap: 1rem;">
        <input type="text" class="input" placeholder="Add a comment..." style="flex: 1; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg);">
        <button class="btn btn-primary" onclick="showToast('Comment posted!','success')">Post</button>
      </div>
    `;
  }

  $('#recipeModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeRecipeModal = function (e) {
  if (e && e.target !== $('#recipeModalOverlay') && e.target.className !== 'modal-close') return;
  $('#recipeModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
};

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
