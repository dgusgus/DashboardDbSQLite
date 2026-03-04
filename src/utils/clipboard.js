// src/utils/clipboard.js
// Utilidad para copiar al portapapeles compatible con móviles

/**
 * Copia texto al portapapeles de forma compatible con móviles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} - true si se copió exitosamente
 */
export async function copyToClipboard(text) {
  // Método 1: Clipboard API moderna (HTTPS requerido)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('Clipboard API falló, intentando método fallback:', err)
      // Continuar al método fallback
    }
  }

  // Método 2: Fallback para HTTP o navegadores antiguos
  return copyTextFallback(text)
}

/**
 * Método fallback para copiar sin Clipboard API
 * Funciona en HTTP y navegadores antiguos
 */
function copyTextFallback(text) {
  // Crear elemento temporal
  const textArea = document.createElement('textarea')
  
  // Configurar para ser invisible pero funcional
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  textArea.style.opacity = '0'
  textArea.style.pointerEvents = 'none'
  
  // Importante para iOS
  textArea.contentEditable = true
  textArea.readOnly = false
  
  document.body.appendChild(textArea)
  
  try {
    // Para iOS Safari
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      return copyForIOS(textArea)
    }
    
    // Para Android y otros
    textArea.focus()
    textArea.select()
    
    // Intentar copiar
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch (err) {
    console.error('Error en fallback:', err)
    document.body.removeChild(textArea)
    return false
  }
}

/**
 * Método específico para iOS
 * iOS Safari tiene restricciones especiales
 */
function copyForIOS(textArea) {
  try {
    const range = document.createRange()
    range.selectNodeContents(textArea)
    
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    
    textArea.setSelectionRange(0, 999999)
    
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch (err) {
    console.error('Error en iOS copy:', err)
    document.body.removeChild(textArea)
    return false
  }
}

/**
 * Detectar si estamos en un dispositivo móvil
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Detectar si estamos en iOS
 */
export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

/**
 * Verificar si Clipboard API está disponible
 */
export function isClipboardAPIAvailable() {
  return !!(navigator.clipboard && window.isSecureContext)
}

/**
 * Copiar texto con feedback visual
 * Retorna un mensaje de éxito/error
 */
export async function copyWithFeedback(text) {
  const success = await copyToClipboard(text)
  
  return {
    success,
    message: success 
      ? '✅ Copiado al portapapeles'
      : '❌ No se pudo copiar. Intenta copiar manualmente.'
  }
}