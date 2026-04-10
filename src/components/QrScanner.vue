<!-- src/components/QrScanner.vue -->
<template>
  <!-- Overlay de pantalla completa -->
  <Teleport to="body">
    <div class="qr-overlay" @click.self="close">

      <!-- Cabecera -->
      <div class="qr-header">
        <span class="qr-title">📷 Escanear QR de Acta</span>
        <button class="qr-close" @click="close">✕</button>
      </div>

      <!-- Área de cámara -->
      <div class="qr-viewport">
        <video ref="videoEl" class="qr-video" autoplay playsinline muted></video>

        <!-- Marco animado de escaneo -->
        <div class="qr-frame">
          <div class="qr-corner qr-tl"></div>
          <div class="qr-corner qr-tr"></div>
          <div class="qr-corner qr-bl"></div>
          <div class="qr-corner qr-br"></div>
          <div class="qr-scan-line"></div>
        </div>

        <!-- Estado: buscando dispositivo -->
        <div v-if="state === 'loading'" class="qr-status">
          <div class="qr-dots">
            <span class="qr-dot"></span>
            <span class="qr-dot"></span>
            <span class="qr-dot"></span>
          </div>
          <p>Iniciando cámara…</p>
        </div>

        <!-- Estado: error -->
        <div v-if="state === 'error'" class="qr-status qr-status-error">
          <div style="font-size:2.2rem">📵</div>
          <p>{{ errorMsg }}</p>
          <button class="qr-retry-btn" @click="startCamera">Reintentar</button>
        </div>

        <!-- Estado: resultado -->
        <div v-if="state === 'found'" class="qr-status qr-status-ok">
          <div style="font-size:2rem">✅</div>
          <p class="qr-code-found">{{ foundCode }}</p>
          <p style="font-size:0.75rem;opacity:.7">Código de acta detectado</p>
        </div>
      </div>

      <!-- Selección de cámara si hay varias -->
      <div v-if="cameras.length > 1" class="qr-cam-row">
        <select v-model="selectedCamId" class="qr-cam-select" @change="switchCamera">
          <option v-for="c in cameras" :key="c.deviceId" :value="c.deviceId">
            {{ c.label || 'Cámara ' + (cameras.indexOf(c) + 1) }}
          </option>
        </select>
      </div>

      <!-- Ayuda -->
      <p class="qr-hint">
        Apunta la cámara al código QR del acta.<br>
        Se leerá automáticamente el código de acta.
      </p>

    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['detected', 'close'])

// ── estado ──────────────────────────────────────────────────────────────────
const videoEl       = ref(null)
const state         = ref('loading')   // 'loading' | 'scanning' | 'error' | 'found'
const errorMsg      = ref('')
const foundCode     = ref('')
const cameras       = ref([])
const selectedCamId = ref(null)

let stream        = null
let rafId         = null     // requestAnimationFrame loop (BarcodeDetector)
let zxingControls = null     // controles de ZXing (fallback)
let nativeDetector = null    // instancia de BarcodeDetector

// ── helpers ──────────────────────────────────────────────────────────────────
function extractActaCode(raw) {
  const parts = raw.split('|')
  return parts.length >= 2 ? parts[1].trim() : raw.trim()
}

// ── detección ─────────────────────────────────────────────────────────────────
function onDetected(raw) {
  if (state.value === 'found') return
  const code = extractActaCode(raw)
  foundCode.value = code
  state.value = 'found'
  if (navigator.vibrate) navigator.vibrate(120)
  setTimeout(() => { emit('detected', code); close() }, 900)
}

// ── BarcodeDetector (nativo — ruta rápida) ────────────────────────────────────
function startNativeLoop() {
  nativeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'data_matrix'] })

  const scan = async () => {
    if (state.value === 'found') return
    try {
      const results = await nativeDetector.detect(videoEl.value)
      if (results.length > 0) {
        onDetected(results[0].rawValue)
        return
      }
    } catch (_) { /* frame sin QR — ignorar */ }
    rafId = requestAnimationFrame(scan)
  }

  rafId = requestAnimationFrame(scan)
}

// ── ZXing (fallback para navegadores sin BarcodeDetector) ─────────────────────
async function startZxing() {
  // Importación dinámica — el bundle solo se descarga si se necesita
  const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
    import('@zxing/browser'),
    import('@zxing/library'),
  ])

  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX])
  hints.set(DecodeHintType.TRY_HARDER, true)

  const reader = new BrowserMultiFormatReader(hints)
  zxingControls = await reader.decodeFromVideoDevice(
    selectedCamId.value,
    videoEl.value,
    (result, err) => { if (result) onDetected(result.getText()) }
  )
}

// ── cámara ───────────────────────────────────────────────────────────────────
async function startCamera() {
  state.value = 'loading'
  stopCamera()

  try {
    // Obtener lista de cámaras
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(d => d.kind === 'videoinput')
    cameras.value = videoDevices

    if (!selectedCamId.value) {
      const back = videoDevices.find(d => /back|rear|environment/i.test(d.label))
      selectedCamId.value = back?.deviceId ?? videoDevices[0]?.deviceId
    }

    // Solicitar stream de cámara
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: selectedCamId.value ? { exact: selectedCamId.value } : undefined,
        facingMode: selectedCamId.value ? undefined : { ideal: 'environment' },
        width:  { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })

    videoEl.value.srcObject = stream
    await videoEl.value.play()

    state.value = 'scanning'

    // Elegir motor de detección
    if ('BarcodeDetector' in window) {
      startNativeLoop()
    } else {
      await startZxing()
    }
  } catch (e) {
    state.value = 'error'
    errorMsg.value = e?.name === 'NotAllowedError'
      ? 'Permiso de cámara denegado. Actívalo en la configuración del navegador.'
      : (e?.message ?? 'Error al acceder a la cámara')
  }
}

function stopCamera() {
  // Detener loop nativo
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }
  // Detener ZXing
  try { zxingControls?.stop() } catch (_) {}
  zxingControls = null
  // Detener stream
  stream?.getTracks().forEach(t => t.stop())
  stream = null
}

async function switchCamera() { await startCamera() }

function close() { stopCamera(); emit('close') }

onMounted(() => startCamera())
onUnmounted(() => stopCamera())
</script>


<style scoped>
/* ── Overlay ──────────────────────────────────────────────────────────── */
.qr-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: qrFadeIn 0.22s ease;
}

@keyframes qrFadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}

/* ── Cabecera ─────────────────────────────────────────────────────────── */
.qr-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  padding-top: calc(14px + env(safe-area-inset-top));
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}

.qr-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}

.qr-close {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  border: none;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  -webkit-tap-highlight-color: transparent;
}

/* ── Viewport ─────────────────────────────────────────────────────────── */
.qr-viewport {
  flex: 1;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Marco de escaneo ─────────────────────────────────────────────────── */
.qr-frame {
  position: absolute;
  width: min(70vw, 260px);
  height: min(70vw, 260px);
  pointer-events: none;
}

.qr-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #4f8ef7;
  border-style: solid;
}

.qr-tl { top:0; left:0;  border-width: 3px 0 0 3px; border-radius: 6px 0 0 0; }
.qr-tr { top:0; right:0; border-width: 3px 3px 0 0; border-radius: 0 6px 0 0; }
.qr-bl { bottom:0; left:0;  border-width: 0 0 3px 3px; border-radius: 0 0 0 6px; }
.qr-br { bottom:0; right:0; border-width: 0 3px 3px 0; border-radius: 0 0 6px 0; }

/* Línea de escaneo animada */
.qr-scan-line {
  position: absolute;
  left: 8px; right: 8px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
  box-shadow: 0 0 8px #4f8ef7;
  animation: qrScanMove 2s ease-in-out infinite;
  top: 0;
}

@keyframes qrScanMove {
  0%   { top: 8px;    opacity: 1 }
  50%  { opacity: 0.8 }
  100% { top: calc(100% - 10px); opacity: 1 }
}

/* ── Estado superpuesto ───────────────────────────────────────────────── */
.qr-status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  padding: 24px;
}

.qr-status-ok {
  background: rgba(0,0,0,0.65);
}

.qr-status-error {
  background: rgba(0,0,0,0.7);
}

.qr-code-found {
  font-size: 1.5rem;
  font-weight: 900;
  color: #4f8ef7;
  letter-spacing: 0.04em;
  font-family: monospace;
}

/* Puntos de carga */
.qr-dots { display: flex; gap: 7px; }
.qr-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: #4f8ef7;
  animation: qrDotPulse 1.1s ease-in-out infinite;
}
.qr-dot:nth-child(2) { animation-delay: 0.18s; }
.qr-dot:nth-child(3) { animation-delay: 0.36s; }

@keyframes qrDotPulse {
  0%,100% { opacity:0.25; transform:scale(0.7) }
  50%     { opacity:1;    transform:scale(1)   }
}

.qr-retry-btn {
  margin-top: 4px;
  padding: 9px 22px;
  background: #4f8ef7;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* ── Selector de cámara ──────────────────────────────────────────────── */
.qr-cam-row {
  width: 100%;
  padding: 10px 16px 4px;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
}

.qr-cam-select {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 0.78rem;
  padding: 6px 10px;
  outline: none;
  -webkit-appearance: none;
}

/* ── Ayuda ────────────────────────────────────────────────────────────── */
.qr-hint {
  padding: 12px 20px 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  color: rgba(255,255,255,0.6);
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: center;
  width: 100%;
  flex-shrink: 0;
}
</style>
