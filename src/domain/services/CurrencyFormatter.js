/**
 * Domain Service - CurrencyFormatter
 * Formats item prices according to Saudi Riyal (SAR) domain rules.
 */
(function (root) {
  'use strict';

  const CURRENCY_CODE = 'SAR';

  class CurrencyFormatter {
    /**
     * Returns the currency code.
     * @returns {string}
     */
    static get currencyCode() {
      return CURRENCY_CODE;
    }

    /**
     * Formats a numeric amount in SAR (e.g., "18 SAR").
     * @param {number} amount
     * @returns {string}
     */
    static formatAmount(amount) {
      const num = Number(amount) || 0;
      return `${num} ${CURRENCY_CODE}`;
    }

    /**
     * Formats a MenuItem price into display HTML.
     * @param {InstanceType<typeof root.RioMenu.Domain.MenuItem>} item
     * @returns {string}
     */
    static formatHtml(item) {
      if (item.hasNumericPrice) {
        return `${item.price} <small>${CURRENCY_CODE}</small>`;
      }
      return `${item.quantity || 'Ask'} <small>${CURRENCY_CODE}</small>`;
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.CurrencyFormatter = CurrencyFormatter;
})(typeof window !== 'undefined' ? window : globalThis);
