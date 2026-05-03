// src/js/payment.js — mock simulation code removed 2026-05-03
// Real server integrations are marked with 🔌
// ============ PantryPal Pro — Payment Gateway Logic ============

window.openPaymentModal = function (tier) {
    const modal = $('#paymentModalOverlay');
    const planName = $('#paymentPlanName');
    const planPrice = $('#paymentPlanPrice');
    const planTotal = $('#paymentTotal');

    if (!modal) return;

    if (typeof PLANS !== 'undefined') {
        const p = PLANS[tier];
        if (planName) planName.textContent = p.name;
        if (planPrice) planPrice.textContent = p.price;
        if (planTotal) planTotal.textContent = p.price.split('/')[0];
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset states
    const initialState = $('#paymentInitialState');
    const processingState = $('#paymentProcessingState');
    const successState = $('#paymentSuccessState');

    if (initialState) initialState.style.display = 'block';
    if (processingState) processingState.classList.remove('active');
    if (successState) successState.classList.remove('active');
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
        if (previewNumber) previewNumber.textContent = formattedValue || '•••• •••• •••• ••••';

        // Detect Card Type (Simple)
        if (cardTypeDisplay) {
            if (value.startsWith('4')) cardTypeDisplay.textContent = 'VISA';
            else if (value.startsWith('5')) cardTypeDisplay.textContent = 'MC';
            else cardTypeDisplay.textContent = 'CARD';
        }
    };

    // Name Formatting
    if (nameInput) {
        nameInput.oninput = (e) => {
            if (previewName) previewName.textContent = e.target.value || 'Your Name';
        };
    }

    // Expiry Formatting
    if (expiryInput) {
        expiryInput.oninput = (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
            if (previewExpiry) previewExpiry.textContent = value || 'MM/YY';
        };
    }

    // Form Submit
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            processPayment();
        };
    }
}

function processPayment() {
    // ─────────────────────────────────────────────
    // 🔌 SERVER CALL PLACEHOLDER
    // What this does: Processes the user's subscription payment and upgrades their plan.
    // Future implementation: Plan upgrades will be handled via a payment gateway 
    // webhook (Razorpay) which will update the 'plan' column in the Supabase 
    // 'profiles' table. The client should then re-fetch the user profile 
    // from Supabase to get the confirmed plan — never trust client-side mutation.
    // Phase: MVP+1
    // ─────────────────────────────────────────────
    showToast('Payment processing integration planned for MVP+1', 'info');
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
