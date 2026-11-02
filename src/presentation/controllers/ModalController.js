/**
 * Presentation Layer - ModalController
 * Manages opening and closing of the original menu artwork zoom modal.
 */
(function (root) {
  'use strict';

  class ModalController {
    /**
     * @param {Object} elements
     * @param {HTMLElement} elements.modalEl
     * @param {HTMLButtonElement} elements.openBtn
     * @param {HTMLButtonElement} elements.closeBtn
     */
    constructor({ modalEl, openBtn, closeBtn }) {
      this._modalEl = modalEl;
      this._openBtn = openBtn;
      this._closeBtn = closeBtn;
    }

    /**
     * Binds modal open/close events.
     */
    init() {
      if (!this._modalEl) {
        return;
      }

      if (this._openBtn) {
        this._openBtn.addEventListener('click', () => this.open());
      }

      if (this._closeBtn) {
        this._closeBtn.addEventListener('click', () => this.close());
      }

      this._modalEl.addEventListener('click', (e) => {
        if (e.target === this._modalEl) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.close();
        }
      });
    }

    open() {
      this._modalEl.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    close() {
      this._modalEl.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.ModalController = ModalController;
})(typeof window !== 'undefined' ? window : globalThis);

