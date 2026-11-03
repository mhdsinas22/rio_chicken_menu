/**
 * Domain Service - CartService
 * Manages shopping cart state, SAR subtotal/total calculation, and localStorage persistence.
 */
(function (root) {
  'use strict';

  const CART_STORAGE_KEY = 'rio_chicken_cart_v1';

  class CartService {
    /**
     * @param {InstanceType<typeof root.RioMenu.Data.MenuRepository>} menuRepository
     */
    constructor(menuRepository) {
      this._menuRepository = menuRepository;
      this._listeners = [];
      this._items = this._loadFromStorage();
    }

    _loadFromStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(CART_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              return parsed.filter(
                (entry) =>
                  entry &&
                  typeof entry.cartKey === 'string' &&
                  typeof entry.itemId === 'string' &&
                  typeof entry.quantity === 'number' &&
                  entry.quantity > 0 &&
                  typeof entry.unitPrice === 'number' &&
                  entry.unitPrice >= 0
              );
            }
          }
        }
      } catch (_) {
        // Fallback to empty cart if storage is unavailable or corrupted
      }
      return [];
    }

    _saveToStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this._items));
        }
      } catch (_) {
        // Ignore storage write errors
      }
    }

    _notify() {
      this._saveToStorage();
      const snapshot = this.getItems();
      this._listeners.forEach((fn) => fn(snapshot));
    }

    /**
     * Builds a unique cart key for a product + optional size/price option.
     * @param {string} itemId
     * @param {string|null} [optionId=null]
     * @returns {string}
     */
    static buildCartKey(itemId, optionId = null) {
      return optionId ? `${itemId}__${optionId}` : itemId;
    }

    /**
     * Adds a MenuItem to the cart or increments its quantity if already present.
     * @param {InstanceType<typeof root.RioMenu.Domain.MenuItem>} menuItem
     * @param {number} [quantity=1]
     * @param {{id: string, label: string, labelAr?: string, price: number}|null} [selectedOption=null]
     */
    addItem(menuItem, quantity = 1, selectedOption = null) {
      if (!menuItem) {
        return;
      }
      const cleanQty = Math.max(1, Math.floor(Number(quantity) || 1));
      const option =
        selectedOption ||
        (menuItem.hasOptions ? menuItem.options[0] : null);

      const optionId = option ? option.id : null;
      const unitPrice = option
        ? Number(option.price) || 0
        : menuItem.getDefaultPrice();
      const cartKey = CartService.buildCartKey(menuItem.id, optionId);

      const existing = this._items.find((entry) => entry.cartKey === cartKey);
      if (existing) {
        existing.quantity += cleanQty;
        existing.unitPrice = unitPrice;
      } else {
        this._items.push({
          cartKey,
          itemId: menuItem.id,
          optionId,
          optionLabel: option ? option.label : '',
          optionLabelAr: option ? (option.labelAr || option.label) : '',
          unitPrice,
          quantity: cleanQty
        });
      }

      this._notify();
    }

    /**
     * Sets the exact quantity for a cart item, removing it if quantity <= 0.
     * @param {string} cartKey
     * @param {number} newQuantity
     */
    updateQuantity(cartKey, newQuantity) {
      const idx = this._items.findIndex((entry) => entry.cartKey === cartKey);
      if (idx === -1) {
        return;
      }
      const cleanQty = Math.floor(Number(newQuantity) || 0);
      if (cleanQty <= 0) {
        this._items.splice(idx, 1);
      } else {
        this._items[idx].quantity = cleanQty;
      }
      this._notify();
    }

    /**
     * Changes a cart item's quantity by a delta (+1 or -1).
     * @param {string} cartKey
     * @param {number} delta
     */
    changeQuantity(cartKey, delta) {
      const entry = this._items.find((item) => item.cartKey === cartKey);
      if (!entry) {
        return;
      }
      this.updateQuantity(cartKey, entry.quantity + delta);
    }

    /**
     * Removes an item from the cart by its cartKey.
     * @param {string} cartKey
     */
    removeItem(cartKey) {
      const initialLen = this._items.length;
      this._items = this._items.filter((entry) => entry.cartKey !== cartKey);
      if (this._items.length !== initialLen) {
        this._notify();
      }
    }

    /**
     * Clears all items from the cart.
     */
    clearCart() {
      this._items = [];
      this._notify();
    }

    /**
     * Returns enriched cart items with their associated MenuItem entity and line subtotal.
     * @returns {Array<{
     *   cartKey: string,
     *   itemId: string,
     *   menuItem: InstanceType<typeof root.RioMenu.Domain.MenuItem>,
     *   optionId: string|null,
     *   optionLabel: string,
     *   optionLabelAr: string,
     *   unitPrice: number,
     *   quantity: number,
     *   subtotal: number
     * }>}
     */
    getItems() {
      const result = [];
      this._items.forEach((entry) => {
        const menuItem = this._menuRepository
          ? this._menuRepository.getItemById(entry.itemId)
          : null;
        if (menuItem) {
          result.push({
            ...entry,
            menuItem,
            subtotal: entry.unitPrice * entry.quantity
          });
        }
      });
      return result;
    }

    /**
     * Returns total quantity in cart for a given product ID (across all size options).
     * @param {string} itemId
     * @returns {number}
     */
    getProductQuantity(itemId) {
      return this._items
        .filter((entry) => entry.itemId === itemId)
        .reduce((sum, entry) => sum + entry.quantity, 0);
    }

    /**
     * Returns total number of items selected in the cart.
     * @returns {number}
     */
    getTotalCount() {
      return this._items.reduce((sum, entry) => sum + entry.quantity, 0);
    }

    /**
     * Returns cart subtotal in SAR.
     * @returns {number}
     */
    getSubtotal() {
      return this.getItems().reduce((sum, entry) => sum + entry.subtotal, 0);
    }

    /**
     * Returns cart final total in SAR.
     * @returns {number}
     */
    getTotal() {
      return this.getSubtotal();
    }

    /**
     * Subscribes to cart state changes.
     * @param {Function} listener
     */
    subscribe(listener) {
      if (typeof listener === 'function') {
        this._listeners.push(listener);
      }
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.CartService = CartService;
})(typeof window !== 'undefined' ? window : globalThis);

