// ============================================================
// PantryPal Pro — Validators Utility
// /js/utils/validators.js
// ============================================================

const Validators = {
  /**
   * Validate an email address format.
   * @param {string} email
   * @returns {{ valid: boolean, error: string|null }}
   */
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) return { valid: false, error: 'Email is required.' };
    if (!re.test(email.trim())) return { valid: false, error: 'Please enter a valid email address.' };
    return { valid: true, error: null };
  },

  /**
   * Validate password strength.
   * @param {string} password
   * @returns {{ valid: boolean, error: string|null }}
   */
  password(password) {
    if (!password) return { valid: false, error: 'Password is required.' };
    if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters.' };
    return { valid: true, error: null };
  },

  /**
   * Validate that two passwords match.
   * @param {string} p1
   * @param {string} p2
   * @returns {{ valid: boolean, error: string|null }}
   */
  passwordMatch(p1, p2) {
    if (p1 !== p2) return { valid: false, error: 'Passwords do not match.' };
    return { valid: true, error: null };
  },

  /**
   * Validate a required text field.
   * @param {string} value
   * @param {string} [fieldName]
   * @returns {{ valid: boolean, error: string|null }}
   */
  required(value, fieldName = 'This field') {
    if (!value || !String(value).trim()) return { valid: false, error: `${fieldName} is required.` };
    return { valid: true, error: null };
  },

  /**
   * Validate min/max length.
   * @param {string} value
   * @param {number} min
   * @param {number} max
   * @param {string} [fieldName]
   * @returns {{ valid: boolean, error: string|null }}
   */
  length(value, min, max, fieldName = 'This field') {
    const len = (value || '').trim().length;
    if (len < min) return { valid: false, error: `${fieldName} must be at least ${min} characters.` };
    if (max && len > max) return { valid: false, error: `${fieldName} must be at most ${max} characters.` };
    return { valid: true, error: null };
  },

  /**
   * Run multiple validators and return first failure.
   * @param {Array<{ valid: boolean, error: string|null }>} results
   * @returns {{ valid: boolean, error: string|null }}
   */
  all(...results) {
    for (const r of results) {
      if (!r.valid) return r;
    }
    return { valid: true, error: null };
  }
};
