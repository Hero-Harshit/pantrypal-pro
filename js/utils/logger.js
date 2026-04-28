// ============================================================
// PantryPal Pro — Logger Utility
// /js/utils/logger.js
// ============================================================

const Logger = (() => {
  const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  const CURRENT_LEVEL = LEVELS.DEBUG; // Change to LEVELS.WARN in production

  const _prefix = (level) => `[PantryPal:${level}] ${new Date().toISOString()}`;

  return {
    debug: (...args) => {
      if (CURRENT_LEVEL <= LEVELS.DEBUG) console.debug(_prefix('DEBUG'), ...args);
    },
    info: (...args) => {
      if (CURRENT_LEVEL <= LEVELS.INFO) console.info(_prefix('INFO'), ...args);
    },
    warn: (...args) => {
      if (CURRENT_LEVEL <= LEVELS.WARN) console.warn(_prefix('WARN'), ...args);
    },
    error: (...args) => {
      if (CURRENT_LEVEL <= LEVELS.ERROR) console.error(_prefix('ERROR'), ...args);
    },
    group: (label) => console.group(`[PantryPal] ${label}`),
    groupEnd: () => console.groupEnd()
  };
})();
