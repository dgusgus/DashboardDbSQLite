// src/composables/useShare.js
// Web Share API (menú nativo del celular) con fallback a portapapeles

export function useShare() {

  // Toast minimalista sin dependencias
  function toast(msg, ok = true) {
    const el = document.createElement('div')
    el.textContent = msg
    el.style.cssText = `
      position:fixed; bottom:88px; left:50%; transform:translateX(-50%);
      background:${ok ? '#38d9a9' : '#fc6b6b'}; color:#0f1117;
      font-size:.82rem; font-weight:700; padding:8px 18px;
      border-radius:20px; z-index:999; white-space:nowrap;
      box-shadow:0 4px 16px rgba(0,0,0,.3);
      animation: fadeInUp .2s ease;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2200)
  }

  async function share(text, title = 'Datos') {
    // Intento 1: Web Share API — abre el menú nativo del celular
    if (navigator.share) {
      try {
        await navigator.share({ title, text })
        return
      } catch (e) {
        // El usuario canceló el menú — no mostrar error
        if (e.name === 'AbortError') return
      }
    }

    // Intento 2: Clipboard API moderna
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        toast('✓ Copiado al portapapeles')
        return
      } catch {}
    }

    // Intento 3: Fallback para HTTP / navegadores viejos
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.focus(); ta.select()
    try {
      document.execCommand('copy')
      toast('✓ Copiado al portapapeles')
    } catch {
      toast('No se pudo copiar', false)
    }
    document.body.removeChild(ta)
  }

  // ── Formateadores por tipo ──────────────────────────────────────────

  /**
   * @param {object} op       - Datos del operador
   * @param {Array}  actas    - Actas asignadas al operador
   * @param {Array}  notarios - Notarios del mismo recinto (puede estar vacío)
   */
  function formatOperador(op, actas = [], notarios = []) {
    const lines = [
      `👷 OPERADOR ELECTORAL`,
      `${'─'.repeat(28)}`,
      `Nombre:       ${op.nombre}`,
      `CI:           ${op.cedula}${op.expedido ? ' ' + op.expedido : ''}`,
      `Teléfono:     ${op.telefono || '—'}`,
      op.correo ? `Correo:       ${op.correo}` : null,
      `Tipo:         ${op.tipo_operador}`,
      `Cargo:        ${op.cargo || '—'}`,
      ``,
      `🏢 ORGANIZACIÓN`,
      `Grupo:        ${op.grupo || '—'}`,
      `Coordinador:  ${op.coordinador || '—'}`,
      op.coordinador_telefono ? `Tel. coord.:  ${op.coordinador_telefono}` : null,
      `Jefe:         ${op.jefe || '—'}`,
      ``,
      `📍 UBICACIÓN`,
      `Recinto:      ${op.recinto || '—'}`,
      op.recinto_direccion ? `Dirección:    ${op.recinto_direccion}` : null,
      `Asiento:      ${op.asiento_electoral || '—'}`,
      `Municipio:    ${op.municipio}`,
      `Provincia:    ${op.provincia}`,
      `Departamento: ${op.departamento}`,
    ]

    // Notarios del mismo recinto
    if (notarios.length > 0) {
      lines.push(``, `📝 NOTARIO(S) EN ESTE RECINTO (${notarios.length})`)
      notarios.forEach((n, i) => {
        if (notarios.length > 1) lines.push(`  · Notario ${i + 1}`)
        lines.push(`Nombre:       ${n.nombre}`)
        lines.push(`CI:           ${n.ci}${n.expedido ? ' ' + n.expedido : ''}`)
        if (n.celular) lines.push(`Teléfono:     ${n.celular}`)
        if (n.cargo)   lines.push(`Cargo:        ${n.cargo}`)
      })
    }

    // Actas asignadas al operador
    if (actas.length > 0) {
      lines.push(``, `📋 ACTAS ASIGNADAS (${actas.length})`)
      lines.push(actas.map(a => a.codigo).join('  ·  '))
    }

    return lines.filter(l => l !== null).join('\n')
  }

  function formatNotario(n) {
    return [
      `📝 NOTARIO ELECTORAL`,
      `${'─'.repeat(28)}`,
      `Nombre:       ${n.nombre}`,
      `CI:           ${n.cedula}${n.expedido ? ' ' + n.expedido : ''}`,
      `Teléfono:     ${n.telefono || '—'}`,
      n.correo ? `Correo:       ${n.correo}` : null,
      `Tipo:         ${n.tipo_notario}`,
      `Cargo:        ${n.cargo || '—'}`,
      ``,
      `📍 UBICACIÓN`,
      `Recinto:      ${n.recinto || '—'}`,
      n.recinto_direccion ? `Dirección:    ${n.recinto_direccion}` : null,
      `Asiento:      ${n.asiento_electoral || '—'}`,
      `Municipio:    ${n.municipio}`,
      `Provincia:    ${n.provincia}`,
      `Departamento: ${n.departamento}`,
      `Actas recinto: ${n.actas_en_recinto ?? '—'}`,
    ].filter(l => l !== null).join('\n')
  }

  function formatRecinto(r) {
    return [
      `🏫 RECINTO ELECTORAL`,
      `${'─'.repeat(28)}`,
      `Nombre:       ${r.nombre}`,
      r.direccion ? `Dirección:    ${r.direccion}` : null,
      `Tipo:         ${r.tipo}`,
      ``,
      `📍 UBICACIÓN`,
      `Asiento:      ${r.asiento_electoral || '—'}`,
      `Municipio:    ${r.municipio}`,
      `Provincia:    ${r.provincia}`,
      `Departamento: ${r.departamento}`,
      ``,
      `📊 COBERTURA`,
      `Operadores:   ${r.operadores_asignados}`,
      `Notarios:     ${r.notarios_asignados}`,
      `Actas:        ${r.actas_registradas}`,
    ].filter(l => l !== null).join('\n')
  }

  function formatActa(a) {
    return [
      `📋 ACTA ELECTORAL`,
      `${'─'.repeat(28)}`,
      `Código:       ${a.codigo}`,
      `Tipo zona:    ${a.tipo_zona || '—'}`,
      ``,
      `👷 OPERADOR`,
      `Nombre:       ${a.operador || '—'}`,
      `CI:           ${a.operador_ci || '—'}`,
      a.operador_celular ? `Teléfono:     ${a.operador_celular}` : null,
      `Grupo:        ${a.grupo || '—'}`,
      `Coordinador:  ${a.coordinador || '—'}`,
      ``,
      `📍 UBICACIÓN`,
      `Recinto:      ${a.recinto || '—'}`,
      a.recinto_direccion ? `Dirección:    ${a.recinto_direccion}` : null,
      `Asiento:      ${a.asiento_electoral || '—'}`,
      `Municipio:    ${a.municipio}`,
      `Provincia:    ${a.provincia}`,
      `Departamento: ${a.departamento}`,
    ].filter(l => l !== null).join('\n')
  }

  return { share, formatOperador, formatNotario, formatRecinto, formatActa }
}