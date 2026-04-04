// src/composables/useBiometric.js
// WebAuthn local: huella/face ID sin servidor.

const CRED_KEY    = 'biometric-credential-id'
const USER_ID_KEY = 'biometric-user-id'
const SESSION_KEY = 'coord-session'

function strToUint8(str) { return new TextEncoder().encode(str) }
function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')
}
function base64ToBuf(b64) {
  const std = b64.replace(/-/g,'+').replace(/_/g,'/')
  return Uint8Array.from(atob(std), c => c.charCodeAt(0))
}
function randomChallenge() {
  const buf = new Uint8Array(32); crypto.getRandomValues(buf); return buf
}

export function useBiometric() {

  async function isSupported() {
    if (!window.PublicKeyCredential) return false
    try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable() }
    catch { return false }
  }

  function hasCredential() { return !!localStorage.getItem(CRED_KEY) }

  async function register(user) {
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: randomChallenge(),
          rp: { name: 'Dgus Electoral' },
          user: {
            id:          strToUint8(String(user.id ?? user.ci)),
            name:        user.ci,
            displayName: user.nombre,
          },
          pubKeyCredParams: [
            { alg: -7,   type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification:        'required',
            requireResidentKey:      false,
          },
          timeout: 60000,
          excludeCredentials: hasCredential()
            ? [{ id: base64ToBuf(localStorage.getItem(CRED_KEY)), type: 'public-key' }]
            : [],
        }
      })
      if (!cred) return false
      localStorage.setItem(CRED_KEY,    bufToBase64(cred.rawId))
      localStorage.setItem(USER_ID_KEY, String(user.id))
      return true
    } catch (err) {
      if (err.name === 'NotAllowedError') return false
      throw err
    }
  }

  async function authenticate() {
    if (!hasCredential()) return null
    try {
      const credId    = localStorage.getItem(CRED_KEY)
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: randomChallenge(),
          userVerification: 'required',
          allowCredentials: [{ id: base64ToBuf(credId), type: 'public-key', transports: ['internal'] }],
          timeout: 60000,
        }
      })
      if (!assertion) return null
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) return JSON.parse(raw)
      return { _needsReload: true, userId: localStorage.getItem(USER_ID_KEY) }
    } catch (err) {
      if (err.name === 'NotAllowedError') return null
      throw err
    }
  }

  function clearCredential() {
    localStorage.removeItem(CRED_KEY)
    localStorage.removeItem(USER_ID_KEY)
  }

  return { isSupported, hasCredential, register, authenticate, clearCredential }
}