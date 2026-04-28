// ============================================================
// PantryPal Pro — Supabase Client (Singleton)
// /js/services/supabaseClient.js
//
// Depends on:
//   - js/supabase.config.js   (SUPABASE_CONFIG)
//   - Supabase JS CDN (loaded in HTML before this file)
// ============================================================

const SupabaseClient = (() => {
  let _client = null;

  function _init() {
    if (!window.supabase) {
      console.warn('[SupabaseClient] Supabase JS library not loaded yet.');
      return null;
    }
    if (!SUPABASE_CONFIG?.url || !SUPABASE_CONFIG?.anonKey || SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY_HERE') {
      console.warn('[SupabaseClient] ⚠️  Supabase credentials not configured. Edit js/supabase.config.js');
      return null;
    }
    try {
      _client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      });
      Logger.info('SupabaseClient initialized successfully.');
      return _client;
    } catch (err) {
      Logger.error('SupabaseClient init failed:', err);
      return null;
    }
  }

  return {
    /**
     * Get the Supabase client instance (lazy singleton).
     * @returns {import('@supabase/supabase-js').SupabaseClient|null}
     */
    get() {
      if (!_client) _init();
      return _client;
    },

    /**
     * Check if the client is ready.
     * @returns {boolean}
     */
    isReady() {
      return !!this.get();
    }
  };
})();
