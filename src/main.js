/**
 * Composition Root - Application Bootstrapper
 * Wires Domain, Data, Application, and Presentation layers together.
 */
(function (root) {
  'use strict';

  function bootstrap() {
    const { Domain, Data, Application, Presentation } = root.RioMenu;

    // 1. Instantiate Data Layer Repository
    const menuRepository = new Data.MenuRepository(
      Data.MENU_ITEMS,
      Data.MENU_CATEGORIES,
      Domain.MenuItem
    );

    // 2. Instantiate Domain Services
    const i18nService = new Domain.I18nService(
      Data.UI_TRANSLATIONS,
      Data.MENU_CATEGORIES
    );
    const cartService = new Domain.CartService(menuRepository);
    const whatsAppOrderService = new Domain.WhatsAppOrderService(i18nService);

    // Apply initial language & RTL/LTR state to document
    i18nService.applyToDocument();

    // 3. Instantiate Application Use Cases
    const filterUseCase = new Application.FilterMenuItemsUseCase(menuRepository);

    // 4. Instantiate Order Controller (Product Selection Popup, Cart, Checkout & WhatsApp)
    const orderController = new Presentation.OrderController({
      cartService,
      i18nService,
      whatsAppOrderService,
      ProductCard: Presentation.ProductCard,
      elements: {
        langToggleBtn: document.getElementById('langToggleBtn'),
        productModal: document.getElementById('productModal'),
        closeProductModalBtn: document.getElementById('closeProductModal'),
        productModalMedia: document.getElementById('productModalMedia'),
        productModalCategory: document.getElementById('productModalCategory'),
        productModalName: document.getElementById('productModalName'),
        productModalDesc: document.getElementById('productModalDesc'),
        productModalPrice: document.getElementById('productModalPrice'),
        productOptionsSection: document.getElementById('productOptionsSection'),
        productOptionsList: document.getElementById('productOptionsList'),
        qtyMinusBtn: document.getElementById('qtyMinusBtn'),
        qtyValueEl: document.getElementById('qtyValue'),
        qtyPlusBtn: document.getElementById('qtyPlusBtn'),
        addToCartBtn: document.getElementById('addToCartBtn'),
        floatingCartBtn: document.getElementById('floatingCartBtn'),
        floatingCartCount: document.getElementById('floatingCartCount'),
        floatingCartTotal: document.getElementById('floatingCartTotal'),
        headerCartBtn: document.getElementById('headerCartBtn'),
        headerCartCount: document.getElementById('headerCartCount'),
        stickyCartBtn: document.getElementById('stickyCartBtn'),
        stickyCartCount: document.getElementById('stickyCartCount'),
        cartModal: document.getElementById('cartModal'),
        closeCartModalBtn: document.getElementById('closeCartModal'),
        clearCartBtn: document.getElementById('clearCartBtn'),
        browseMenuBtn: document.getElementById('browseMenuBtn'),
        cartEmptyState: document.getElementById('cartEmptyState'),
        cartFilledContent: document.getElementById('cartFilledContent'),
        cartItemsList: document.getElementById('cartItemsList'),
        cartSubtotalEl: document.getElementById('cartSubtotal'),
        cartTotalEl: document.getElementById('cartTotal'),
        checkoutForm: document.getElementById('checkoutForm'),
        customerNameInput: document.getElementById('customerNameInput'),
        customerPhoneInput: document.getElementById('customerPhoneInput'),
        pickupTypeBtn: document.getElementById('pickupTypeBtn'),
        deliveryTypeBtn: document.getElementById('deliveryTypeBtn'),
        deliveryAddressGroup: document.getElementById('deliveryAddressGroup'),
        deliveryAddressInput: document.getElementById('deliveryAddressInput'),
        checkoutError: document.getElementById('checkoutError'),
        confirmOrderBtn: document.getElementById('confirmOrderBtn'),
        toastEl: document.getElementById('toast')
      }
    });

    // 5. Instantiate Menu Controller
    const menuController = new Presentation.MenuController({
      menuRepository,
      filterUseCase,
      ProductCard: Presentation.ProductCard,
      CurrencyFormatter: Domain.CurrencyFormatter,
      i18nService,
      cartService,
      onSelectProduct: (item, triggerEl) => orderController.openProductModal(item, triggerEl),
      elements: {
        filtersEl: document.getElementById('filters'),
        gridEl: document.getElementById('grid'),
        emptyEl: document.getElementById('empty'),
        searchEl: document.getElementById('searchInput'),
        clearSearchBtn: document.getElementById('clearSearchBtn'),
        sectionTitleEl: document.getElementById('sectionTitle'),
        itemCountEl: document.getElementById('itemCount')
      }
    });

    // 6. Instantiate Original Menu Artwork Zoom Modal Controller
    const modalController = new Presentation.ModalController({
      modalEl: document.getElementById('zoomModal'),
      openBtn: document.getElementById('openZoom'),
      closeBtn: document.getElementById('closeModal')
    });

    orderController.init();
    menuController.init();
    modalController.init();

    // Expose active instances on root.RioMenu.app for programmatic inspection/testing
    root.RioMenu.app = {
      menuRepository,
      i18nService,
      cartService,
      whatsAppOrderService,
      orderController,
      menuController,
      modalController
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(typeof window !== 'undefined' ? window : globalThis);
