// src/composables/useNotification.js - Sistema de notificaciones toast
export function useNotification() {
  
  /**
   * Mostrar notificación
   */
  const show = (message, type = 'info', duration = 3000) => {
    const notification = document.createElement('div')
    notification.className = 'toast toast-top toast-center z-50'
    
    const alertClass = {
      'success': 'alert-success',
      'error': 'alert-error',
      'warning': 'alert-warning',
      'info': 'alert-info'
    }[type] || 'alert-info'

    const icon = {
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'info': 'ℹ️'
    }[type] || 'ℹ️'
    
    notification.innerHTML = `
      <div class="alert ${alertClass} shadow-lg">
        <span>${icon} ${message}</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remover después de duration
    setTimeout(() => {
      notification.style.opacity = '0'
      notification.style.transition = 'opacity 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, duration)
  }

  const success = (message, duration) => show(message, 'success', duration)
  const error = (message, duration) => show(message, 'error', duration)
  const warning = (message, duration) => show(message, 'warning', duration)
  const info = (message, duration) => show(message, 'info', duration)

  /**
   * Notificación de carga
   */
  const loading = (message = 'Cargando...') => {
    const notification = document.createElement('div')
    notification.className = 'toast toast-top toast-center z-50'
    notification.id = 'loading-notification'
    
    notification.innerHTML = `
      <div class="alert alert-info shadow-lg">
        <span class="loading loading-spinner loading-sm"></span>
        <span>${message}</span>
      </div>
    `
    
    document.body.appendChild(notification)
    
    return {
      dismiss: () => {
        notification.style.opacity = '0'
        notification.style.transition = 'opacity 0.3s ease'
        setTimeout(() => notification.remove(), 300)
      }
    }
  }

  /**
   * Confirmar acción
   */
  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      const {
        title = '¿Estás seguro?',
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'warning'
      } = options

      const modal = document.createElement('div')
      modal.className = 'modal modal-open'
      
      const alertClass = {
        'warning': 'alert-warning',
        'error': 'alert-error',
        'info': 'alert-info'
      }[type] || 'alert-warning'

      modal.innerHTML = `
        <div class="modal-box">
          <h3 class="font-bold text-lg">${title}</h3>
          <div class="alert ${alertClass} mt-4">
            <span>${message}</span>
          </div>
          <div class="modal-action">
            <button class="btn btn-ghost" data-action="cancel">${cancelText}</button>
            <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
          </div>
        </div>
        <div class="modal-backdrop" data-action="cancel"></div>
      `
      
      document.body.appendChild(modal)
      
      modal.addEventListener('click', (e) => {
        const action = e.target.dataset.action
        if (action) {
          modal.remove()
          resolve(action === 'confirm')
        }
      })
    })
  }

  return {
    show,
    success,
    error,
    warning,
    info,
    loading,
    confirm
  }
}