/**
 * Presentation Layer - MenuController
 * Coordinates category filter pills, search input, menu grid rendering,
 * keyboard tab navigation, in-place cart badge updates, and product selection.
 */
(function (root) {
  'use strict';

  class MenuController {
    /**
     * @param {Object} deps
     * @param {InstanceType<typeof root.RioMenu.Data.MenuRepository>} deps.menuRepository
     * @param {InstanceType<typeof root.RioMenu.Application.FilterMenuItemsUseCase>} deps.filterUseCase
     * @param {typeof root.RioMenu.Presentation.ProductCard} deps.ProductCard
     * @param {typeof root.RioMenu.Domain.CurrencyFormatter} deps.CurrencyFormatter
     * @param {InstanceType<typeof root.RioMenu.Domain.I18nService>} [deps.i18nService]
     * @param {InstanceType<typeof root.RioMenu.Domain.CartService>} [deps.cartService]
     * @param {function(InstanceType<typeof root.RioMenu.Domain.MenuItem>, HTMLElement=): void} [deps.onSelectProduct]
     * @param {Object} deps.elements
     * @param {HTMLElement} deps.elements.filtersEl
     * @param {HTMLElement} deps.elements.gridEl
     * @param {HTMLElement} deps.elements.emptyEl
     * @param {HTMLInputElement} deps.elements.searchEl
     * @param {HTMLButtonElement} [deps.elements.clearSearchBtn]
     * @param {HTMLElement} deps.elements.sectionTitleEl
     * @param {HTMLElement} deps.elements.itemCountEl
     */
    constructor({
      menuRepository,
      filterUseCase,
      ProductCard,
      CurrencyFormatter,
      i18nService = null,
      cartService = null,
      onSelectProduct = null,
      elements
    }) {
      this._menuRepository = menuRepository;
      this._filterUseCase = filterUseCase;
      this._ProductCard = ProductCard;
      this._CurrencyFormatter = CurrencyFormatter;
      this._i18n = i18nService;
      this._cartService = cartService;
      this._onSelectProduct = onSelectProduct;
      this._elements = elements;

      this._activeCategory = 'All';
      this._searchQuery = '';
    }

    /**
     * Initializes UI listeners and performs the initial render.
     */
    init() {
      this._bindEvents();
      this.renderFilters();
      this.renderItems();

      if (this._i18n) {
        this._i18n.subscribe(() => {
          this.renderFilters();
          this.renderItems();
        });
      }

      if (this._cartService) {
        this._cartService.subscribe(() => {
          this.updateCartBadges();
        });
      }
    }

    _bindEvents() {
      const { searchEl, clearSearchBtn, filtersEl, gridEl } = this._elements;

      if (searchEl) {
        searchEl.addEventListener('input', (e) => {
          this._searchQuery = e.target.value || '';
          this._syncSearchClearButton();
          this.renderItems();
        });

        searchEl.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this._searchQuery) {
            e.preventDefault();
            this._clearSearch();
          } else if (e.key === 'Enter') {
            e.preventDefault();
            searchEl.blur();
          }
        });
      }

      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          this._clearSearch();
          if (searchEl) {
            searchEl.focus();
          }
        });
      }

      if (filtersEl) {
        filtersEl.addEventListener('click', (e) => {
          const btn = e.target.closest('button[data-cat]');
          if (!btn) {
            return;
          }
          this._selectCategory(btn.getAttribute('data-cat') || 'All');
        });

        filtersEl.addEventListener('keydown', (e) => {
          const buttons = Array.from(filtersEl.querySelectorAll('button[data-cat]'));
          if (buttons.length === 0) {
            return;
          }
          const currentIdx = buttons.indexOf(document.activeElement);
          if (currentIdx === -1) {
            return;
          }

          const isRtl = this._i18n ? this._i18n.isRtl : false;
          const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
          const prevKey = isRtl ? 'ArrowRight' : 'ArrowLeft';

          let targetIdx = -1;
          if (e.key === nextKey) {
            targetIdx = (currentIdx + 1) % buttons.length;
          } else if (e.key === prevKey) {
            targetIdx = (currentIdx - 1 + buttons.length) % buttons.length;
          } else if (e.key === 'Home') {
            targetIdx = 0;
          } else if (e.key === 'End') {
            targetIdx = buttons.length - 1;
          }

          if (targetIdx !== -1) {
            e.preventDefault();
            const targetBtn = buttons[targetIdx];
            targetBtn.focus();
            this._selectCategory(targetBtn.getAttribute('data-cat') || 'All');
          }
        });
      }

      if (gridEl) {
        gridEl.addEventListener('click', (e) => {
          const card = e.target.closest('.product[data-item-id]');
          if (!card) {
            return;
          }
          const itemId = card.getAttribute('data-item-id');
          this._handleProductSelect(itemId, card);
        });

        gridEl.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') {
            return;
          }
          const card = e.target.closest('.product[data-item-id]');
          if (!card) {
            return;
          }
          e.preventDefault();
          const itemId = card.getAttribute('data-item-id');
          this._handleProductSelect(itemId, card);
        });
      }
    }

    _clearSearch() {
      const { searchEl } = this._elements;
      this._searchQuery = '';
      if (searchEl) {
        searchEl.value = '';
      }
      this._syncSearchClearButton();
      this.renderItems();
    }

    _syncSearchClearButton() {
      const { clearSearchBtn } = this._elements;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('visible', Boolean(this._searchQuery.trim()));
      }
    }

    _selectCategory(catId) {
      if (this._activeCategory === catId) {
        return;
      }
      this._activeCategory = catId;
      this.renderFilters();
      this.renderItems();
    }

    _handleProductSelect(itemId, triggerEl) {
      if (!itemId || typeof this._onSelectProduct !== 'function') {
        return;
      }
      const item = this._menuRepository.getItemById(itemId);
      if (item) {
        this._onSelectProduct(item, triggerEl);
      }
    }

    /**
     * Renders the category filter buttons in the active language with ARIA tab roles.
     */
    renderFilters() {
      const { filtersEl } = this._elements;
      if (!filtersEl) {
        return;
      }

      const lang = this._i18n ? this._i18n.lang : 'ar';
      const categories = this._menuRepository.getCategories();
      filtersEl.innerHTML = categories
        .map((cat) => {
          const isActive = cat.id === this._activeCategory;
          const label = lang === 'ar' ? (cat.labelAr || cat.label) : cat.label;
          return `<button class="filter ${isActive ? 'active' : ''}" role="tab" aria-selected="${isActive ? 'true' : 'false'}" data-cat="${cat.id}" type="button">${cat.icon} ${label}</button>`;
        })
        .join('');
    }

    /**
     * Updates in-cart badges on existing product cards in place without reloading images.
     */
    updateCartBadges() {
      const { gridEl } = this._elements;
      if (!gridEl || !this._cartService) {
        return;
      }

      const cards = gridEl.querySelectorAll('.product[data-item-id]');
      cards.forEach((card) => {
        const itemId = card.getAttribute('data-item-id');
        const qty = this._cartService.getProductQuantity(itemId);
        card.classList.toggle('in-cart', qty > 0);

        const photoEl = card.querySelector('.product-photo');
        if (!photoEl) {
          return;
        }
        let badgeEl = photoEl.querySelector('.product-cart-badge');
        if (qty > 0) {
          if (!badgeEl) {
            badgeEl = document.createElement('span');
            badgeEl.className = 'product-cart-badge';
            photoEl.appendChild(badgeEl);
          }
          badgeEl.textContent = String(qty);
          badgeEl.setAttribute('aria-label', `${qty} in cart`);
        } else if (badgeEl) {
          badgeEl.remove();
        }
      });
    }

    /**
     * Filters and renders the menu product cards.
     */
    renderItems() {
      const { gridEl, emptyEl, sectionTitleEl, itemCountEl } = this._elements;
      if (!gridEl) {
        return;
      }

      const lang = this._i18n ? this._i18n.lang : 'ar';
      const itemsSuffix = this._i18n ? this._i18n.t('itemsCountSuffix', 'items') : 'items';
      const addLabel = this._i18n ? this._i18n.t('addBtn', '+ Add') : '+ Add';

      const filteredItems = this._filterUseCase.execute({
        category: this._activeCategory,
        query: this._searchQuery
      });

      if (sectionTitleEl) {
        const activeLabel = this._i18n
          ? this._i18n.getCategoryLabel(this._activeCategory)
          : (this._activeCategory === 'All' ? 'All Menu Items' : this._activeCategory);
        sectionTitleEl.textContent = activeLabel.toUpperCase();
      }

      if (itemCountEl) {
        itemCountEl.textContent = `${filteredItems.length} ${itemsSuffix}`;
      }

      gridEl.innerHTML = filteredItems
        .map((item) => {
          const categoryLabel = this._i18n
            ? this._i18n.getCategoryLabel(item.category)
            : item.category;
          const cartQty = this._cartService
            ? this._cartService.getProductQuantity(item.id)
            : 0;
          return this._ProductCard.render(item, this._CurrencyFormatter, {
            lang,
            categoryLabel,
            cartQty,
            addLabel
          });
        })
        .join('');

      if (emptyEl) {
        emptyEl.style.display = filteredItems.length === 0 ? 'block' : 'none';
      }
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.MenuController = MenuController;
})(typeof window !== 'undefined' ? window : globalThis);
