/**
 * Domain Layer - CurrencyFormatter Service
 * Handles price formatting rules in Saudi Riyal (SAR).
 */
(function (root) {
  'use strict';

  class CurrencyFormatter {
    /**
     * @param {string} [currencyCode='SAR']
     */
    constructor(currencyCode = 'SAR') {
      this.currencyCode = currencyCode;
    }

    /**
     * Formats a numeric price or returns a fallback label when price is null.
     * @param {number|null} amount
     * @param {string} [nullFallback='See menu']
     * @returns {string}
     */
    format(amount, nullFallback = 'See menu') {
      if (amount === null || amount === undefined) {
        return nullFallback;
      }
      const formattedNumber = Number.isInteger(amount) ? String(amount) : Number(amount).toFixed(2);
      return `${formattedNumber} ${this.currencyCode}`;
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.CurrencyFormatter = CurrencyFormatter;
})(typeof window !== 'undefined' ? window : globalThis);

