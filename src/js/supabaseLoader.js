// ============================================================
// PantryPal Pro — Supabase Script Loader Helper
// /js/supabaseLoader.js
//
// Injects the Supabase CDN script and returns a promise that
// resolves when the library is ready. Include this as the
// FIRST script in HTML pages that need Supabase.
// ============================================================

(function () {
  if (window.__supabaseLoading) return;
  window.__supabaseLoading = true;

  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  // If already loaded, skip
  if (window.supabase) {
    window.__supabaseReady = Promise.resolve();
    return;
  }

  window.__supabaseReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SUPABASE_CDN;
    script.onload = () => {
      console.info('[PantryPal] Supabase JS SDK loaded.');
      resolve();
    };
    script.onerror = () => {
      console.warn('[PantryPal] Failed to load Supabase SDK. Running in offline mode.');
      resolve(); // resolve anyway so app continues
    };
    document.head.appendChild(script);
  });
})();
