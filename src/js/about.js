// ============ PantryPal Pro — About Page Logic ============

function initAbout() {
    initScrollAnimations();
    initStatCounters();
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

// Initialize about page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'about') {
        initAbout();
    }
});
