/**
 * Application Layer - FilterMenuItemsUseCase
 * Orchestrates filtering of menu items by category and search query.
 */
(function (root) {
  'use strict';

  class FilterMenuItemsUseCase {
    /**
     * @param {InstanceType<typeof root.RioMenu.Data.MenuRepository>} menuRepository
     */
    constructor(menuRepository) {
      this._menuRepository = menuRepository;
    }

    /**
     * Executes the filter use case.
     * @param {Object} criteria
     * @param {string} [criteria.category='All']
     * @param {string} [criteria.query='']
     * @returns {Array<InstanceType<typeof root.RioMenu.Domain.MenuItem>>}
     */
    execute({ category = 'All', query = '' } = {}) {
      const items = this._menuRepository.getAllItems();
      return items.filter(
        (item) => item.belongsToCategory(category) && item.matchesQuery(query)
      );
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Application = root.RioMenu.Application || {};
  root.RioMenu.Application.FilterMenuItemsUseCase = FilterMenuItemsUseCase;
})(typeof window !== 'undefined' ? window : globalThis);

