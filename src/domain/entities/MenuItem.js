/**
 * Domain Entity - MenuItem
 * Represents a single RIO Chicken menu product and its domain rules.
 */
(function (root) {
  'use strict';

  class MenuItem {
    /**
     * @param {Object} props
     * @param {string} props.id
     * @param {string} props.name
     * @param {string} [props.nameAr]
     * @param {number|null} props.price
     * @param {string} props.category
     * @param {string} [props.quantity]
     * @param {string} [props.quantityAr]
     * @param {string} [props.emoji]
     * @param {string} [props.description]
     * @param {string} [props.descriptionAr]
     * @param {string} [props.popupDescription]
     * @param {string} [props.popupDescriptionAr]
     * @param {Array<{id: string, label: string, labelAr: string, price: number}>} [props.options]
     * @param {string} [props.image]
     */
    constructor({
      id,
      name,
      nameAr = '',
      price,
      category,
      quantity = '',
      quantityAr = '',
      emoji = '🍗',
      description = '',
      descriptionAr = '',
      popupDescription = '',
      popupDescriptionAr = '',
      options = null,
      image = ''
    }) {
      this._id = id;
      this._name = name;
      this._nameAr = nameAr || name;
      this._price = price;
      this._category = category;
      this._quantity = quantity || '';
      this._quantityAr = quantityAr || quantity || '';
      this._emoji = emoji || '🍗';
      this._description = description || '';
      this._descriptionAr = descriptionAr || description || '';
      this._popupDescription = popupDescription || description || '';
      this._popupDescriptionAr = popupDescriptionAr || descriptionAr || description || '';
      this._options = Array.isArray(options) && options.length > 0 ? options : null;
      this._image = image || '';
    }

    get id() {
      return this._id;
    }

    get name() {
      return this._name;
    }

    get nameAr() {
      return this._nameAr;
    }

    get price() {
      return this._price;
    }

    get category() {
      return this._category;
    }

    get quantity() {
      return this._quantity;
    }

    get quantityAr() {
      return this._quantityAr;
    }

    get emoji() {
      return this._emoji;
    }

    get description() {
      return this._description;
    }

    get descriptionAr() {
      return this._descriptionAr;
    }

    get options() {
      return this._options;
    }

    get hasOptions() {
      return Boolean(this._options && this._options.length > 0);
    }

    get image() {
      return this._image;
    }

    /**
     * Checks if the item has a fixed numeric price.
     * @returns {boolean}
     */
    get hasNumericPrice() {
      return typeof this._price === 'number' && !Number.isNaN(this._price);
    }

    /**
     * Returns the default numeric price for ordering (uses first option if price is null).
     * @returns {number}
     */
    getDefaultPrice() {
      if (this.hasNumericPrice) {
        return this._price;
      }
      if (this.hasOptions) {
        return Number(this._options[0].price) || 0;
      }
      return 0;
    }

    /**
     * Returns the display subtitle (description or fallback to category).
     * @returns {string}
     */
    get subtitle() {
      return this._description || this._category;
    }

    /**
     * Returns localized product name.
     * @param {string} [lang='en']
     * @returns {string}
     */
    getName(lang = 'en') {
      return lang === 'ar' ? (this._nameAr || this._name) : this._name;
    }

    /**
     * Returns localized quantity badge text.
     * @param {string} [lang='en']
     * @returns {string}
     */
    getQuantity(lang = 'en') {
      return lang === 'ar' ? (this._quantityAr || this._quantity) : this._quantity;
    }

    /**
     * Returns localized card subtitle (description or localized category fallback).
     * @param {string} [lang='en']
     * @param {string} [categoryLabel='']
     * @returns {string}
     */
    getSubtitle(lang = 'en', categoryLabel = '') {
      const desc = lang === 'ar' ? this._descriptionAr : this._description;
      if (desc) {
        return desc;
      }
      return categoryLabel || this._category;
    }

    /**
     * Returns rich localized description for the product selection popup.
     * @param {string} [lang='en']
     * @param {string} [categoryLabel='']
     * @returns {string}
     */
    getPopupDescription(lang = 'en', categoryLabel = '') {
      const popupDesc = lang === 'ar' ? this._popupDescriptionAr : this._popupDescription;
      if (popupDesc) {
        return popupDesc;
      }
      return this.getSubtitle(lang, categoryLabel);
    }

    /**
     * Checks if the item belongs to the target category.
     * @param {string} targetCategory
     * @returns {boolean}
     */
    belongsToCategory(targetCategory) {
      if (!targetCategory || targetCategory === 'All') {
        return true;
      }
      return this._category === targetCategory;
    }

    /**
     * Checks if the item matches a search query string (supports both English and Arabic).
     * @param {string} query
     * @returns {boolean}
     */
    matchesQuery(query) {
      if (!query || !query.trim()) {
        return true;
      }
      const normalized = query.trim().toLowerCase();
      const searchableText = [
        this._name,
        this._nameAr,
        this._category,
        this._description,
        this._descriptionAr,
        this._quantity,
        this._quantityAr
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalized);
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.MenuItem = MenuItem;
})(typeof window !== 'undefined' ? window : globalThis);
