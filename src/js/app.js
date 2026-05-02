// ============ PantryPal Pro — Main App Logic ============

// ---------- State ----------
let currentUser = null;
let activeFilters = new Set();
let detectedIngredients = [];
let dashboardInitialized = false;

const FOOD_QUOTES = [
  "One cannot think well, love well, sleep well, if one has not dined well.",
  "Let food be thy medicine and medicine be thy food.",
  "Cooking is like love. It should be entered into with abandon or not at all.",
  "The only thing I like better than talking about food is eating.",
  "Food is our common ground, a universal experience.",
  "First we eat, then we do everything else.",
  "Good food is the foundation of genuine happiness.",
  "Health is a state of complete harmony of the body, mind and spirit.",
  "A healthy outside starts from the inside.",
  "Eat food. Not too much. Mostly plants.",
  "Laughter is brightest in the place where food is.",
  "People who love to eat are always the best people.",
  "Life is uncertain. Eat dessert first.",
  "The secret of success in life is to eat what you like and let the food fight it out inside.",
  "An empty stomach is not a good political adviser.",
  "Food is not just eating energy. It's an experience.",
  "I followed my heart and it led me to the fridge.",
  "Everything you see I owe to spaghetti.",
  "If you really want to make a friend, go to someone's house and eat with him.",
  "You don't need a silver fork to eat good food."
];

// ---------- Utilities ----------
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ---------- Auth (delegates to AuthService) ----------

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

  // Dashboard sidebar mobile toggle
  const dashBurger = $('#dashboardBurgerBtn');
  const sidebar = $('.sidebar');
  if (dashBurger && sidebar) {
    dashBurger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      dashBurger.classList.toggle('active');
    });
  }

  // Page-specific init
  if (document.body.dataset.page === 'landing') initLanding();
  if (document.body.dataset.page === 'auth') initAuth();
  if (document.body.dataset.page === 'dashboard') initDashboard();
  if (document.body.dataset.page === 'about') initAbout();
  if (document.body.dataset.page === 'contact') initContact();
  if (['privacy', 'terms', 'career'].includes(document.body.dataset.page)) {
    initScrollAnimations();
  }

  // 3. Initialize theme
  initTheme();
});

function initTheme() {
  const savedTheme = localStorage.getItem('pp_theme') || 'greenic';
  applyTheme(savedTheme);

  const themeSelector = $('#themeSelector');
  if (themeSelector) themeSelector.value = savedTheme;
}

window.changeTheme = function (theme) {
  const premiumConfig = {
    glass: { name: 'Glassomorphism', tier: 'pro', icon: '💎' },
    neon: { name: 'Neon', tier: 'plus', icon: '✨' },
    gold: { name: 'Golden Black', tier: 'pro', icon: '🏆' },
    aqua: { name: 'Aqua', tier: 'plus', icon: '🌊' },
    space: { name: 'Space', tier: 'plus', icon: '🌌' },
    lava: { name: 'Lava', tier: 'pro', icon: '🔥' }
  };

  if (premiumConfig[theme]) {
    const config = premiumConfig[theme];
    const isLocked = (currentUser.plan === 'free') || (currentUser.plan === 'plus' && config.tier === 'pro');

    if (isLocked) {
      openThemeLockModal(theme, config);
      const savedTheme = localStorage.getItem('pp_theme') || 'greenic';
      const selector = $('#themeSelector');
      if (selector) selector.value = savedTheme;
      return;
    }
  }

  localStorage.setItem('pp_theme', theme);
  applyTheme(theme);
}

window.openThemeLockModal = function (themeId, config) {
  const modal = $('#themeLockModalOverlay');
  if (!modal) return;

  $('#themeLockIcon').textContent = config.icon;
  $('#themeLockTitle').textContent = `${config.name} Theme Locked`;
  $('#themeLockTier').textContent = `${config.tier.charAt(0).toUpperCase() + config.tier.slice(1)} Feature:`;

  const upgradeBtn = $('#themeLockUpgradeBtn');
  if (upgradeBtn) {
    upgradeBtn.onclick = () => {
      upgradePlan(config.tier);
      closeThemeLockModal();
    };
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

window.closeThemeLockModal = function (e) {
  if (e && e.target !== $('#themeLockModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#themeLockModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function applyTheme(theme) {
  if (theme === 'night') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

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
  initScrollAnimations();
  renderTestimonials();
  renderPricing();
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  $$('.fade-up').forEach(el => observer.observe(el));
}

function initAbout() {
  initScrollAnimations();
  initStatCounters();
}

function initContact() {
  initScrollAnimations();
  
  // FAQ Accordion
  $$('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close others
      $$('.faq-item').forEach(i => i.classList.remove('active'));
      
      if (!isActive) item.classList.add('active');
    });
  });

  // Contact Form
  const form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("Thanks! We'll get back to you within 48 hours.", "success");
      form.reset();
    });
  }
}

function initStatCounters() {
  const stats = $$('.stat-number');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 2000; // 2 seconds
  const frameRate = 1000 / 60; // 60 fps
  const totalFrames = Math.round(duration / frameRate);
  let frame = 0;

  const counter = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    const current = Math.round(target * progress);

    el.textContent = current + suffix;

    if (frame === totalFrames) {
      el.textContent = target + suffix;
      clearInterval(counter);
    }
  }, frameRate);
}

function renderTestimonials() {
  const grid = $('#testimonialGrid');
  if (!grid) return;
  grid.innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card glass-card">
      <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
      <div class="testimonial-author">
        <div class="avatar"><img src="${t.avatar}" alt="${t.name}"></div>
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
        <a href="javascript:void(0)" onclick="handlePricingClick('${k}')" class="btn ${popular ? 'btn-primary' : 'btn-outline'} btn-full">
          ${k === 'free' ? 'Start Free' : 'Get ' + p.name}
        </a>
      </div>
    </div>`;
  }).join('');
}

window.handlePricingClick = function (tier) {
  if (tier === 'free') {
    window.location.href = 'auth.html#signup';
    return;
  }

  // For Plus and Pro, show payment modal
  openPaymentModal(tier);
};

// ===================== PAYMENT GATEWAY LOGIC =====================
window.openPaymentModal = function (tier) {
  const modal = $('#paymentModalOverlay');
  const planName = $('#paymentPlanName');
  const planPrice = $('#paymentPlanPrice');
  const planTotal = $('#paymentTotal');

  if (!modal) return;

  const p = PLANS[tier];
  if (planName) planName.textContent = p.name;
  if (planPrice) planPrice.textContent = p.price;
  if (planTotal) planTotal.textContent = p.price.split('/')[0];

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Reset states
  $('#paymentInitialState').style.display = 'block';
  $('#paymentProcessingState').classList.remove('active');
  $('#paymentSuccessState').classList.remove('active');
};

window.closePaymentModal = function () {
  const modal = $('#paymentModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

function initPaymentFormListeners() {
  const form = $('#paymentForm');
  const cardInput = $('#cardNumber');
  const nameInput = $('#cardName');
  const expiryInput = $('#cardExpiry');
  const cvvInput = $('#cardCVV');

  const previewNumber = $('#previewNumber');
  const previewName = $('#previewName');
  const previewExpiry = $('#previewExpiry');
  const cardTypeDisplay = $('#cardType');

  if (!cardInput) return;

  // Card Number Formatting
  cardInput.oninput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    e.target.value = formattedValue;
    previewNumber.textContent = formattedValue || '•••• •••• •••• ••••';

    // Detect Card Type (Simple)
    if (value.startsWith('4')) cardTypeDisplay.textContent = 'VISA';
    else if (value.startsWith('5')) cardTypeDisplay.textContent = 'MC';
    else cardTypeDisplay.textContent = 'CARD';
  };

  // Name Formatting
  nameInput.oninput = (e) => {
    previewName.textContent = e.target.value || 'Your Name';
  };

  // Expiry Formatting
  expiryInput.oninput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
    previewExpiry.textContent = value || 'MM/YY';
  };

  // Form Submit
  form.onsubmit = (e) => {
    e.preventDefault();
    processPayment();
  };
}

function processPayment() {
  $('#paymentInitialState').style.display = 'none';
  $('#paymentProcessingState').classList.add('active');

  // NOTE: This is a pure frontend mock. 
  // No real payment is processed and no actual plan upgrade occurs.

  // Mock processing delay
  setTimeout(() => {
    $('#paymentProcessingState').classList.remove('active');
    $('#paymentSuccessState').classList.add('active');
  }, 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = $('#closePaymentBtn');
  if (closeBtn) closeBtn.onclick = closePaymentModal;

  const successBtn = $('#paymentSuccessBtn');
  if (successBtn) {
    successBtn.onclick = () => {
      closePaymentModal();
      // Redirect to dashboard without changing user plan (as per requirement)
      window.location.href = 'dashboard.html';
    };
  }

  initPaymentFormListeners();
});

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  const mobileMenu = $('#mobileMenu');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// --- Authentication Handlers ---
let currentSearchQuery = "";

const handleRecipeSearch = debounce(() => {
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
}, 300);

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
window.openAllergyModal = function () {
  const modal = $('#allergyModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeAllergyModal = function (e) {
  if (e && e.target !== $('#allergyModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#allergyModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// Dietary Lock Modal
window.openDietaryLockModal = function () {
  const modal = $('#dietaryLockModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeDietaryLockModal = function (e) {
  if (e && e.target !== $('#dietaryLockModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#dietaryLockModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// User Profile Modal
window.openUserProfileModal = function () {
  const modal = $('#userProfileModalOverlay');
  if (!modal || !currentUser) return;

  // Populate data
  const modalName = $('#modalUserName');
  const modalEmail = $('#modalUserEmail');
  const modalPlan = $('#modalUserPlan');
  const modalPhone = $('#modalUserPhone');
  const modalCountry = $('#modalUserCountry');

  if (modalName) modalName.innerText = currentUser.name;
  if (modalEmail) modalEmail.innerText = currentUser.email || 'No email provided';
  if (modalPlan) modalPlan.innerText = `${currentUser.plan.toUpperCase()} PLAN`;

  // Use mock values if not in user object
  if (modalPhone) modalPhone.innerText = currentUser.phone || '+91 98765 43210';
  if (modalCountry) modalCountry.innerText = currentUser.country || 'India';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeUserProfileModal = function (e) {
  if (e && e.target !== $('#userProfileModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#userProfileModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// Avatar Lock Modal
window.openAvatarLockModal = function () {
  const modal = $('#avatarLockModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeAvatarLockModal = function (e) {
  if (e && e.target !== $('#avatarLockModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#avatarLockModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// Chatbot Lock Modal
window.openChatbotLockModal = function () {
  const modal = $('#chatbotLockModalOverlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeChatbotLockModal = function (e) {
  if (e && e.target !== $('#chatbotLockModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#chatbotLockModalOverlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
};

// Premium Locked Modal
window.openPremiumLockedModal = function (tier) {
  const modal = $('#premiumLockedModalOverlay');
  const title = $('#premiumLockedTitle');
  if (modal) {
    if (title) title.textContent = `Unlock ${tier.charAt(0).toUpperCase() + tier.slice(1)} Recipe`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closePremiumLockedModal = function (e) {
  if (e && e.target !== $('#premiumLockedModalOverlay') && !e.target.classList.contains('modal-close')) return;
  const modal = $('#premiumLockedModalOverlay');
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

function initDailyThought() {
  const thoughtEl = $('#dailyThoughtText');
  if (!thoughtEl) return;

  // Pick a random quote each time the dashboard loads
  const quoteIndex = Math.floor(Math.random() * FOOD_QUOTES.length);
  thoughtEl.textContent = `"${FOOD_QUOTES[quoteIndex]}"`;
}

// ===================== DASHBOARD =====================
async function initDashboard() {
  if (!isLoggedIn()) { window.location.href = 'auth.html'; return; }
  if (!currentUser) return; // Wait for user to load
  if (dashboardInitialized) return;
  dashboardInitialized = true;

  // Shuffle recipes once for variety on dashboard open
  if (typeof RECIPES !== 'undefined') {
    for (let i = RECIPES.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [RECIPES[i], RECIPES[j]] = [RECIPES[j], RECIPES[i]];
    }

    // Randomize images for Plus & Pro recipes
    RECIPES.forEach(r => {
      if (r.tier === 'plus' || r.tier === 'pro') {
        const randomNum = Math.floor(Math.random() * 44) + 1; // 1 to 44
        r.image = `../assets/${randomNum}.jpg`;
      }
    });
  }

  // Greet user
  const greet = $('#userGreeting');
  if (greet) {
    const isPremium = currentUser.plan === 'plus' || currentUser.plan === 'pro';
    const badgeIcon = isPremium ? '<span title="Premium User">💎</span>' : '';
    greet.innerHTML = `${currentUser.name} ${badgeIcon}`;
  }

  // Plan label inside profile
  const userInfoSmall = $('.user-info small');
  if (userInfoSmall) {
    userInfoSmall.innerHTML = `${currentUser.plan.toUpperCase()} PLAN`;
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
        <div class="locked-scanner-banner fade-up">
          <img src="../assets/Fridge Scan Background Image.png" class="banner-bg">
          <div class="banner-overlay">
            <h3 class="banner-title">Fridge Scanning is Locked</h3>
            <p class="banner-subtitle">Upgrade to Plus or Pro to unlock AI Fridge Scanning and discover recipes from what you have.</p>
            <button class="btn btn-primary" onclick="upgradePlan('plus')">Explore Plans</button>
          </div>
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
  $$('.sidebar .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (currentUser.plan === 'pro') {
        const tag = chip.dataset.tag;
        if (activeFilters.has(tag)) {
          activeFilters.delete(tag);
          chip.classList.remove('active');
        } else {
          activeFilters.add(tag);
          chip.classList.add('active');
        }
        renderRecipes();
      } else {
        openDietaryLockModal();
      }
    });
  });

  renderRecipes();
  initDailyThought();
  initScrollAnimations();
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
  const subtitle = $('#catalogueSubtitle');
  if (subtitle) {
    subtitle.textContent = showFavoritesOnly ? 'Your personally saved collection' : 'Established recipes for you';
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
let activeDiet = 'all'; // Default to all to show everything initially

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
  if (activeDiet === 'all') activeDiet = 'veg';
  else if (activeDiet === 'veg') activeDiet = 'non-veg';
  else activeDiet = 'all';

  const btn = $('#dietToggleBtn');
  if (btn) {
    if (activeDiet === 'veg') {
      btn.innerHTML = 'Veg Only';
      btn.style.color = 'var(--primary)';
    } else if (activeDiet === 'non-veg') {
      btn.innerHTML = 'Non-Veg Only';
      btn.style.color = '#ef4444';
    } else {
      btn.innerHTML = 'All Diets';
      btn.style.color = 'var(--text)';
    }
  }

  renderRecipes();
};

let currentPage = 1;
const itemsPerPage = 12;
let allFilteredRecipes = [];
let scrollObserver;

function renderRecipes() {
  const grid = $('#recipeGrid');
  if (!grid) return;

  // Reset pagination
  currentPage = 1;
  grid.innerHTML = `
    <div class="loader-container">
      <div class="spinner"></div>
      <p class="loader-text">Crafting your menu...</p>
    </div>
  `;

  setTimeout(() => {
    allFilteredRecipes = performFiltering();
    grid.innerHTML = ''; // Clear loader
    renderNextBatch(true);
    setupInfiniteScroll();
  }, 400);
}

function performFiltering() {
  let filtered = [...RECIPES];

  if (activeTier !== 'all' || activeMeal !== 'all' || activeCuisine !== 'all' || activeDifficulty !== 'all' || activeDiet !== 'all') {
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
    filtered = filtered.filter(r => [...activeFilters].every(f => r.tags.includes(f)));
  }

  if (typeof currentSearchQuery !== 'undefined' && currentSearchQuery) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(currentSearchQuery));
  }

  if (typeof showFavoritesOnly !== 'undefined' && showFavoritesOnly) {
    filtered = filtered.filter(r => favoriteRecipes.has(r.id));
  }

  const sortOpt = $('#sortRecipes') ? $('#sortRecipes').value : 'popular';

  if (sortOpt === 'popular') {
    filtered.sort((a, b) => {
      // Prioritize Free tier at the top for better conversion/UX
      const tierOrder = { 'free': 0, 'plus': 1, 'pro': 2 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) {
        return tierOrder[a.tier] - tierOrder[b.tier];
      }
      return b.rating - a.rating;
    });
  } else if (sortOpt === 'easy') {
    filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time));
  } else if (sortOpt === 'healthy') {
    filtered.sort((a, b) => parseInt(a.calories) - parseInt(b.calories));
  }

  return filtered;
}

function renderNextBatch(isFirst = false) {
  const grid = $('#recipeGrid');
  if (!grid) return;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const batch = allFilteredRecipes.slice(start, end);

  if (isFirst && batch.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🍽️</div>
        <h3>No Recipes Found</h3>
        <p class="text-muted">Try adjusting your filters or search query.</p>
        <button class="btn btn-outline mt-8" onclick="resetAllFilters()">Reset Filters</button>
      </div>`;
    return;
  }

  const batchHtml = batch.map(r => {
    const locked = currentUser.plan === 'free' && r.tier !== 'free';
    const isFav = favoriteRecipes.has(r.id);

    return `
    <div class="recipe-card recipe-card-reveal ${locked ? 'locked' : ''}" ${locked ? `onclick="openPremiumLockedModal('${r.tier}')"` : `onclick="openRecipeModal(${r.id})"`}>
      <img src="${r.image}" alt="${r.name}" class="recipe-bg-img" loading="lazy">
      <div class="recipe-card-overlay">
        <button class="fav-btn" onclick="toggleFavorite(event, ${r.id})">
          ${isFav ? '♥' : '♡'}
        </button>
        
        ${r.tier !== 'free' ? `<span class="premium-badge">${r.tier.toUpperCase()}</span>` : ''}

        ${locked ? `
          <div class="central-lock">
            <div class="lock-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>
          </div>
        ` : ''}

        <div class="recipe-card-content">
          <h3 class="recipe-title">${r.name}</h3>
          <p class="recipe-description">${r.description}</p>
          <div class="recipe-stats">
            <span class="stat-item"><span class="stat-icon desaturated">🕒</span> ${r.time}</span>
            <span class="stat-item"><span class="stat-icon orange">🔥</span> ${r.calories}</span>
            <span class="stat-item"><span class="stat-icon yellow">⭐</span> ${r.rating}</span>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  // Remove old footer if it exists
  const oldFooter = $('.grid-footer');
  if (oldFooter) oldFooter.remove();

  grid.insertAdjacentHTML('beforeend', batchHtml);

  // Trigger staggered animation
  const newCards = grid.querySelectorAll('.recipe-card-reveal:not(.visible)');
  newCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, index * 150); // Increased stagger to 150ms for more impact
  });

  if (end < allFilteredRecipes.length) {
    grid.insertAdjacentHTML('beforeend', `
      <div id="scrollAnchor" style="grid-column: 1 / -1; height: 50px; display: flex; align-items: center; justify-content: center;">
        <div class="spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>
      </div>
    `);
    const newAnchor = $('#scrollAnchor');
    if (newAnchor && scrollObserver) scrollObserver.observe(newAnchor);
  } else if (allFilteredRecipes.length > 0) {
    grid.insertAdjacentHTML('beforeend', `
      <div class="grid-footer" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; border-top: 1px solid var(--border); margin-top: 2rem; background: var(--bg-secondary); border-radius: var(--radius-lg); opacity: 0.8;">
        <p style="font-size: 1.1rem; color: var(--text); font-weight: 600; margin-bottom: 0.5rem;">✨ You've reached the end. <strong>Thanks for visiting PantryPal Pro!</strong></p>
        <small style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">More gourmet recipes added every week.</small>
      </div>
    `);
  }
}

function setupInfiniteScroll() {
  if (scrollObserver) scrollObserver.disconnect();

  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      currentPage++;
      const anchor = $('#scrollAnchor');
      if (anchor) anchor.remove();
      renderNextBatch();
    }
  }, { threshold: 0.1 });

  const anchor = $('#scrollAnchor');
  if (anchor) scrollObserver.observe(anchor);
}

window.openRecipeModal = function (id) {
  const r = RECIPES.find(r => r.id === id);
  if (!r) return;

  $('#modalRecipeTitle').textContent = r.name;
  $('#modalRecipeDesc').textContent = r.description;

  // Update Meta Info
  const metaContainer = $('#modalRecipeMeta');
  if (metaContainer) {
    metaContainer.innerHTML = `
      <div class="meta-item">
        <span class="meta-icon">🕒</span>
        <span class="meta-label">${r.time}</span>
      </div>
      <div class="meta-item">
        <span class="meta-icon">🔥</span>
        <span class="meta-label">${r.calories} kcal</span>
      </div>
      <div class="meta-item">
        <span class="meta-icon">⭐</span>
        <span class="meta-label">${r.rating} / 5</span>
      </div>
      <div class="meta-divider"></div>
      <span class="badge badge-cuisine">${r.cuisine.toUpperCase()}</span>
      <span class="badge badge-difficulty difficulty-${r.difficulty}">${r.difficulty.toUpperCase()}</span>
    `;
  }

  const ings = r.ingredients || [];
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
        <p style="margin-bottom: 1.5rem; color: #cbd5e1; position: relative; z-index: 5; max-width: 400px;">Explore our Pro plan to watch guided video tutorials from our expert chefs.</p>
        <button class="btn btn-primary" style="position: relative; z-index: 5;" onclick="upgradePlan('pro')">Explore Plans</button>
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
        <p class="text-muted" style="margin-bottom: 1.5rem;">Explore our Plus or Pro plans to read reviews, tips, and share your own cooking experience.</p>
        <button class="btn btn-outline" onclick="upgradePlan('plus')">Explore Plans</button>
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
