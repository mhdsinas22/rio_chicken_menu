/**
 * Application Composition Root (Main Entry Point)
 * Wires Domain, Data, Application, and Presentation layers together.
 */
(function (root) {
  'use strict';

  function bootstrap() {
    const { Domain, Data, Application, Presentation } = root.RioMenu;

    // 1. Domain Services
    const currencyFormatter = new Domain.CurrencyFormatter('SAR');

    // 2. Data Layer (Repository)
    const menuRepository = new Data.MenuRepository(
      Data.MENU_ITEMS,
      Data.MENU_CATEGORIES,
      Domain.MenuItem
    );

    // 3. Application Layer (Use Cases)
    const filterMenuItemsUseCase = new Application.FilterMenuItemsUseCase(menuRepository);

    // 4. Presentation Layer (Components & Controllers)
    const productCard = new Presentation.ProductCard(currencyFormatter);

    const menuController = new Presentation.MenuController({
      filterMenuItemsUseCase,
      productCard,
      elements: {
        gridEl: document.getElementById('grid'),
        searchEl: document.getElementById('search'),
        countEl: document.getElementById('count'),
        emptyEl: document.getElementById('empty'),
        titleEl: document.getElementById('gridTitle'),
        filterButtons: document.querySelectorAll('.filter'),
        showAllBtn: document.getElementById('showAll'),
        menuSectionEl: document.getElementById('menuItems'),
      },
    });

    const modalController = new Presentation.ModalController({
      modalEl: document.getElementById('modal'),
      openBtn: document.getElementById('zoom'),
      closeBtn: document.getElementById('close'),
    });

    menuController.init();
    modalController.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(typeof window !== 'undefined' ? window : globalThis);

