// ============================================================
// PantryPal Pro — Authentication Service
// /js/services/authService.js
//
// Wraps Supabase Auth with session management and profile sync.
// ============================================================

const AuthService = (() => {
  let _session = null;
  let _listeners = [];

  function _notify(event, session) {
    _session = session;
    _listeners.forEach(fn => fn(event, session));
  }

  function _setupListener() {
    const sb = SupabaseClient.get();
    if (!sb) return;

    sb.auth.onAuthStateChange((event, session) => {
      Logger.info(`[Auth] State changed: ${event}`);
      _notify(event, session);

      if (session?.user) {
        const meta = session.user.user_metadata || {};
        const localUser = {
          id: session.user.id,
          email: session.user.email,
          name: meta.full_name || meta.name || session.user.email.split('@')[0],
          plan: meta.plan || 'free',
          phone: meta.phone || '',
          supabase: true
        };
        localStorage.setItem('pp_user', JSON.stringify(localUser));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('pp_user');
      }
    });
  }

  return {
    async init() {
      if (window.__supabaseReady) await window.__supabaseReady;
      _setupListener();
      const sb = SupabaseClient.get();
      if (sb) {
        const { data } = await sb.auth.getSession();
        _session = data?.session || null;
      }
    },

    async signUp({ email, password, name, phone = '', country = '', age = '' }) {
      if (window.__supabaseReady) await window.__supabaseReady;
      const sb = SupabaseClient.get();
      if (!sb) return { error: 'Supabase not configured' };

      try {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name, phone, country, age, plan: 'free' }
          }
        });

        if (error) return { user: null, error: error.message };

        // Create profile record in DB
        if (data.user) {
          await sb.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            name,
            phone,
            country,
            age: parseInt(age) || null,
            plan: 'free'
          });
        }

        return { user: data.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },

    async signIn(email, password) {
      if (window.__supabaseReady) await window.__supabaseReady;
      const sb = SupabaseClient.get();
      if (!sb) return { error: 'Supabase not configured' };

      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) return { user: null, error: error.message };

        // Fetch profile to get name and plan
        const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) {
          const merged = { 
            id: data.user.id,
            email: data.user.email,
            name: profile.name,
            plan: profile.plan || 'free',
            supabase: true 
          };
          localStorage.setItem('pp_user', JSON.stringify(merged));
        }

        return { user: data.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },

    async signInWithOAuth(provider) {
      const sb = SupabaseClient.get();
      if (!sb) return { error: 'Supabase not configured' };

      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/html/dashboard.html' }
      });
      return { error: error?.message || null };
    },

    async signOut() {
      const sb = SupabaseClient.get();
      localStorage.removeItem('pp_user');
      if (!sb) {
        window.location.href = 'landing.html';
        return { error: null };
      }
      const { error } = await sb.auth.signOut();
      return { error: error?.message || null };
    },

    getCurrentUser() {
      return JSON.parse(localStorage.getItem('pp_user') || 'null');
    },

    isLoggedIn() {
      return !!this.getCurrentUser();
    },

    onAuthChange(fn) {
      _listeners.push(fn);
    }
  };
})();

