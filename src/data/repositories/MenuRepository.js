/**
 * Data Layer - MenuRepository
 * Maps raw datasource records into Domain MenuItem entities.
 */
(function (root) {
  'use strict';

  class MenuRepository {
    /**
     * @param {Array<Object>} rawItems
     * @param {Array<Object>} categories
     * @param {typeof root.RioMenu.Domain.MenuItem} MenuItemEntity
     */
    constructor(rawItems, categories, MenuItemEntity) {
      this._rawItems = rawItems || [];
      this._categories = categories || [];
      this._MenuItemEntity = MenuItemEntity;
      this._entities = this._rawItems.map((item) => new this._MenuItemEntity(item));
    }

    /**
     * Returns all menu items as Domain MenuItem entities.
     * @returns {Array<InstanceType<typeof root.RioMenu.Domain.MenuItem>>}
     */
    getAllItems() {
      return [...this._entities];
    }

    /**
     * Finds a single MenuItem entity by its id.
     * @param {string} id
     * @returns {InstanceType<typeof root.RioMenu.Domain.MenuItem>|null}
     */
    getItemById(id) {
      return this._entities.find((item) => item.id === id) || null;
    }

    /**
     * Returns available menu categories.
     * @returns {Array<{id: string, label: string, labelAr?: string, icon: string}>}
     */
    getCategories() {
      return [...this._categories];
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Data = root.RioMenu.Data || {};
  root.RioMenu.Data.MenuRepository = MenuRepository;
})(typeof window !== 'undefined' ? window : globalThis);
