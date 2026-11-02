/**
 * Domain Layer - MenuItem Entity
 * Encapsulates core business properties and domain rules for a menu item.
 */
(function (root) {
  'use strict';

  class MenuItem {
    /**
     * @param {Object} props
     * @param {string} props.id
     * @param {string} props.name
     * @param {number|null} props.price
     * @param {string} props.category
     * @param {string} [props.quantity]
     * @param {string} [props.emoji]
     * @param {string} [props.description]
     * @param {string} [props.image]
     */
    constructor({ id, name, price, category, quantity = '', emoji = '🍗', description = '', image = '' }) {
      this.id = id;
      this.name = name;
      this.price = price;
      this.category = category;
      this.quantity = quantity;
      this.emoji = emoji;
      this.description = description;
      this.image = image;
    }

    /**
     * Returns the display subtitle (description if available, otherwise category).
     * @returns {string}
     */
    get subtitle() {
      return this.description || this.category;
    }

    /**
     * Checks if the item belongs to the given category filter.
     * @param {string} targetCategory
     * @returns {boolean}
     */
    belongsToCategory(targetCategory) {
      if (!targetCategory || targetCategory === 'All') {
        return true;
      }
      return this.category === targetCategory;
    }

    /**
     * Checks if the item matches a search query across name, category, and description.
     * @param {string} query
     * @returns {boolean}
     */
    matchesQuery(query) {
      if (!query) {
        return true;
      }
      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        return true;
      }
      const searchableText = `${this.name} ${this.category} ${this.description || ''}`.toLowerCase();
      return searchableText.includes(normalizedQuery);
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.MenuItem = MenuItem;
})(typeof window !== 'undefined' ? window : globalThis);

