/**
 * Presentation Layer - ProductCard Component
 * Renders a single MenuItem entity into an HTML card string.
 */
(function (root) {
  'use strict';

  class ProductCard {
    /**
     * @param {InstanceType<typeof root.RioMenu.Domain.CurrencyFormatter>} currencyFormatter
     */
    constructor(currencyFormatter) {
      this._currencyFormatter = currencyFormatter;
    }

    /**
     * Renders a MenuItem entity into HTML markup.
     * @param {InstanceType<typeof root.RioMenu.Domain.MenuItem>} item
     * @returns {string}
     */
    render(item) {
      const photoContent = item.image
        ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
        : `<span class="food-placeholder">${item.emoji}</span>`;

      const priceText = this._currencyFormatter.format(item.price, 'See menu');
      const unitBadge = item.quantity ? `<span class="unit">${item.quantity}</span>` : '';

      return `
        <article class="product">
          <div class="product-photo">${photoContent}</div>
          <div class="product-info">
            <div class="product-name">${item.name}</div>
            <div class="product-sub">${item.subtitle}</div>
            <div class="price-row">
              <div class="price">${priceText}</div>
              ${unitBadge}
            </div>
          </div>
        </article>
      `.trim();
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.ProductCard = ProductCard;
})(typeof window !== 'undefined' ? window : globalThis);

