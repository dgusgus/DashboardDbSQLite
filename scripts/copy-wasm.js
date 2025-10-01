/* scripts/copy-wasm.js */
import fs from 'fs'
import path from 'path'

const wasmFiles = [
  'sql-wasm.wasm',
  'sql-wasm.js'
]

console.log('📦 Copiando archivos WASM...')

wasmFiles.forEach(file => {
  const src = `node_modules/sql.js/dist/${file}`
  const dest = `public/${file}`
  
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(`✅ Copiado: ${file}`)
    } else {
      console.log(`⚠️  No encontrado: ${src}`)
    }
  } catch (error) {
    console.error(`❌ Error copiando ${file}:`, error.message)
  }
})