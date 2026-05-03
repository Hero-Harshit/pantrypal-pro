// ============ PantryPal Pro — Auth Page Logic ============

function initAuth() {
    initScrollAnimations();
    if (isLoggedIn()) { window.location.href = 'dashboard.html'; return; }

    const loginTab = $('#loginTab');
    const signupTab = $('#signupTab');
    const loginForm = $('#loginForm');
    const signupForm = $('#signupForm');

    if (loginTab && signupTab && loginForm && signupForm) {
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
    }

    // ── Login ──
    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const email = $('#loginEmail').value.trim();
            const pass = $('#loginPass').value;

            if (typeof Validators !== 'undefined') {
                const emailV = Validators.email(email);
                if (!emailV.valid) return showToast(emailV.error, 'error');
            }
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
    }

    // ── Sign Up ──
    if (signupForm) {
        signupForm.addEventListener('submit', async e => {
            e.preventDefault();
            const name = $('#signupName').value.trim();
            const phone = $('#signupPhone').value.trim();
            const email = $('#signupEmail').value.trim();
            const age = $('#signupAge').value;
            const country = $('#signupCountry').value;
            const pass = $('#signupPass').value;
            const confirm = $('#signupConfirm').value;

            if (typeof Validators !== 'undefined') {
                const v = Validators.all(
                    Validators.required(name, 'Full Name'),
                    Validators.email(email),
                    Validators.password(pass),
                    Validators.passwordMatch(pass, confirm)
                );
                if (!v.valid) return showToast(v.error, 'error');
            }

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
    }

    const loginToSignupBtn = $('#loginToSignupBtn');
    if (loginToSignupBtn) {
        loginToSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            signupTab.click();
            window.history.pushState(null, null, '#signup');
        });
    }

    if (window.location.hash === '#signup') {
        if (signupTab) signupTab.click();
    } else if (window.location.hash === '#login') {
        if (loginTab) loginTab.click();
    }
}

// Initialize auth page
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'auth') {
        initAuth();
    }
});
