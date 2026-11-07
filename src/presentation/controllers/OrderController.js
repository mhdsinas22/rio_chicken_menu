/**
 * Presentation Layer - OrderController
 * Manages Product Selection Popup, Shopping Cart, Checkout Form, Language Switch,
 * Virtual Keyboard / Viewport Adaptation, Focus Trapping, and WhatsApp Order Integration.
 */
(function (root) {
  'use strict';

  class OrderController {
    /**
     * @param {Object} deps
     * @param {InstanceType<typeof root.RioMenu.Domain.CartService>} deps.cartService
     * @param {InstanceType<typeof root.RioMenu.Domain.I18nService>} deps.i18nService
     * @param {InstanceType<typeof root.RioMenu.Domain.WhatsAppOrderService>} deps.whatsAppOrderService
     * @param {typeof root.RioMenu.Presentation.ProductCard} deps.ProductCard
     * @param {Object} deps.elements
     */
    constructor({
      cartService,
      i18nService,
      whatsAppOrderService,
      ProductCard,
      elements
    }) {
      this._cart = cartService;
      this._i18n = i18nService;
      this._waService = whatsAppOrderService;
      this._ProductCard = ProductCard;
      this._el = elements;

      // Active product popup state
      this._selectedItem = null;
      this._selectedOption = null;
      this._selectedQty = 1;
      this._lastTriggerEl = null;

      // Checkout customer state
      this._customer = this._waService.loadCustomerDetails();
      this._toastTimer = null;
      this._isBodyLocked = false;
      this._savedScrollY = 0;
    }

    /**
     * Initializes event listeners, keyboard/viewport handlers, and initial cart & language UI.
     */
    init() {
      this._bindLanguageEvents();
      this._bindProductModalEvents();
      this._bindCartModalEvents();
      this._bindGlobalKeyEvents();
      this._initKeyboardAndViewportManager();

      this._syncCustomerFormFromState();
      this.renderCartUI();

      this._cart.subscribe(() => {
        this.renderCartUI();
      });

      this._i18n.subscribe(() => {
        if (this._selectedItem && this._el.productModal && this._el.productModal.classList.contains('open')) {
          this._renderProductModalContent();
        }
        this.renderCartUI();
        this._updateOrderTypeUI();
      });
    }

    _bindLanguageEvents() {
      if (this._el.langToggleBtn) {
        this._el.langToggleBtn.addEventListener('click', () => {
          this._i18n.toggleLanguage();
        });
      }
    }

    _bindProductModalEvents() {
      const {
        productModal,
        closeProductModalBtn,
        qtyMinusBtn,
        qtyPlusBtn,
        productOptionsList,
        addToCartBtn
      } = this._el;

      if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', () => this.closeProductModal());
      }

      if (productModal) {
        productModal.addEventListener('click', (e) => {
          if (e.target === productModal) {
            this.closeProductModal();
          }
        });
      }

      if (qtyMinusBtn) {
        qtyMinusBtn.addEventListener('click', () => {
          if (this._selectedQty > 1) {
            this._selectedQty -= 1;
            this._updateProductModalPriceAndQty();
          }
        });
      }

      if (qtyPlusBtn) {
        qtyPlusBtn.addEventListener('click', () => {
          if (this._selectedQty < 99) {
            this._selectedQty += 1;
            this._updateProductModalPriceAndQty();
          }
        });
      }

      if (productOptionsList) {
        productOptionsList.addEventListener('click', (e) => {
          const btn = e.target.closest('button[data-option-id]');
          if (!btn || !this._selectedItem || !this._selectedItem.hasOptions) {
            return;
          }
          const optId = btn.getAttribute('data-option-id');
          const found = this._selectedItem.options.find((o) => o.id === optId);
          if (found) {
            this._selectedOption = found;
            this._renderProductOptions();
            this._updateProductModalPriceAndQty();
          }
        });
      }

      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          if (!this._selectedItem) {
            return;
          }
          this._cart.addItem(this._selectedItem, this._selectedQty, this._selectedOption);
          const itemName = this._selectedItem.getName(this._i18n.lang);
          const qtyAdded = this._selectedQty;
          this.closeProductModal();
          this.showToast(`${qtyAdded} × ${itemName} — ${this._i18n.t('addedToCartToast')}`);
        });
      }
    }

    _bindCartModalEvents() {
      const {
        floatingCartBtn,
        headerCartBtn,
        stickyCartBtn,
        cartModal,
        closeCartModalBtn,
        clearCartBtn,
        browseMenuBtn,
        cartItemsList,
        checkoutForm,
        customerNameInput,
        customerPhoneInput,
        pickupTypeBtn,
        deliveryTypeBtn,
        deliveryAddressInput,
        confirmOrderBtn
      } = this._el;

      if (floatingCartBtn) {
        floatingCartBtn.addEventListener('click', () => this.openCartModal(floatingCartBtn));
      }
      if (headerCartBtn) {
        headerCartBtn.addEventListener('click', () => this.openCartModal(headerCartBtn));
      }
      if (stickyCartBtn) {
        stickyCartBtn.addEventListener('click', () => this.openCartModal(stickyCartBtn));
      }

      if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => this.closeCartModal());
      }

      if (browseMenuBtn) {
        browseMenuBtn.addEventListener('click', () => this.closeCartModal());
      }

      if (cartModal) {
        cartModal.addEventListener('click', (e) => {
          if (e.target === cartModal) {
            this.closeCartModal();
          }
        });
      }

      if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
          this._cart.clearCart();
          this._hideCheckoutError();
        });
      }

      if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
          const actionBtn = e.target.closest('button[data-cart-action]');
          if (!actionBtn) {
            return;
          }
          const action = actionBtn.getAttribute('data-cart-action');
          const cartKey = actionBtn.getAttribute('data-cart-key');
          if (!cartKey) {
            return;
          }
          if (action === 'inc') {
            this._cart.changeQuantity(cartKey, 1);
          } else if (action === 'dec') {
            this._cart.changeQuantity(cartKey, -1);
          } else if (action === 'remove') {
            this._cart.removeItem(cartKey);
          }
        });
      }

      const syncCustomerInputs = (e) => {
        if (customerNameInput) {
          this._customer.name = customerNameInput.value;
        }
        if (customerPhoneInput) {
          this._customer.phone = customerPhoneInput.value;
        }
        if (deliveryAddressInput) {
          this._customer.address = deliveryAddressInput.value;
        }
        if (e && e.target && e.target.classList) {
          e.target.classList.remove('input-invalid');
          e.target.removeAttribute('aria-invalid');
        }
        this._waService.saveCustomerDetails(this._customer);
        this._hideCheckoutError();
      };

      if (customerNameInput) {
        customerNameInput.addEventListener('input', syncCustomerInputs);
        customerNameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (customerPhoneInput) {
              customerPhoneInput.focus();
            }
          }
        });
      }

      if (customerPhoneInput) {
        customerPhoneInput.addEventListener('input', syncCustomerInputs);
        customerPhoneInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (this._customer.orderType !== 'pickup' && deliveryAddressInput) {
              deliveryAddressInput.focus();
            } else {
              this.handleConfirmOrder();
            }
          }
        });
      }

      if (deliveryAddressInput) {
        deliveryAddressInput.addEventListener('input', syncCustomerInputs);
        deliveryAddressInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.handleConfirmOrder();
          }
        });
      }

      if (pickupTypeBtn) {
        pickupTypeBtn.addEventListener('click', () => {
          this._customer.orderType = 'pickup';
          this._waService.saveCustomerDetails(this._customer);
          this._updateOrderTypeUI();
          this._hideCheckoutError();
        });
      }

      if (deliveryTypeBtn) {
        deliveryTypeBtn.addEventListener('click', () => {
          this._customer.orderType = 'delivery';
          this._waService.saveCustomerDetails(this._customer);
          this._updateOrderTypeUI();
          this._hideCheckoutError();
        });
      }

      if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleConfirmOrder();
        });
      } else if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => this.handleConfirmOrder());
      }
    }

    /**
     * Manages mobile virtual keyboard viewport resizing and input visibility scrolling.
     */
    _initKeyboardAndViewportManager() {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }

      const updateViewportVars = () => {
        const vv = window.visualViewport;
        const height = vv ? vv.height : window.innerHeight;
        document.documentElement.style.setProperty('--vvh', `${Math.round(height)}px`);
      };

      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateViewportVars);
        window.visualViewport.addEventListener('scroll', updateViewportVars);
      }
      window.addEventListener('resize', updateViewportVars);
      updateViewportVars();

      const handleInputFocus = (e) => {
        const target = e.target;
        if (!target || (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) {
          return;
        }

        document.body.classList.add('keyboard-open');
        updateViewportVars();

        // Check if the input is inside the cart modal scroll container
        const modalScroll = target.closest('.cart-modal-scroll');
        if (modalScroll) {
          modalScroll.classList.add('has-keyboard-focus');
          // Wait for mobile keyboard animation to finish (approx 180ms)
          setTimeout(() => {
            const containerRect = modalScroll.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const relativeOffset = targetRect.top - containerRect.top;
            const targetScrollTop = modalScroll.scrollTop + relativeOffset - (containerRect.height * 0.2);
            modalScroll.scrollTo({
              top: Math.max(0, targetScrollTop),
              behavior: 'smooth'
            });
          }, 180);
        } else if (!document.querySelector('.sheet-modal.open, .modal.open')) {
          // Only scroll window if NOT inside any open modal
          setTimeout(() => {
            if (typeof target.scrollIntoView === 'function') {
              target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
          }, 180);
        }
      };

      const handleInputBlur = (e) => {
        const target = e.target;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
          const modalScroll = target.closest('.cart-modal-scroll');
          if (modalScroll) {
            modalScroll.classList.remove('has-keyboard-focus');
          }
        }
        setTimeout(() => {
          updateViewportVars();
          const activeEl = document.activeElement;
          if (!activeEl || (activeEl.tagName !== 'INPUT' && activeEl.tagName !== 'TEXTAREA')) {
            document.body.classList.remove('keyboard-open');
          }
        }, 150);
      };

      document.addEventListener('focusin', handleInputFocus);
      document.addEventListener('focusout', handleInputBlur);
    }

    _bindGlobalKeyEvents() {
      if (typeof document === 'undefined') {
        return;
      }
      document.addEventListener('keydown', (e) => {
        const isProductOpen =
          this._el.productModal && this._el.productModal.classList.contains('open');
        const isCartOpen =
          this._el.cartModal && this._el.cartModal.classList.contains('open');

        if (e.key === 'Escape') {
          if (isProductOpen) {
            e.preventDefault();
            this.closeProductModal();
          } else if (isCartOpen) {
            e.preventDefault();
            this.closeCartModal();
          }
          return;
        }

        // Keyboard quantity shortcuts inside Product Modal (+ / -)
        if (isProductOpen && this._selectedItem) {
          if (e.key === '+' || e.key === '=') {
            if (this._selectedQty < 99) {
              this._selectedQty += 1;
              this._updateProductModalPriceAndQty();
            }
          } else if (e.key === '-' || e.key === '_') {
            if (this._selectedQty > 1) {
              this._selectedQty -= 1;
              this._updateProductModalPriceAndQty();
            }
          }
        }

        // Focus Trap for open sheet modals
        if (e.key === 'Tab' && (isProductOpen || isCartOpen)) {
          const activeModal = isProductOpen ? this._el.productModal : this._el.cartModal;
          this._trapFocus(e, activeModal);
        }
      });
    }

    _trapFocus(e, modalEl) {
      if (!modalEl) {
        return;
      }
      const focusable = Array.from(
        modalEl.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    /**
     * Opens the Product Selection Popup for a MenuItem.
     * @param {InstanceType<typeof root.RioMenu.Domain.MenuItem>} item
     * @param {HTMLElement} [triggerEl]
     */
    openProductModal(item, triggerEl = null) {
      if (!item || !this._el.productModal) {
        return;
      }
      this._lastTriggerEl = triggerEl || document.activeElement;
      this._selectedItem = item;
      this._selectedQty = 1;
      this._selectedOption = item.hasOptions ? item.options[0] : null;

      this._renderProductModalContent();
      this._el.productModal.classList.add('open');
      this._el.productModal.setAttribute('aria-hidden', 'false');
      this._lockBodyScroll();

      if (this._el.addToCartBtn && typeof this._el.addToCartBtn.focus === 'function') {
        this._el.addToCartBtn.focus();
      }
    }

    /**
     * Closes the Product Selection Popup.
     */
    closeProductModal() {
      if (!this._el.productModal) {
        return;
      }
      this._el.productModal.classList.remove('open');
      this._el.productModal.setAttribute('aria-hidden', 'true');
      this._selectedItem = null;
      this._unlockBodyScroll();

      if (this._lastTriggerEl && typeof this._lastTriggerEl.focus === 'function') {
        this._lastTriggerEl.focus();
      }
    }

    _renderProductModalContent() {
      const item = this._selectedItem;
      if (!item) {
        return;
      }

      const lang = this._i18n.lang;
      const categoryLabel = this._i18n.getCategoryLabel(item.category);
      const name = item.getName(lang);
      const description = item.getPopupDescription(lang, categoryLabel);
      const quantityBadge = item.getQuantity(lang);

      const {
        productModalMedia,
        productModalCategory,
        productModalName,
        productModalDesc,
        productOptionsSection
      } = this._el;

      if (productModalMedia) {
        const safeName = this._ProductCard.escapeHtml(name);
        const safeImg = this._ProductCard.escapeHtml(item.image);
        productModalMedia.classList.toggle('loaded', !item.image);
        productModalMedia.innerHTML = item.image
          ? `<img src="${safeImg}" alt="${safeName}" width="400" height="300" decoding="async" onload="this.parentElement.classList.add('loaded')" onerror="if(!this.dataset.fallbackTried&&this.src.endsWith('.webp')){this.dataset.fallbackTried='1';this.src=this.src.replace(/\\.webp$/i,'.png');}else{this.parentElement.classList.add('loaded');this.style.display='none';this.parentElement.innerHTML='<div class=\\'food-placeholder\\'>${item.emoji}</div>';}">`
          : `<div class="food-placeholder">${item.emoji}</div>`;
      }

      if (productModalCategory) {
        productModalCategory.textContent = quantityBadge
          ? `${categoryLabel} • ${quantityBadge}`
          : categoryLabel;
      }

      if (productModalName) {
        productModalName.textContent = name;
      }

      if (productModalDesc) {
        productModalDesc.textContent = description;
      }

      if (productOptionsSection) {
        if (item.hasOptions) {
          productOptionsSection.style.display = 'block';
          this._renderProductOptions();
        } else {
          productOptionsSection.style.display = 'none';
        }
      }

      this._updateProductModalPriceAndQty();
    }

    _renderProductOptions() {
      const { productOptionsList } = this._el;
      if (!productOptionsList || !this._selectedItem || !this._selectedItem.hasOptions) {
        return;
      }
      const isAr = this._i18n.lang === 'ar';
      productOptionsList.innerHTML = this._selectedItem.options
        .map((opt) => {
          const isActive = this._selectedOption && this._selectedOption.id === opt.id;
          const label = isAr ? (opt.labelAr || opt.label) : opt.label;
          return `<button type="button" class="option-pill ${isActive ? 'active' : ''}" aria-pressed="${isActive ? 'true' : 'false'}" data-option-id="${this._ProductCard.escapeHtml(opt.id)}">${this._ProductCard.escapeHtml(label)}</button>`;
        })
        .join('');
    }

    _updateProductModalPriceAndQty() {
      if (!this._selectedItem) {
        return;
      }
      const unitPrice = this._selectedOption
        ? Number(this._selectedOption.price) || 0
        : this._selectedItem.getDefaultPrice();
      const lineTotal = unitPrice * this._selectedQty;

      if (this._el.productModalPrice) {
        this._el.productModalPrice.innerHTML = `${unitPrice} <small>SAR</small>`;
      }

      if (this._el.qtyValueEl) {
        this._el.qtyValueEl.textContent = String(this._selectedQty);
      }

      if (this._el.qtyMinusBtn) {
        this._el.qtyMinusBtn.disabled = this._selectedQty <= 1;
      }

      if (this._el.addToCartBtn) {
        const addLabel = this._i18n.t('addToCartBtn', 'Add to Cart');
        this._el.addToCartBtn.innerHTML = `<span>🛒 ${this._ProductCard.escapeHtml(addLabel)}</span><span class="btn-price-tag" dir="ltr">${lineTotal} SAR</span>`;
      }
    }

    /**
     * Opens the Shopping Cart & Checkout Modal.
     * @param {HTMLElement} [triggerEl]
     */
    openCartModal(triggerEl = null) {
      if (!this._el.cartModal) {
        return;
      }
      this._lastTriggerEl = triggerEl || document.activeElement;
      this._hideCheckoutError();
      this._syncCustomerFormFromState();
      this.renderCartUI();
      this._el.cartModal.classList.add('open');
      this._el.cartModal.setAttribute('aria-hidden', 'false');
      this._lockBodyScroll();

      if (this._el.closeCartModalBtn && typeof this._el.closeCartModalBtn.focus === 'function') {
        this._el.closeCartModalBtn.focus();
      }
    }

    /**
     * Closes the Shopping Cart & Checkout Modal.
     */
    closeCartModal() {
      if (!this._el.cartModal) {
        return;
      }
      this._el.cartModal.classList.remove('open');
      this._el.cartModal.setAttribute('aria-hidden', 'true');
      const cartScroll = this._el.cartModal.querySelector('.cart-modal-scroll');
      if (cartScroll) {
        cartScroll.classList.remove('has-keyboard-focus');
      }
      document.body.classList.remove('keyboard-open');
      this._unlockBodyScroll();

      if (this._lastTriggerEl && typeof this._lastTriggerEl.focus === 'function') {
        this._lastTriggerEl.focus();
      }
    }

    _lockBodyScroll() {
      if (this._isBodyLocked) {
        return;
      }
      this._savedScrollY = window.scrollY || window.pageYOffset || 0;
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      document.body.style.top = `-${this._savedScrollY}px`;
      this._isBodyLocked = true;
    }

    _unlockBodyScroll() {
      const anyOpen = document.querySelector('.modal.open, .sheet-modal.open');
      if (anyOpen) {
        return;
      }
      if (!this._isBodyLocked) {
        return;
      }
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, this._savedScrollY || 0);
      this._isBodyLocked = false;
    }

    _syncCustomerFormFromState() {
      const { customerNameInput, customerPhoneInput, deliveryAddressInput } = this._el;
      if (customerNameInput && customerNameInput.value !== this._customer.name) {
        customerNameInput.value = this._customer.name;
      }
      if (customerPhoneInput && customerPhoneInput.value !== this._customer.phone) {
        customerPhoneInput.value = this._customer.phone;
      }
      if (deliveryAddressInput && deliveryAddressInput.value !== this._customer.address) {
        deliveryAddressInput.value = this._customer.address;
      }
      this._updateOrderTypeUI();
    }

    _updateOrderTypeUI() {
      const isDelivery = this._customer.orderType === 'delivery';
      const { pickupTypeBtn, deliveryTypeBtn, deliveryAddressGroup } = this._el;

      if (pickupTypeBtn) {
        pickupTypeBtn.classList.toggle('active', !isDelivery);
        pickupTypeBtn.setAttribute('aria-pressed', String(!isDelivery));
      }
      if (deliveryTypeBtn) {
        deliveryTypeBtn.classList.toggle('active', isDelivery);
        deliveryTypeBtn.setAttribute('aria-pressed', String(isDelivery));
      }
      if (deliveryAddressGroup) {
        deliveryAddressGroup.style.display = isDelivery ? 'block' : 'none';
      }
      const deliveryRow = this._el.cartModal?.querySelector('#cartDeliveryRow');

      if (deliveryRow) {
        deliveryRow.style.display = isDelivery ? 'flex' : 'none';
      }
      // Refresh cart amount when order type changes
      this.renderCartUI();
    }

    /**
     * Renders the floating cart button, header cart counters, cart item list, and SAR totals.
     */
    renderCartUI() {
      const items = this._cart.getItems();
      const totalCount = this._cart.getTotalCount();
      const subtotal = this._cart.getSubtotal();

      const deliveryFee =
        this._customer.orderType === 'delivery' ? 5 : 0;

      const total = subtotal + deliveryFee;
      const lang = this._i18n.lang;
      const isAr = lang === 'ar';

      const {
        floatingCartBtn,
        floatingCartCount,
        floatingCartTotal,
        headerCartCount,
        stickyCartCount,
        cartEmptyState,
        cartFilledContent,
        clearCartBtn,
        cartItemsList,
        cartSubtotalEl,
        cartTotalEl
      } = this._el;

      if (floatingCartCount) {
        floatingCartCount.textContent = String(totalCount);
      }
      if (floatingCartTotal) {
        floatingCartTotal.textContent = `${total} SAR`;
      }
      if (floatingCartBtn) {
        floatingCartBtn.classList.toggle('has-items', totalCount > 0);
      }
      if (headerCartCount) {
        headerCartCount.textContent = String(totalCount);
        headerCartCount.style.display = totalCount > 0 ? 'inline-flex' : 'none';
      }
      if (stickyCartCount) {
        stickyCartCount.textContent = String(totalCount);
      }

      const hasItems = items.length > 0;
      if (cartEmptyState) {
        cartEmptyState.style.display = hasItems ? 'none' : 'block';
      }
      if (cartFilledContent) {
        cartFilledContent.style.display = hasItems ? 'block' : 'none';
      }
      if (clearCartBtn) {
        clearCartBtn.style.display = hasItems ? 'inline-flex' : 'none';
      }
      // Update delivery charge amount
      const deliveryFeeEl =
        this._el.cartModal?.querySelector('#cartDeliveryFee');

      if (deliveryFeeEl) {
        deliveryFeeEl.textContent = `${deliveryFee} SAR`;
      }

      // Hide delivery row when Pickup is selected
      const deliveryRow =
        this._el.cartModal?.querySelector('#cartDeliveryRow');

      if (deliveryRow) {
        deliveryRow.style.display =
          this._customer.orderType === 'delivery' ? 'flex' : 'none';
      }

      if (cartItemsList && hasItems) {
        const removeAria = this._ProductCard.escapeHtml(this._i18n.t('removeItemAria', 'Remove item'));
        cartItemsList.innerHTML = items
          .map((entry) => {
            const item = entry.menuItem;
            const itemName = item.getName(lang);
            const optionLabel = isAr ? entry.optionLabelAr : entry.optionLabel;
            const fullTitle = optionLabel ? `${itemName} (${optionLabel})` : itemName;
            const safeTitle = this._ProductCard.escapeHtml(fullTitle);
            const safeKey = this._ProductCard.escapeHtml(entry.cartKey);
            const safeImg = this._ProductCard.escapeHtml(item.image);

            const thumbHtml = item.image
              ? `<img src="${safeImg}" alt="${safeTitle}" loading="lazy" decoding="async" onerror="this.style.display='none';this.parentElement.innerHTML='<span>${item.emoji}</span>';">`
              : `<span>${item.emoji}</span>`;

            return `
              <div class="cart-item" data-cart-key="${safeKey}">
                <div class="cart-item-thumb">${thumbHtml}</div>
                <div class="cart-item-details">
                  <div class="cart-item-title">${safeTitle}</div>
                  <div class="cart-item-unit">${entry.unitPrice} SAR × ${entry.quantity}</div>
                  <div class="cart-item-subtotal">${entry.subtotal} SAR</div>
                </div>
                <div class="cart-item-actions">
                  <div class="qty-stepper small">
                    <button type="button" class="qty-btn" data-cart-action="dec" data-cart-key="${safeKey}" aria-label="Decrease quantity">−</button>
                    <span class="qty-num">${entry.quantity}</span>
                    <button type="button" class="qty-btn" data-cart-action="inc" data-cart-key="${safeKey}" aria-label="Increase quantity">+</button>
                  </div>
                  <button type="button" class="cart-remove-btn" data-cart-action="remove" data-cart-key="${safeKey}" aria-label="${removeAria}" title="${removeAria}">🗑️</button>
                </div>
              </div>
            `;
          })
          .join('');
      } else if (cartItemsList) {
        cartItemsList.innerHTML = '';
      }

      if (cartSubtotalEl) {
        cartSubtotalEl.textContent = `${subtotal} SAR`;
      }
      if (cartTotalEl) {
        cartTotalEl.textContent = `${total} SAR`;
      }
    }

    _showCheckoutError(message, field) {
      if (this._el.checkoutError) {
        this._el.checkoutError.textContent = message;
        this._el.checkoutError.style.display = 'block';
      }
      const fieldMap = {
        name: this._el.customerNameInput,
        phone: this._el.customerPhoneInput,
        address: this._el.deliveryAddressInput
      };
      const targetInput = field ? fieldMap[field] : null;
      if (targetInput) {
        targetInput.classList.add('input-invalid');
        targetInput.setAttribute('aria-invalid', 'true');
        targetInput.focus();
      }
    }

    _hideCheckoutError() {
      if (this._el.checkoutError) {
        this._el.checkoutError.textContent = '';
        this._el.checkoutError.style.display = 'none';
      }
      [
        this._el.customerNameInput,
        this._el.customerPhoneInput,
        this._el.deliveryAddressInput
      ].forEach((input) => {
        if (input) {
          input.classList.remove('input-invalid');
          input.removeAttribute('aria-invalid');
        }
      });
    }

    /**
     * Validates the checkout form, builds the localized WhatsApp message,
     * and opens WhatsApp with the pre-filled order message.
     * @returns {{success: boolean, url?: string, message?: string, error?: string}}
     */
    handleConfirmOrder() {
      const items = this._cart.getItems();
      const subtotal = this._cart.getSubtotal();
      const deliveryFee = this._customer.orderType === 'delivery' ? 5 : 0;
      const total = subtotal + deliveryFee;
      if (this._isSubmittingOrder) {
        return { success: false };
      }
      this._isSubmittingOrder = true;

      if (this._el.customerNameInput) {
        this._customer.name = this._el.customerNameInput.value;
      }
      if (this._el.customerPhoneInput) {
        this._customer.phone = this._el.customerPhoneInput.value;
      }
      if (this._el.deliveryAddressInput) {
        this._customer.address = this._el.deliveryAddressInput.value;
      }

      const validation = this._waService.validateOrder({
        items,
        customer: this._customer
      });

      if (!validation.valid) {
        this._isSubmittingOrder = false;
        this._showCheckoutError(validation.errorMessage, validation.field);
        return { success: false, error: validation.errorMessage };
      }

      this._hideCheckoutError();
      this._waService.saveCustomerDetails(this._customer);

      const message = this._waService.buildOrderMessage({
        items,
        subtotal,
        deliveryFee,
        total,
        customer: this._customer,
        lang: this._i18n.lang
      });

      const waUrl = this._waService.buildWhatsAppUrl(message);

      if (typeof window !== 'undefined') {
        window.location.href = waUrl;
      }

      return {
        success: true,
        url: waUrl,
        message
      };
    }

    /**
     * Displays a temporary toast message at the bottom of the screen.
     * @param {string} message
     */
    showToast(message) {
      const toastEl = this._el.toastEl;
      if (!toastEl) {
        return;
      }
      toastEl.textContent = message;
      toastEl.classList.add('show');
      if (this._toastTimer) {
        clearTimeout(this._toastTimer);
      }
      this._toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
      }, 2400);
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.OrderController = OrderController;
})(typeof window !== 'undefined' ? window : globalThis);
