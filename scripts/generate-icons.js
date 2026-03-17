// scripts/generate-icons.js
// Ejecutar UNA VEZ para generar los íconos de la PWA
// node scripts/generate-icons.js

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const dir = join(process.cwd(), 'public', 'icons')
mkdirSync(dir, { recursive: true })

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Fondo oscuro con borde redondeado
  const radius = size * 0.22
  ctx.fillStyle = '#1a1d27'
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fill()

  // Emoji 📋 centrado
  ctx.font = `${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('📋', size / 2, size / 2 + size * 0.03)

  return canvas.toBuffer('image/png')
}

writeFileSync(join(dir, 'icon-192.png'), generateIcon(192))
writeFileSync(join(dir, 'icon-512.png'), generateIcon(512))

console.log('✅ Íconos generados en public/icons/')
console.log('   icon-192.png')
console.log('   icon-512.png')