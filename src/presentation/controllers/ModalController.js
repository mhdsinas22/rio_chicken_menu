/**
 * Presentation Layer - ModalController
 * Manages opening, closing, and keyboard accessibility of the original menu artwork zoom modal.
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
      this._lastTriggerEl = null;
    }

    /**
     * Binds modal open/close events.
     */
    init() {
      if (!this._modalEl) {
        return;
      }

      if (this._openBtn) {
        this._openBtn.addEventListener('click', () => this.open(this._openBtn));
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
        if (e.key === 'Escape' && this._modalEl.classList.contains('open')) {
          this.close();
        }
      });
    }

    open(triggerEl = null) {
      this._lastTriggerEl = triggerEl || document.activeElement;
      this._modalEl.classList.add('open');
      this._modalEl.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      if (this._closeBtn && typeof this._closeBtn.focus === 'function') {
        this._closeBtn.focus();
      }
    }

    close() {
      if (!this._modalEl.classList.contains('open')) {
        return;
      }
      this._modalEl.classList.remove('open');
      this._modalEl.setAttribute('aria-hidden', 'true');
      const anyOpen = document.querySelector('.modal.open, .sheet-modal.open');
      if (!anyOpen) {
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
      }
      if (this._lastTriggerEl && typeof this._lastTriggerEl.focus === 'function') {
        this._lastTriggerEl.focus();
      }
    }
  }

  root.RioMenu = root.RioMenu || {};
  root.RioMenu.Presentation = root.RioMenu.Presentation || {};
  root.RioMenu.Presentation.ModalController = ModalController;
})(typeof window !== 'undefined' ? window : globalThis);
