// ============ PantryPal Pro — Common Utilities & Global State ============

// ---------- State ----------
let currentUser = null;

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

function updateNavAuth() {
    const authBtns = $('#navAuthBtns');
    if (!authBtns) return;

    if (isLoggedIn()) {
        const user = currentUser || (typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : JSON.parse(localStorage.getItem('pp_user') || 'null'));
        if (!user) return;
        authBtns.innerHTML = `<a href="dashboard.html" class="btn btn-sm btn-outline">Dashboard</a>`;
    } else {
        authBtns.innerHTML = `<a href="auth.html" class="btn btn-primary btn-nav">Get Started Free &rarr;</a>`;
    }
}

// ---------- Theme Management ----------

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
        const user = currentUser || (typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : JSON.parse(localStorage.getItem('pp_user') || 'null'));
        const plan = user ? user.plan : 'free';
        const isLocked = (plan === 'free') || (plan === 'plus' && config.tier === 'pro');

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

function applyTheme(theme) {
    const allThemes = ['dark', 'theme-glass', 'theme-neon', 'theme-gold', 'theme-aqua', 'theme-space', 'theme-lava'];
    document.body.classList.remove(...allThemes);

    if (theme === 'night') {
        document.body.classList.add('dark');
    } else if (theme !== 'greenic') {
        document.body.classList.add(`theme-${theme}`);
    }
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
            if (typeof upgradePlan === 'function') upgradePlan(config.tier);
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

// ---------- Scroll Animations ----------

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

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    const mobileMenu = $('#mobileMenu');
    if (mobileMenu) mobileMenu.classList.remove('open');
}

// ---------- Global Init ----------
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load user from storage
    currentUser = JSON.parse(localStorage.getItem('pp_user') || 'null');

    // 2. Initialize Supabase if available
    if (typeof AuthService !== 'undefined') {
        AuthService.init().then(() => {
            const freshUser = AuthService.getCurrentUser();
            if (freshUser) {
                currentUser = freshUser;
                updateNavAuth();
                if (typeof initDashboard === 'function' && document.body.dataset.page === 'dashboard') initDashboard();
            }
        });
    }

    updateNavAuth();
    initTheme();

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

    // ---------- Smooth scroll for all anchor links ----------
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (a) {
            const href = a.getAttribute('href');
            if (href === '#' || href.includes('javascript:void(0)')) return;

            // If it's an internal link on the same page
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    // Close mobile menu if open
                    const mobileMenu = $('#mobileMenu');
                    if (mobileMenu) mobileMenu.classList.remove('open');
                    const burger = $('#burgerBtn');
                    if (burger) burger.classList.remove('active');
                }
            }
        }
    });
});
