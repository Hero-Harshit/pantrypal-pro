// ============ PantryPal Pro — Contact Page Logic ============

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
            if (typeof showToast === 'function') {
                showToast("Thanks! We'll get back to you within 48 hours.", "success");
            } else {
                alert("Thanks! We'll get back to you within 48 hours.");
            }
            form.reset();
        });
    }
}

// Initialize contact page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'contact') {
        initContact();
    }
});
