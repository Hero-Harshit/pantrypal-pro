// ============ PantryPal Pro — Legal Pages Logic (Privacy & Terms) ============

function initLegal() {
    initScrollAnimations();

    // Simple TOC Highlighting logic if needed
    const tocLinks = $$('.toc-link');
    const sections = $$('section[id]');

    if (tocLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = "";
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 150) {
                    current = section.getAttribute("id");
                }
            });

            tocLinks.forEach(link => {
                link.classList.remove("active");
                if (link.getAttribute("href").includes(current)) {
                    link.classList.add("active");
                }
            });
        });
    }
}

// Initialize legal pages
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'privacy' || document.body.dataset.page === 'terms') {
        initLegal();
    }
});
