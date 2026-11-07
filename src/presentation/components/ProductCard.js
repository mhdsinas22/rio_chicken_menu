/**
 * Presentation Component - ProductCard
 * Renders a single selectable MenuItem entity into HTML markup with bilingual,
 * shimmer image loading, and cart badge support.
 */
(function (root) {
  'use strict';

  class ProductCard {
    /**
     * Escapes unsafe HTML characters.
     * @param {string} value
     * @returns {string}
     */
    static escapeHtml(value) {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    /**
     * Renders a MenuItem entity as an HTML card string.
     * @param {InstanceType<typeof root.RioMenu.Domain.MenuItem>} item
     * @param {typeof root.RioMenu.Domain.CurrencyFormatter} CurrencyFormatter
     * @param {Object} [options]
     * @param {string} [options.lang='ar']
     * @param {string} [options.categoryLabel='']
     * @param {number} [options.cartQty=0]
     * @param {string} [options.addLabel='+ أضف']
     * @param {number} [options.index]
     * @returns {string}
     */
    static render(item, CurrencyFormatter, options = {}) {
      const lang = options.lang || 'ar';
      const categoryLabel = options.categoryLabel || item.category;
      const cartQty = Number(options.cartQty) || 0;
      const addLabel = options.addLabel || (lang === 'ar' ? '+ أضف' : '+ Add');
      const isEager = typeof options.index === 'number' && options.index < 4;

      const displayName = item.getName(lang);
      const displaySub = item.getSubtitle(lang, categoryLabel);
      const displayQty = item.getQuantity(lang);

      const safeId = ProductCard.escapeHtml(item.id);
      const safeName = ProductCard.escapeHtml(displayName);
      const safeSubtitle = ProductCard.escapeHtml(displaySub);
      const safeQuantity = ProductCard.escapeHtml(displayQty);
      const safeAddLabel = ProductCard.escapeHtml(addLabel);

      const loadingAttr = isEager ? 'eager' : 'lazy';
      const fetchPriorityAttr = isEager ? 'fetchpriority="high"' : '';

      const mediaHtml = item.image
        ? `<img src="${ProductCard.escapeHtml(item.image)}" alt="${safeName}" width="240" height="240" loading="${loadingAttr}" ${fetchPriorityAttr} decoding="async" onload="this.parentElement.classList.add('loaded')" onerror="if(!this.dataset.fallbackTried&&this.src.endsWith('.webp')){this.dataset.fallbackTried='1';this.src=this.src.replace(/\\.webp$/i,'.png');}else{this.parentElement.classList.add('loaded');this.style.display='none';this.parentElement.insertAdjacentHTML('afterbegin','<div class=\\'food-placeholder\\'>${item.emoji}</div>');}">`
        : `<div class="food-placeholder">${item.emoji}</div>`;

      const photoLoadedClass = item.image ? '' : 'loaded';

      const cartBadgeHtml =
        cartQty > 0
          ? `<span class="product-cart-badge" aria-label="${cartQty} in cart">${cartQty}</span>`
          : '';

      const priceHtml = CurrencyFormatter.formatHtml(item);
      const unitHtml = safeQuantity ? `<span class="unit">${safeQuantity}</span>` : '';

      return `
        <article class="product ${cartQty > 0 ? 'in-cart' : ''}" data-item-id="${safeId}" role="button" tabindex="0" aria-label="${safeName}">
          <div class="product-photo ${photoLoadedClass}">
            ${mediaHtml}
            ${cartBadgeHtml}
          </div>
          <div class="product-info">
            <div class="product-name">${safeName}</div>
            <div class="product-sub">${safeSubtitle}</div>
            <div class="price-row">
              <div class="price">${priceHtml}</div>
              <div class="price-row-actions">
                ${unitHtml}
                <span class="add-chip">${safeAddLabel}</span>
              </div>
            </div>
          </div>
        </article>
      `;
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.ProductCard = ProductCard;
})(typeof window !== 'undefined' ? window : globalThis);
