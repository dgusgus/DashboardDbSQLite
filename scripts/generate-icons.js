// scripts/generate-icons.js
// Requiere: @resvg/resvg-js (instalar con: pnpm add -D @resvg/resvg-js)
// Ejecutar: node scripts/generate-icons.js

import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const dir = join(process.cwd(), 'public', 'icons')
mkdirSync(dir, { recursive: true })

function makeSVG(size) {
  const r     = Math.round(size * 0.22)
  const pad   = Math.round(size * 0.15)
  const iSize = size - pad * 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#1a1d27"/>
  <rect x="${pad}" y="${Math.round(pad*0.9)}" width="${iSize}" height="${iSize}" rx="${Math.round(r*0.6)}" fill="#22263a" stroke="#4f8ef7" stroke-width="${Math.round(size*0.018)}"/>
  <line x1="${Math.round(size*0.30)}" y1="${Math.round(size*0.38)}" x2="${Math.round(size*0.70)}" y2="${Math.round(size*0.38)}" stroke="#4f8ef7" stroke-width="${Math.round(size*0.04)}" stroke-linecap="round"/>
  <line x1="${Math.round(size*0.30)}" y1="${Math.round(size*0.50)}" x2="${Math.round(size*0.70)}" y2="${Math.round(size*0.50)}" stroke="#8b90a7" stroke-width="${Math.round(size*0.03)}" stroke-linecap="round"/>
  <line x1="${Math.round(size*0.30)}" y1="${Math.round(size*0.62)}" x2="${Math.round(size*0.55)}" y2="${Math.round(size*0.62)}" stroke="#8b90a7" stroke-width="${Math.round(size*0.03)}" stroke-linecap="round"/>
</svg>`
}

function genIcon(size, filename) {
  const svg   = makeSVG(size)
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } })
  const png   = resvg.render().asPng()
  writeFileSync(join(dir, filename), png)
  console.log(`✅ ${filename}  (${size}x${size}px)`)
}

console.log('🎨 Generando íconos PWA...\n')
genIcon(192, 'icon-192.png')
genIcon(512, 'icon-512.png')
console.log('\n✅ Listo — archivos guardados en public/icons/')