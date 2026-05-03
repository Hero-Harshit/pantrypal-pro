// ============ PantryPal Pro — Career Page Logic ============

function initCareer() {
    initScrollAnimations();
}

// Initialize career page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'career') {
        initCareer();
    }
});
