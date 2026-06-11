// ============================================================
// PantryPal Pro — LocalStorage Authentication Service
// /js/services/authService.js
//
// Replaces Supabase Auth with client-side localStorage auth.
// Enforces that all users are on the free plan.
// ============================================================

const AuthService = (() => {
  let _session = null;
  let _listeners = [];

  function _notify(event, session) {
    _session = session;
    _listeners.forEach(fn => fn(event, session));
  }

  function _getRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem('pp_registered_users') || '[]');
    } catch (e) {
      return [];
    }
  }

  function _saveRegisteredUsers(users) {
    localStorage.setItem('pp_registered_users', JSON.stringify(users));
  }

  return {
    async init() {
      // Offline local auth requires no remote network initialization
      Logger.info('[Auth] Local Auth Service initialized.');
      const user = this.getCurrentUser();
      if (user) {
        _session = { user };
        _notify('SIGNED_IN', _session);
      }
    },

    async signUp({ email, password, name, phone = '', country = '', age = '' }) {
      try {
        Logger.info('[Auth] Attempting local signup for:', email);
        const users = _getRegisteredUsers();
        const normalizedEmail = email.trim().toLowerCase();

        const exists = users.find(u => u.email === normalizedEmail);
        if (exists) {
          return { user: null, error: 'An account with this email already exists.' };
        }

        const newUser = {
          id: 'usr_' + Math.random().toString(36).substr(2, 9),
          email: normalizedEmail,
          password: password, // client-side localstorage storage
          name: name.trim(),
          phone: phone.trim(),
          country: country,
          age: parseInt(age) || null,
          plan: 'free'
        };

        users.push(newUser);
        _saveRegisteredUsers(users);

        // Auto log in after sign up
        const sessionUser = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          country: newUser.country,
          age: newUser.age,
          plan: 'free'
        };

        localStorage.setItem('pp_user', JSON.stringify(sessionUser));
        _session = { user: sessionUser };
        _notify('SIGNED_IN', _session);

        return { user: sessionUser, error: null };
      } catch (err) {
        Logger.error('[Auth] signUp exception:', err);
        return { user: null, error: err.message };
      }
    },

    async signIn(email, password) {
      try {
        const users = _getRegisteredUsers();
        const normalizedEmail = email.trim().toLowerCase();

        const user = users.find(u => u.email === normalizedEmail && u.password === password);
        if (!user) {
          return { user: null, error: 'Invalid email or password.' };
        }

        const sessionUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          country: user.country,
          age: user.age,
          plan: 'free'
        };

        localStorage.setItem('pp_user', JSON.stringify(sessionUser));
        _session = { user: sessionUser };
        _notify('SIGNED_IN', _session);

        return { user: sessionUser, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },

    async signInWithOAuth(provider) {
      return { error: 'Social login is not supported in this offline version.' };
    },

    async signOut() {
      localStorage.removeItem('pp_user');
      _session = null;
      _notify('SIGNED_OUT', null);
      window.location.href = 'landing.html';
      return { error: null };
    },

    getCurrentUser() {
      try {
        const user = JSON.parse(localStorage.getItem('pp_user') || 'null');
        if (user) {
          user.plan = 'free'; // Hard guarantee: user cannot bypass via devtools/localStorage edits
        }
        return user;
      } catch (e) {
        return null;
      }
    },

    isLoggedIn() {
      return !!this.getCurrentUser();
    },

    onAuthChange(fn) {
      _listeners.push(fn);
    }
  };
})();
