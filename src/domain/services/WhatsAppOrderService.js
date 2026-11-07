/**
 * Domain Service - WhatsAppOrderService
 * Generates localized (EN / AR) WhatsApp order messages and deep links for RIO Chicken.
 * Restaurant WhatsApp Number: +966 50 383 9301
 */
(function (root) {
  'use strict';

  const WHATSAPP_PHONE = '966503839301';
  const CUSTOMER_STORAGE_KEY = 'rio_chicken_customer_v1';

  class WhatsAppOrderService {
    /**
     * @param {InstanceType<typeof root.RioMenu.Domain.I18nService>} i18nService
     */
    constructor(i18nService) {
      this._i18n = i18nService;
    }

    /**
     * Returns the restaurant WhatsApp phone digits.
     * @returns {string}
     */
    static get phoneNumber() {
      return WHATSAPP_PHONE;
    }

    /**
     * Loads saved customer checkout details from localStorage.
     * @returns {{name: string, phone: string, orderType: 'pickup'|'delivery', address: string}}
     */
    loadCustomerDetails() {
      const defaults = {
        name: '',
        phone: '',
        orderType: 'delivery',
        address: ''
      };
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            return {
              name: typeof parsed.name === 'string' ? parsed.name : '',
              phone: typeof parsed.phone === 'string' ? parsed.phone : '',
              orderType: parsed.orderType === 'pickup' ? 'pickup' : 'delivery',
              address: typeof parsed.address === 'string' ? parsed.address : ''
            };
          }
        }
      } catch (_) {
        // Ignore storage read errors
      }
      return defaults;
    }

    /**
     * Saves customer checkout details to localStorage.
     * @param {{name: string, phone: string, orderType: 'pickup'|'delivery', address: string}} customer
     */
    saveCustomerDetails(customer) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
        }
      } catch (_) {
        // Ignore storage write errors
      }
    }

    /**
     * Validates checkout customer info and cart items.
     * @param {Object} params
     * @param {Array} params.items
     * @param {{name: string, phone: string, orderType: 'pickup'|'delivery', address: string}} params.customer
     * @returns {{valid: boolean, errorKey?: string, errorMessage?: string}}
     */
    validateOrder({ items, customer }) {
      if (!Array.isArray(items) || items.length === 0) {
        return {
          valid: false,
          errorKey: 'errEmptyCart',
          errorMessage: this._i18n.t('errEmptyCart')
        };
      }

      const name = (customer && customer.name ? customer.name : '').trim();
      if (!name) {
        return {
          valid: false,
          field: 'name',
          errorKey: 'errNameRequired',
          errorMessage: this._i18n.t('errNameRequired')
        };
      }

      const phone = (customer && customer.phone ? customer.phone : '').trim();
      const digitsOnly = phone.replace(/\D/g, '');
      if (!phone || digitsOnly.length < 7) {
        return {
          valid: false,
          field: 'phone',
          errorKey: 'errPhoneRequired',
          errorMessage: this._i18n.t('errPhoneRequired')
        };
      }

      const orderType = customer && customer.orderType === 'pickup' ? 'pickup' : 'delivery';
      const address = (customer && customer.address ? customer.address : '').trim();
      if (orderType === 'delivery' && !address) {
        return {
          valid: false,
          field: 'address',
          errorKey: 'errAddressRequired',
          errorMessage: this._i18n.t('errAddressRequired')
        };
      }

      return { valid: true };
    }

    /**
     * Formats a complete WhatsApp message in the currently selected language (EN or AR).
     * @param {Object} params
     * @param {Array} params.items - Enriched cart items from CartService.getItems()
     * @param {number} params.subtotal - Cart subtotal in SAR
     * @param {number} params.total - Final total in SAR
     * @param {{name: string, phone: string, orderType: 'pickup'|'delivery', address: string}} params.customer
     * @param {string} [params.lang] - Language override ('en' | 'ar')
     * @returns {string}
     */
    buildOrderMessage({ items, subtotal, deliveryFee, total, customer, lang }) {
      const activeLang = lang || (this._i18n ? this._i18n.lang : 'en');
      const isAr = activeLang === 'ar';
      const t = (key) => this._i18n.t(key);

      const cleanName = (customer.name || '').trim();
      const cleanPhone = (customer.phone || '').trim();
      const isDelivery = customer.orderType !== 'pickup';
      const cleanAddress = (customer.address || '').trim();
      const orderTypeLabel = isDelivery ? t('waDelivery') : t('waPickup');

      const lines = [
        t('waHeader'),
        '━━━━━━━━━━━━━━━━━━━━',
        t('waCustomerSection'),
        `• ${t('waName')}: ${cleanName}`,
        `• ${t('waPhone')}: ${cleanPhone}`,
        `• ${t('waOrderType')}: ${orderTypeLabel}`
      ];

      if (isDelivery && cleanAddress) {
        lines.push(`• ${t('waAddress')}: ${cleanAddress}`);
      }

      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(t('waItemsSection'));

      items.forEach((entry, idx) => {
        const productName = entry.menuItem.getName(activeLang);
        const optionText = isAr ? entry.optionLabelAr : entry.optionLabel;
        const fullItemName = optionText ? `${productName} - ${optionText}` : productName;
        lines.push(
          `${idx + 1}. *${fullItemName}*`,
          `   ${entry.quantity} × ${entry.unitPrice} SAR = *${entry.subtotal} SAR*`
        );
      });

      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(t('waSummarySection'));
      lines.push(`• ${t('waSubtotal')}: ${subtotal} SAR`);
      if (isDelivery) {
        lines.push(`• ${t('waDeliveryFee')}: ${deliveryFee} SAR`);
      }
      lines.push(`• *${t('waTotal')}: ${total} SAR*`);
      lines.push('━━━━━━━━━━━━━━━━━━━━');
      lines.push(t('waFooter'));

      return lines.join('\n');
    }

    /**
     * Builds the https://wa.me/ URL with the encoded order message.
     * @param {string} message
     * @returns {string}
     */
    buildWhatsAppUrl(message) {
      return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Domain = root.RioMenu.Domain || {};
  root.RioMenu.Domain.WhatsAppOrderService = WhatsAppOrderService;
})(typeof window !== 'undefined' ? window : globalThis);

