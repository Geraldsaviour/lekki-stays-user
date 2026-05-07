/**
 * Custom Modal Utility
 * Beautiful, animated modals to replace browser dialogs
 * No dependencies required
 */

class ModalUtils {
  /**
   * Show custom prompt modal
   * @param {string} message - The message to display
   * @param {string} title - Modal title
   * @param {string} placeholder - Input placeholder
   * @returns {Promise<string|null>} - User input or null if cancelled
   */
  static showPrompt(message, title = 'Input Required', placeholder = '') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-utils-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'modal-utils prompt-modal-utils';
      modal.innerHTML = `
        <div class="modal-utils-header">
          <h3>${title}</h3>
        </div>
        <div class="modal-utils-body">
          <p class="modal-utils-message">${message}</p>
          <input type="text" class="modal-utils-input" placeholder="${placeholder}" autofocus>
        </div>
        <div class="modal-utils-footer">
          <button class="modal-utils-btn modal-utils-btn-cancel">
            Cancel
          </button>
          <button class="modal-utils-btn modal-utils-btn-primary">
            OK
          </button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => overlay.classList.add('active'));
      
      const input = modal.querySelector('.modal-utils-input');
      const cancelBtn = modal.querySelector('.modal-utils-btn-cancel');
      const okBtn = modal.querySelector('.modal-utils-btn-primary');
      
      setTimeout(() => input.focus(), 100);
      
      const cleanup = (value) => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        resolve(value);
      };
      
      cancelBtn.addEventListener('click', () => cleanup(null));
      okBtn.addEventListener('click', () => cleanup(input.value.trim() || null));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') cleanup(input.value.trim() || null);
        else if (e.key === 'Escape') cleanup(null);
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(null);
      });
    });
  }

  /**
   * Show custom confirm modal
   * @param {string} message - The message to display
   * @param {string} title - Modal title
   * @param {string} confirmText - Confirm button text
   * @param {string} type - Modal type: 'primary', 'danger', 'warning'
   * @returns {Promise<boolean>} - true if confirmed, false if cancelled
   */
  static showConfirm(message, title = 'Confirm Action', confirmText = 'Confirm', type = 'primary') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-utils-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'modal-utils confirm-modal-utils';
      
      const icons = {
        primary: '❓',
        danger: '⚠️',
        warning: '⚠️',
        success: '✓'
      };
      
      modal.innerHTML = `
        <div class="modal-utils-header">
          <div class="modal-utils-icon modal-utils-icon-${type}">
            ${icons[type] || icons.primary}
          </div>
          <h3>${title}</h3>
        </div>
        <div class="modal-utils-body">
          <p class="modal-utils-message">${message}</p>
        </div>
        <div class="modal-utils-footer">
          <button class="modal-utils-btn modal-utils-btn-cancel">
            Cancel
          </button>
          <button class="modal-utils-btn modal-utils-btn-${type}">
            ${confirmText}
          </button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => overlay.classList.add('active'));
      
      const cancelBtn = modal.querySelector('.modal-utils-btn-cancel');
      const confirmBtn = modal.querySelector(`.modal-utils-btn-${type}`);
      
      const cleanup = (value) => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        resolve(value);
      };
      
      cancelBtn.addEventListener('click', () => cleanup(false));
      confirmBtn.addEventListener('click', () => cleanup(true));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup(false);
      });
      
      const escHandler = (e) => {
        if (e.key === 'Escape') {
          cleanup(false);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
    });
  }

  /**
   * Show custom alert modal
   * @param {string} message - The message to display
   * @param {string} title - Modal title
   * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
   * @returns {Promise<void>}
   */
  static showAlert(message, title = 'Notice', type = 'info') {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-utils-overlay';
      
      const modal = document.createElement('div');
      modal.className = 'modal-utils alert-modal-utils';
      
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };
      
      const titles = {
        success: title || 'Success',
        error: title || 'Error',
        warning: title || 'Warning',
        info: title || 'Notice'
      };
      
      modal.innerHTML = `
        <div class="modal-utils-header">
          <div class="modal-utils-icon modal-utils-icon-${type}">
            ${icons[type] || icons.info}
          </div>
          <h3>${titles[type]}</h3>
        </div>
        <div class="modal-utils-body">
          <p class="modal-utils-message">${message}</p>
        </div>
        <div class="modal-utils-footer">
          <button class="modal-utils-btn modal-utils-btn-primary">
            OK
          </button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => overlay.classList.add('active'));
      
      const okBtn = modal.querySelector('.modal-utils-btn-primary');
      
      const cleanup = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        resolve();
      };
      
      okBtn.addEventListener('click', cleanup);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cleanup();
      });
      
      const keyHandler = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          cleanup();
          document.removeEventListener('keydown', keyHandler);
        }
      };
      document.addEventListener('keydown', keyHandler);
    });
  }

  /**
   * Show toast notification
   * @param {string} message - The message to display
   * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds (default: 5000)
   */
  static showToast(message, type = 'info', duration = 5000) {
    let container = document.getElementById('modal-utils-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-utils-toast-container';
      container.className = 'modal-utils-toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `modal-utils-toast modal-utils-toast-${type}`;
    toast.innerHTML = `
      <div class="modal-utils-toast-icon">${icons[type] || icons.info}</div>
      <div class="modal-utils-toast-message">${message}</div>
      <button class="modal-utils-toast-close">✕</button>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.modal-utils-toast-close');
    const removeToast = () => {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) container.remove();
      }, 300);
    };

    closeBtn.addEventListener('click', removeToast);
    setTimeout(removeToast, duration);
  }
}

// Make it globally available
window.ModalUtils = ModalUtils;

// Add CSS styles dynamically
const style = document.createElement('style');
style.textContent = `
/* Modal Utils Styles */
.modal-utils-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 20px;
}

.modal-utils-overlay.active {
  opacity: 1;
}

.modal-utils-overlay.active .modal-utils {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.modal-utils {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  overflow: hidden;
  transform: scale(0.9) translateY(-20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-utils-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.modal-utils-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.modal-utils-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  position: relative;
  animation: pulse 2s ease-in-out infinite;
}

.modal-utils-icon-primary {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.modal-utils-icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.modal-utils-icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.modal-utils-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.modal-utils-icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.modal-utils-icon-error {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.modal-utils-body {
  padding: 1.5rem 2rem;
}

.modal-utils-message {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.modal-utils-input {
  width: 100%;
  padding: 0.875rem 1rem;
  margin-top: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  color: #111827;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.modal-utils-input:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
  transform: translateY(-2px);
}

.modal-utils-footer {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.modal-utils-btn {
  flex: 1;
  max-width: 180px;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modal-utils-btn:hover {
  transform: translateY(-2px);
}

.modal-utils-btn:active {
  transform: scale(0.95);
}

.modal-utils-btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.modal-utils-btn-cancel:hover {
  background: #e5e7eb;
  color: #374151;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modal-utils-btn-primary {
  background: linear-gradient(135deg, #D4AF37, #C9A84A);
  color: white;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.modal-utils-btn-primary:hover {
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.modal-utils-btn-danger {
  background: linear-gradient(135deg, #EF4444, #DC2626);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.modal-utils-btn-danger:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

.modal-utils-btn-success {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.modal-utils-btn-success:hover {
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.modal-utils-btn-warning {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.modal-utils-btn-warning:hover {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

/* Toast Notifications */
.modal-utils-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10002;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.modal-utils-toast {
  min-width: 300px;
  max-width: 400px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  pointer-events: all;
  animation: slideIn 0.3s ease-out;
  border-left: 4px solid #D4AF37;
}

.modal-utils-toast-success {
  border-left-color: #10B981;
}

.modal-utils-toast-error {
  border-left-color: #EF4444;
}

.modal-utils-toast-warning {
  border-left-color: #F59E0B;
}

.modal-utils-toast-info {
  border-left-color: #3B82F6;
}

.modal-utils-toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
}

.modal-utils-toast-success .modal-utils-toast-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.modal-utils-toast-error .modal-utils-toast-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.modal-utils-toast-warning .modal-utils-toast-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.modal-utils-toast-info .modal-utils-toast-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.modal-utils-toast-message {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
}

.modal-utils-toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 18px;
  line-height: 1;
}

.modal-utils-toast-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-utils-toast.removing {
  animation: slideOut 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .modal-utils {
    max-width: 90%;
    margin: 0 20px;
  }

  .modal-utils-header {
    padding: 1.5rem 1.5rem 0.75rem;
  }

  .modal-utils-header h3 {
    font-size: 1.25rem;
  }

  .modal-utils-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
    margin-bottom: 0.75rem;
  }

  .modal-utils-body {
    padding: 1rem 1.5rem;
  }

  .modal-utils-message {
    font-size: 0.9375rem;
  }

  .modal-utils-footer {
    padding: 1rem 1.5rem 1.5rem;
    flex-direction: column;
  }

  .modal-utils-btn {
    max-width: none;
    width: 100%;
  }

  .modal-utils-toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }

  .modal-utils-toast {
    min-width: auto;
    max-width: none;
  }
}
`;
document.head.appendChild(style);
