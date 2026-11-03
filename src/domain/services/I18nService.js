/**
 * Domain Service - I18nService
 * Manages English ('en') and Arabic ('ar') localization and RTL document layout.
 */
(function (root) {
  'use strict';

  const STORAGE_KEY = 'rio_chicken_lang_v2';

  class I18nService {
    /**
     * @param {Object} translations
     * @param {Array<{id: string, label: string, labelAr?: string, icon: string}>} categories
     */
    constructor(translations = {}, categories = []) {
      this._translations = translations;
      this._categories = categories;
      this._listeners = [];
      this._lang = this._loadInitialLanguage();
    }

    _loadInitialLanguage() {
      return 'ar';
    }

    /**
     * Returns current language code ('en' | 'ar').
     * @returns {string}
     */
    get lang() {
      return this._lang;
    }

    /**
     * Returns true if Arabic RTL is active.
     * @returns {boolean}
     */
    get isRtl() {
      return this._lang === 'ar';
    }

    /**
     * Translates a UI key in the active language.
     * @param {string} key
     * @param {string} [fallback='']
     * @returns {string}
     */
    t(key, fallback = '') {
      const dict = this._translations[this._lang] || this._translations.en || {};
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        return dict[key];
      }
      const enDict = this._translations.en || {};
      return Object.prototype.hasOwnProperty.call(enDict, key) ? enDict[key] : fallback || key;
    }

    /**
     * Returns the localized label for a category id.
     * @param {string} categoryId
     * @returns {string}
     */
    getCategoryLabel(categoryId) {
      const found = this._categories.find((c) => c.id === categoryId);
      if (!found) {
        return categoryId;
      }
      return this._lang === 'ar' ? (found.labelAr || found.label) : found.label;
    }

    /**
     * Switches between 'en' and 'ar'.
     * @returns {string} New language code
     */
    toggleLanguage() {
      const next = this._lang === 'en' ? 'ar' : 'en';
      this.setLanguage(next);
      return next;
    }

    /**
     * Sets active language, updates document attributes, and notifies listeners.
     * @param {'en'|'ar'} lang
     */
    setLanguage(lang) {
      const normalized = lang === 'ar' ? 'ar' : 'en';
      this._lang = normalized;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, normalized);
        }
      } catch (_) {
        // Ignore storage errors
      }
      this.applyToDocument();
      this._listeners.forEach((fn) => fn(this._lang));
    }

    /**
     * Updates HTML lang, dir, and all [data-i18n*] elements on the page.
     */
    applyToDocument() {
      if (typeof document === 'undefined') {
        return;
      }
      const htmlEl = document.documentElement;
      htmlEl.setAttribute('lang', this._lang);
      htmlEl.setAttribute('dir', this.isRtl ? 'rtl' : 'ltr');

      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) {
          el.textContent = this.t(key, el.textContent);
        }
      });

      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
          el.setAttribute('placeholder', this.t(key, el.getAttribute('placeholder') || ''));
        }
      });

      document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria');
        if (key) {
          el.setAttribute('aria-label', this.t(key, el.getAttribute('aria-label') || ''));
        }
      });
    }

    /**
     * Subscribes to language changes.
     * @param {function(string): void} listener
     */
    subscribe(listener) {
      if (typeof listener === 'function') {
        this._listeners.push(listener);
      }
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.I18nService = I18nService;
})(typeof window !== 'undefined' ? window : globalThis);

