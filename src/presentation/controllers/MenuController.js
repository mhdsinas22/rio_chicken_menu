/**
 * Presentation Layer - MenuController
 * Coordinates user interactions (search, category filter, reset) with the FilterMenuItemsUseCase
 * and manages image shimmer loading states.
 */
(function (root) {
  'use strict';

  class MenuController {
    /**
     * @param {Object} dependencies
     * @param {InstanceType<typeof root.RioMenu.Application.FilterMenuItemsUseCase>} dependencies.filterMenuItemsUseCase
     * @param {InstanceType<typeof root.RioMenu.Presentation.ProductCard>} dependencies.productCard
     * @param {Object} dependencies.elements
     * @param {HTMLElement} dependencies.elements.gridEl
     * @param {HTMLInputElement} dependencies.elements.searchEl
     * @param {HTMLElement} dependencies.elements.countEl
     * @param {HTMLElement} dependencies.elements.emptyEl
     * @param {HTMLElement} dependencies.elements.titleEl
     * @param {NodeListOf<HTMLButtonElement>} dependencies.elements.filterButtons
     * @param {HTMLButtonElement} [dependencies.elements.showAllBtn]
     * @param {HTMLElement} [dependencies.elements.menuSectionEl]
     */
    constructor({ filterMenuItemsUseCase, productCard, elements }) {
      this._filterUseCase = filterMenuItemsUseCase;
      this._productCard = productCard;
      this._elements = elements;
      this._activeCategory = 'All';
    }

    /**
     * Initializes event listeners and performs the initial render.
     */
    init() {
      const { searchEl, filterButtons, showAllBtn, menuSectionEl } = this._elements;

      filterButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          this.setCategory(btn.dataset.category || 'All');
        });
      });

      if (searchEl) {
        searchEl.addEventListener('input', () => {
          this.render();
        });
      }

      if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
          this.resetFilters();
          if (menuSectionEl) {
            menuSectionEl.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }

      this._bindOriginalBannerShimmer();
      this.render();
    }

    /**
     * Updates active category and re-renders.
     * @param {string} category
     */
    setCategory(category) {
      this._activeCategory = category;
      this._elements.filterButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.category === category);
      });
      this.render();
    }

    /**
     * Resets category and search query to show all items.
     */
    resetFilters() {
      if (this._elements.searchEl) {
        this._elements.searchEl.value = '';
      }
      this.setCategory('All');
    }

    /**
     * Executes filtering, updates the DOM, and attaches shimmer image load listeners.
     */
    render() {
      const { gridEl, searchEl, countEl, emptyEl, titleEl } = this._elements;
      const query = searchEl ? searchEl.value : '';

      const filteredItems = this._filterUseCase.execute({
        category: this._activeCategory,
        query,
      });

      gridEl.innerHTML = filteredItems
        .map((item, idx) => this._productCard.render(item, idx))
        .join('');

      this._bindProductImagesShimmer(gridEl);

      countEl.textContent = `${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'}`;
      titleEl.textContent =
        this._activeCategory === 'All' ? 'ALL MENU ITEMS' : this._activeCategory.toUpperCase();

      const hasItems = filteredItems.length > 0;
      emptyEl.style.display = hasItems ? 'none' : 'block';
      gridEl.style.display = hasItems ? 'grid' : 'none';
    }

    /**
     * Attaches load/error listeners to product card images to transition out of the shimmer state.
     * @param {HTMLElement} container
     */
    _bindProductImagesShimmer(container) {
      const images = container.querySelectorAll('.product-photo img');
      images.forEach((img) => {
        const photoWrap = img.closest('.product-photo');
        if (!photoWrap) return;

        const markLoaded = () => {
          photoWrap.classList.remove('is-loading');
          photoWrap.classList.add('is-loaded');
        };

        const markError = () => {
          photoWrap.classList.remove('is-loading');
          photoWrap.classList.add('is-loaded');
          img.style.display = 'none';
          const fallback = photoWrap.querySelector('.food-placeholder');
          if (fallback) {
            fallback.style.display = 'inline';
          }
        };

        if (img.complete && img.naturalWidth > 0) {
          markLoaded();
        } else {
          img.addEventListener('load', markLoaded, { once: true });
          img.addEventListener('error', markError, { once: true });
        }
      });
    }

    /**
     * Binds shimmer loading transition to the Original Menu artwork banner image.
     */
    _bindOriginalBannerShimmer() {
      if (typeof document === 'undefined') return;
      const bannerImg = document.querySelector('.original-img');
      if (!bannerImg) return;

      const wrap = bannerImg.closest('.original-photo-wrap');
      const markBannerLoaded = () => {
        bannerImg.classList.add('is-loaded');
        if (wrap) {
          wrap.classList.remove('is-loading');
          wrap.classList.add('is-loaded');
        }
      };

      if (bannerImg.complete && bannerImg.naturalWidth > 0) {
        markBannerLoaded();
      } else {
        bannerImg.addEventListener('load', markBannerLoaded, { once: true });
        bannerImg.addEventListener('error', markBannerLoaded, { once: true });
      }
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.MenuController = MenuController;
})(typeof window !== 'undefined' ? window : globalThis);
