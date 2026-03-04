// scripts/network-info.js
// Script para mostrar información de red
import { networkInterfaces } from 'os'

function getLocalIPs() {
  const nets = networkInterfaces()
  const results = []

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Omitir direcciones internas y no IPv4
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        results.push({
          interface: name,
          ip: net.address
        })
      }
    }
  }

  return results
}

console.log('\n🌐 ===== INFORMACIÓN DE RED =====\n')

const ips = getLocalIPs()

if (ips.length === 0) {
  console.log('❌ No se encontraron interfaces de red activas')
  console.log('   Verifica que estés conectado a una red\n')
} else {
  console.log('📱 Comparte estas URLs con dispositivos en tu red:\n')
  
  ips.forEach(({ interface: iface, ip }) => {
    console.log(`   ${iface}:`)
    console.log(`   → http://${ip}:5173`)
    console.log(`   → http://${ip}:5173/operadores`)
    console.log('')
  })

  console.log('💡 Tips:')
  console.log('   • Asegúrate de que el firewall permita conexiones')
  console.log('   • Usa la IP que corresponda a tu red WiFi/Ethernet')
  console.log('   • Los dispositivos deben estar en la MISMA red')
  console.log('')
}

console.log('🚀 Comandos útiles:')
console.log('   npm run dev:network    → Iniciar con red habilitada')
console.log('   npm run network-info   → Mostrar esta información')
console.log('\n================================\n')