// src/js/dashboard.js — mock simulation code removed 2026-05-03
// Real server integrations are marked with 🔌
// ============ PantryPal Pro — Dashboard Logic ============

let activeFilters = new Set();
let detectedIngredients = [];
let dashboardInitialized = false;
let currentSearchQuery = "";
let favoriteRecipes = new Set(JSON.parse(localStorage.getItem('pantryPalFavs') || '[]'));
let showFavoritesOnly = false;
let currentView = 'grid'; // 'grid' or 'list'
let activeTier = 'all';
let activeMeal = 'all';
let activeCuisine = 'all';
let activeDifficulty = 'all';
let activeDiet = 'all';
let currentPage = 1;
const itemsPerPage = 12;
let allFilteredRecipes = [];
let scrollObserver;

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

// MOCK_INGREDIENTS removed — See data.js for details

async function initDashboard() {
    if (!isLoggedIn()) { window.location.href = 'auth.html'; return; }
    const user = currentUser || (typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : JSON.parse(localStorage.getItem('pp_user') || 'null'));
    if (!user) return; 
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
                const randomNum = Math.floor(Math.random() * 44) + 1;
                r.image = `../assets/${randomNum}.jpg`;
            }
        });
    }

    // Greet user
    const greet = $('#userGreeting');
    if (greet) {
        const isPremium = user.plan === 'plus' || user.plan === 'pro';
        const badgeIcon = isPremium ? '<span title="Premium User">💎</span>' : '';
        greet.innerHTML = `${user.name} ${badgeIcon}`;
    }

    // Plan label inside profile
    const userInfoSmall = $('.user-info small');
    if (userInfoSmall) {
        userInfoSmall.innerHTML = `${user.plan.toUpperCase()} PLAN`;
    }

    favoriteRecipes = new Set(JSON.parse(localStorage.getItem('pantryPalFavs') || '[]'));

    // Upload area
    const pantryScannerSection = $('#pantryScannerSection');
    if (user.plan === 'free') {
        if (pantryScannerSection) {
            pantryScannerSection.innerHTML = `
        <div class="locked-scanner-banner fade-up">
          <img src="../assets/Fridge Scan Background Image.png" class="banner-bg">
          <div class="banner-overlay">
            <h3 class="banner-title">Fridge Scanning is Locked</h3>
            <p class="banner-subtitle">Upgrade to Plus or Pro to unlock AI Fridge Scanning and discover recipes from what you have.</p>
            <button class="btn btn-primary" onclick="upgradePlan('plus')">Explore Plans</button>
          </div>
        </div>`;
        }
    } else {
        const uploadArea = $('#uploadArea');
        const fileInput = $('#fileInput');
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
            if (user.plan === 'pro') {
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

function initDailyThought() {
    const thoughtEl = $('#dailyThoughtText');
    if (!thoughtEl) return;
    const quoteIndex = Math.floor(Math.random() * FOOD_QUOTES.length);
    thoughtEl.textContent = `"${FOOD_QUOTES[quoteIndex]}"`;
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

window.scanPantry = function () {
    // ─────────────────────────────────────────────
    // 🔌 SERVER CALL PLACEHOLDER
    // What this does: Processes the uploaded fridge photo to detect ingredients.
    // Future implementation: This function will:
    // (a) receive the uploaded image file,
    // (b) send it to a computer vision API endpoint (e.g. Claude Vision),
    // (c) receive back a JSON array of detected ingredient names,
    // (d) pass those to the recipe matching function.
    // Phase: Phase 2
    // ─────────────────────────────────────────────
    showToast('AI Scanner integration planned for Phase 2', 'info');
}

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

window.setTierFilter = function (tier) { activeTier = tier; renderRecipes(); };
window.setMealFilter = function (meal) { activeMeal = meal; renderRecipes(); };
window.setCuisineFilter = function (cuisine) { activeCuisine = cuisine; renderRecipes(); };
window.setDifficultyFilter = function (diff) { activeDifficulty = diff; renderRecipes(); };

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

window.selectSearch = function (name) {
    const inputEl = $('#recipeSearchInput');
    if (inputEl) inputEl.value = name;
    currentSearchQuery = name.toLowerCase();
    const suggestionsBox = $('#searchSuggestions');
    if (suggestionsBox) suggestionsBox.style.display = 'none';
    renderRecipes();
}

function renderRecipes() {
    const grid = $('#recipeGrid');
    if (!grid) return;
    currentPage = 1;
    grid.innerHTML = `<div class="loader-container"><div class="spinner"></div><p class="loader-text">Crafting your menu...</p></div>`;
    setTimeout(() => {
        allFilteredRecipes = performFiltering();
        grid.innerHTML = '';
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
    if (currentSearchQuery) {
        filtered = filtered.filter(r => r.name.toLowerCase().includes(currentSearchQuery));
    }
    if (showFavoritesOnly) {
        filtered = filtered.filter(r => favoriteRecipes.has(r.id));
    }

    const sortOpt = $('#sortRecipes') ? $('#sortRecipes').value : 'popular';
    if (sortOpt === 'popular') {
        filtered.sort((a, b) => {
            const tierOrder = { 'free': 0, 'plus': 1, 'pro': 2 };
            if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier];
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
    const user = currentUser || (typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : JSON.parse(localStorage.getItem('pp_user') || 'null'));

    if (isFirst && batch.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 5rem 2rem;"><div style="font-size: 3rem; margin-bottom: 1rem;">🍽️</div><h3>No Recipes Found</h3><p class="text-muted">Try adjusting your filters or search query.</p><button class="btn btn-outline mt-8" onclick="resetAllFilters()">Reset Filters</button></div>`;
        return;
    }

    const batchHtml = batch.map(r => {
        const locked = user && user.plan === 'free' && r.tier !== 'free';
        const isFav = favoriteRecipes.has(r.id);
        
        if (currentView === 'list') {
            return `
            <div class="recipe-list-item recipe-card-reveal ${locked ? 'locked' : ''}" ${locked ? `onclick="openPremiumLockedModal('${r.tier}')"` : `onclick="openRecipeModal(${r.id})"`}>
              <div class="list-img-wrap">
                <img src="${r.image}" alt="${r.name}" loading="lazy">
                ${locked ? `<div class="list-lock">🔒</div>` : ''}
              </div>
              <div class="list-details">
                <div class="list-header">
                  <h3 class="recipe-title">${r.name}</h3>
                  <div class="list-actions">
                    ${r.tier !== 'free' ? `<span class="premium-badge-inline">${r.tier.toUpperCase()}</span>` : ''}
                    <button class="fav-btn-inline" onclick="toggleFavorite(event, ${r.id})">${isFav ? '♥' : '♡'}</button>
                  </div>
                </div>
                <p class="recipe-description">${r.description}</p>
                <div class="recipe-stats-inline">
                  <span class="stat-item desaturated">🕒 ${r.time}</span>
                  <span class="stat-item orange">🔥 ${r.calories} kcal</span>
                  <span class="stat-item yellow">⭐ ${r.rating}</span>
                </div>
              </div>
            </div>`;
        }

        return `
    <div class="recipe-card recipe-card-reveal ${locked ? 'locked' : ''}" ${locked ? `onclick="openPremiumLockedModal('${r.tier}')"` : `onclick="openRecipeModal(${r.id})"`}>
      <img src="${r.image}" alt="${r.name}" class="recipe-bg-img" loading="lazy">
      <div class="recipe-card-overlay">
        <button class="fav-btn" onclick="toggleFavorite(event, ${r.id})">${isFav ? '♥' : '♡'}</button>
        ${r.tier !== 'free' ? `<span class="premium-badge">${r.tier.toUpperCase()}</span>` : ''}
        ${locked ? `<div class="central-lock"><div class="lock-circle"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg></div></div>` : ''}
        <div class="recipe-card-content">
          <h3 class="recipe-title">${r.name}</h3>
          <p class="recipe-description">${r.description}</p>
          <div class="recipe-stats">
            <span class="stat-item desaturated">🕒 ${r.time}</span>
            <span class="stat-item orange">🔥 ${r.calories}</span>
            <span class="stat-item yellow">⭐ ${r.rating}</span>
          </div>
        </div>
      </div>
    </div>`;
    }).join('');

    const oldFooter = $('.grid-footer');
    if (oldFooter) oldFooter.remove();
    grid.insertAdjacentHTML('beforeend', batchHtml);

    const newCards = grid.querySelectorAll('.recipe-card-reveal:not(.visible)');
    newCards.forEach((card, index) => { setTimeout(() => card.classList.add('visible'), index * 150); });

    if (end < allFilteredRecipes.length) {
        grid.insertAdjacentHTML('beforeend', `<div id="scrollAnchor" style="grid-column: 1 / -1; height: 50px; display: flex; align-items: center; justify-content: center;"><div class="spinner" style="width: 30px; height: 30px; border-width: 3px;"></div></div>`);
        const newAnchor = $('#scrollAnchor');
        if (newAnchor && scrollObserver) scrollObserver.observe(newAnchor);
    } else if (allFilteredRecipes.length > 0) {
        grid.insertAdjacentHTML('beforeend', `<div class="grid-footer" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; border-top: 1px solid var(--border); margin-top: 2rem; background: var(--bg-secondary); border-radius: var(--radius-lg); opacity: 0.8;"><p style="font-size: 1.1rem; color: var(--text); font-weight: 600; margin-bottom: 0.5rem;">✨ You've reached the end. <strong>Thanks for visiting PantryPal Pro!</strong></p><small style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; font-weight: 500;">More gourmet recipes added every week.</small></div>`);
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
    const user = currentUser || (typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : JSON.parse(localStorage.getItem('pp_user') || 'null'));

    $('#modalRecipeTitle').textContent = r.name;
    $('#modalRecipeDesc').textContent = r.description;
    const metaContainer = $('#modalRecipeMeta');
    if (metaContainer) {
        metaContainer.innerHTML = `<div class="meta-item"><span>🕒</span><span>${r.time}</span></div><div class="meta-item"><span>🔥</span><span>${r.calories} kcal</span></div><div class="meta-item"><span>⭐</span><span>${r.rating} / 5</span></div><div class="meta-divider"></div><span class="badge badge-cuisine">${r.cuisine.toUpperCase()}</span><span class="badge badge-difficulty difficulty-${r.difficulty}">${r.difficulty.toUpperCase()}</span>`;
    }
    $('#modalIngredients').innerHTML = (r.ingredients || []).map(i => `<li>${i}</li>`).join('');
    $('#modalSteps').innerHTML = (r.steps || []).map(s => `<li>${s}</li>`).join('');

    const videoContainer = $('#modalVideoContainer');
    const playbarHtml = `<div class="video-playbar"></div>`;
    if (user && user.plan === 'pro') {
        videoContainer.innerHTML = `<div style="text-align: center; position: relative; z-index: 5;"><span style="font-size: 3rem;">▶</span><p style="margin-top: 1rem; font-weight: 600;">Play Premium Video Tutorial</p></div>${playbarHtml}`;
    } else {
        videoContainer.innerHTML = `<div class="video-locked"><h3 style="margin-bottom: 0.5rem; font-size: 1.5rem; color: #fff; position: relative; z-index: 5;">Video Tutorial Locked</h3><p style="margin-bottom: 1.5rem; color: #cbd5e1; position: relative; z-index: 5; max-width: 400px;">Explore our Pro plan to watch guided video tutorials from our expert chefs.</p><button class="btn btn-primary" style="position: relative; z-index: 5;" onclick="upgradePlan('pro')">Explore Plans</button></div>${playbarHtml}`;
    }

    const commentsContainer = $('#modalCommentsContainer');
    if (user && user.plan === 'free') {
        commentsContainer.innerHTML = `<div style="text-align: center; padding: 3rem; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border);"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg><h3>Community Comments Locked</h3><p class="text-muted" style="margin-bottom: 1.5rem;">Explore our Plus or Pro plans to read reviews, tips, and share your own cooking experience.</p><button class="btn btn-outline" onclick="upgradePlan('plus')">Explore Plans</button></div>`;
    } else {
        commentsContainer.innerHTML = `<h3>Community Comments <span style="color: var(--text-muted); font-size: 1rem; font-weight: normal;">(2)</span></h3><div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;"><div style="padding: 1.5rem; background: var(--glass-bg); border-radius: var(--radius-md); border: 1px solid var(--border);"><div style="display: flex; align-items: center; justify-content: space-between;"><strong>Sarah M.</strong><span class="text-muted" style="font-size: 0.8rem;">2 hours ago</span></div><p style="margin-top: 0.5rem; font-size: 0.95rem;">Turned out absolutely amazing! Added a bit of extra garlic and it was perfect.</p></div><div style="padding: 1.5rem; background: var(--glass-bg); border-radius: var(--radius-md); border: 1px solid var(--border);"><div style="display: flex; align-items: center; justify-content: space-between;"><strong>Chef John <span class="tag" style="margin-left: 0.5rem; font-size: 0.6rem; padding: 0.1rem 0.3rem;">PRO</span></strong><span class="text-muted" style="font-size: 0.8rem;">Yesterday</span></div><p style="margin-top: 0.5rem; font-size: 0.95rem;">Great recipe. Highly recommend roasting the veggies first for extra flavor.</p></div></div><div style="margin-top: 2rem; display: flex; gap: 1rem;"><input type="text" class="input" placeholder="Add a comment..." style="flex: 1; padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg);"><button class="btn btn-primary" onclick="showToast('Comment posted!','success')">Post</button></div>`;
    }

    $('#recipeModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeRecipeModal = function (e) {
    if (e && e.target !== $('#recipeModalOverlay') && e.target.className !== 'modal-close') return;
    $('#recipeModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
};

// Other Modals
window.openAllergyModal = function () { const modal = $('#allergyModalOverlay'); if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; } };
window.closeAllergyModal = function (e) { if (e && e.target !== $('#allergyModalOverlay') && !e.target.classList.contains('modal-close')) return; const modal = $('#allergyModalOverlay'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } };
window.openDietaryLockModal = function () { const modal = $('#dietaryLockModalOverlay'); if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; } };
window.closeDietaryLockModal = function (e) { if (e && e.target !== $('#dietaryLockModalOverlay') && !e.target.classList.contains('modal-close')) return; const modal = $('#dietaryLockModalOverlay'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } };
window.openUserProfileModal = function () {
    const modal = $('#userProfileModalOverlay');
    const user = currentUser || (typeof AuthService !== 'undefined' ? AuthService.getCurrentUser() : JSON.parse(localStorage.getItem('pp_user') || 'null'));
    if (!modal || !user) return;
    $('#modalUserName').innerText = user.name;
    $('#modalUserEmail').innerText = user.email || 'No email provided';
    $('#modalUserPlan').innerText = `${user.plan.toUpperCase()} PLAN`;
    $('#modalUserPhone').innerText = user.phone || '+91 98765 43210';
    $('#modalUserCountry').innerText = user.country || 'India';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};
window.closeUserProfileModal = function (e) { if (e && e.target !== $('#userProfileModalOverlay') && !e.target.classList.contains('modal-close')) return; const modal = $('#userProfileModalOverlay'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } };
window.openAvatarLockModal = function () { const modal = $('#avatarLockModalOverlay'); if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; } };
window.closeAvatarLockModal = function (e) { if (e && e.target !== $('#avatarLockModalOverlay') && !e.target.classList.contains('modal-close')) return; const modal = $('#avatarLockModalOverlay'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } };
window.openChatbotLockModal = function () { const modal = $('#chatbotLockModalOverlay'); if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; } };
window.closeChatbotLockModal = function (e) { if (e && e.target !== $('#chatbotLockModalOverlay') && !e.target.classList.contains('modal-close')) return; const modal = $('#chatbotLockModalOverlay'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } };
window.openPremiumLockedModal = function (tier) {
    const modal = $('#premiumLockedModalOverlay');
    if (modal) {
        const title = $('#premiumLockedTitle');
        if (title) title.textContent = `Unlock ${tier.charAt(0).toUpperCase() + tier.slice(1)} Recipe`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};
window.closePremiumLockedModal = function (e) { if (e && e.target !== $('#premiumLockedModalOverlay') && !e.target.classList.contains('modal-close')) return; const modal = $('#premiumLockedModalOverlay'); if (modal) { modal.classList.remove('active'); document.body.style.overflow = 'auto'; } };

window.upgradePlan = function (plan) { window.location.href = 'landing.html#pricing'; };

window.changeView = function (view) {
    currentView = view;
    const grid = $('#recipeGrid');
    if (grid) {
        if (view === 'list') {
            grid.classList.add('list-view-active');
        } else {
            grid.classList.remove('list-view-active');
        }
    }
    renderRecipes();
};

window.resetAllFilters = function () {
    activeTier = 'all'; activeMeal = 'all'; activeCuisine = 'all'; activeDifficulty = 'all'; activeDiet = 'all';
    currentSearchQuery = "";
    activeFilters.clear();
    const searchInput = $('#recipeSearchInput');
    if (searchInput) searchInput.value = "";
    $$('.filter-chip').forEach(c => c.classList.remove('active'));
    renderRecipes();
};

// Initialize dashboard page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'dashboard') {
        initDashboard();
    }
});
