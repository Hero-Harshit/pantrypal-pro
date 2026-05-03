// ============ PantryPal Pro — Landing Page Logic ============

async function initLanding() {
    initScrollAnimations();
    renderTestimonials();
    renderPricing();
}

function renderTestimonials() {
    const grid = $('#testimonialGrid');
    if (!grid || typeof TESTIMONIALS === 'undefined') return;
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
    if (!grid || typeof PLANS === 'undefined') return;
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
    if (typeof openPaymentModal === 'function') {
        openPaymentModal(tier);
    }
};

// Initialize landing page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'landing') {
        initLanding();
    }
});
