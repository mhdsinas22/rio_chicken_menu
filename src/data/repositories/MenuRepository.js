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
    }

    /**
     * Returns all menu items as Domain MenuItem entities.
     * @returns {Array<InstanceType<typeof root.RioMenu.Domain.MenuItem>>}
     */
    getAllItems() {
      return this._rawItems.map((item) => new this._MenuItemEntity(item));
    }

    /**
     * Returns available menu categories.
     * @returns {Array<{id: string, label: string, icon: string}>}
     */
    getCategories() {
      return [...this._categories];
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Data = root.RioMenu.Data || {};
  root.RioMenu.Data.MenuRepository = MenuRepository;
})(typeof window !== 'undefined' ? window : globalThis);

