// src/utils/queries.js - ADAPTADO: sin campo 'tipo' en operador/notario
export const queries = {
  // === ESTADÍSTICAS GENERALES ===
  getGeneralStats: () => `
    SELECT 
      (SELECT COUNT(*) FROM operador) as total_operadores,
      (SELECT COUNT(*) FROM operador o 
       JOIN recinto r ON o.recinto_id = r.id 
       WHERE r.distrito = 0) as operadores_rurales,
      (SELECT COUNT(*) FROM operador o 
       JOIN recinto r ON o.recinto_id = r.id 
       WHERE r.distrito > 0) as operadores_urbanos,
      (SELECT COUNT(*) FROM recinto) as total_recintos,
      (SELECT COUNT(*) FROM recinto WHERE distrito = 0) as recintos_rurales,
      (SELECT COUNT(*) FROM recinto WHERE distrito > 0) as recintos_urbanos,
      (SELECT COUNT(*) FROM coordinador) as total_coordinadores,
      (SELECT COUNT(*) FROM grupo) as total_grupos,
      (SELECT COUNT(*) FROM notario) as total_notarios,
      (SELECT COUNT(*) FROM acta) as total_actas,
      (SELECT COUNT(*) FROM jefe) as total_jefes,
      (SELECT COUNT(*) FROM cuenta) as total_cuentas
  `,

  // === OPERADORES (tipo inferido desde recinto.distrito) ===
  getAllOperadores: () => `
    SELECT 
      o.id,
      o.nombre,
      o.ci as cedula,
      o.expedido,
      o.celular as telefono,
      o.correo,
      o.cargo,
      CASE 
        WHEN r.distrito = 0 THEN 'rural'
        ELSE 'urbano'
      END as tipo_operador,
      g.nombre as grupo,
      r.nombre as recinto,
      r.distrito,
      ae.nombre as asiento_electoral,
      m.nombre as municipio,
      p.nombre as provincia,
      p.es_urbano as provincia_urbana,
      d.nombre as departamento,
      c.nombre as coordinador,
      c.celular as coordinador_telefono,
      j.nombre as jefe,
      j.celular as jefe_telefono,
      r.id as recinto_id,
      (SELECT COUNT(*) FROM acta WHERE recinto_id = r.id) as actas_en_recinto
    FROM operador o
    LEFT JOIN grupo g ON o.grupo_id = g.id
    LEFT JOIN recinto r ON o.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    LEFT JOIN coordinador c ON g.coordinador_id = c.id
    LEFT JOIN jefe j ON c.jefe_id = j.id
    ORDER BY o.nombre
  `,

  searchOperadores: (searchTerm) => `
    SELECT 
      o.id,
      o.nombre,
      o.ci as cedula,
      o.celular as telefono,
      CASE 
        WHEN r.distrito = 0 THEN 'rural'
        ELSE 'urbano'
      END as tipo_operador,
      g.nombre as grupo,
      r.nombre as recinto,
      c.nombre as coordinador
    FROM operador o
    LEFT JOIN grupo g ON o.grupo_id = g.id
    LEFT JOIN recinto r ON o.recinto_id = r.id
    LEFT JOIN coordinador c ON g.coordinador_id = c.id
    WHERE 
      o.nombre LIKE '%${searchTerm}%' OR
      o.ci LIKE '%${searchTerm}%' OR
      g.nombre LIKE '%${searchTerm}%' OR
      r.nombre LIKE '%${searchTerm}%' OR
      c.nombre LIKE '%${searchTerm}%'
    ORDER BY o.nombre
    LIMIT 100
  `,

  // === RECINTOS ===
  getAllRecintos: () => `
    SELECT 
      r.id,
      r.nombre,
      r.direccion,
      CASE 
        WHEN r.distrito = 0 THEN 'rural'
        ELSE 'urbano'
      END as tipo,
      r.distrito,
      ae.nombre as asiento_electoral,
      m.nombre as municipio,
      p.nombre as provincia,
      p.es_urbano as provincia_urbana,
      d.nombre as departamento,
      COUNT(DISTINCT o.id) as operadores_asignados,
      COUNT(DISTINCT n.id) as notarios_asignados,
      COUNT(DISTINCT a.id) as actas_registradas
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN notario n ON r.id = n.recinto_id
    LEFT JOIN acta a ON r.id = a.recinto_id
    GROUP BY r.id
    ORDER BY d.nombre, p.nombre, m.nombre, r.nombre
  `,

  // === NOTARIOS (tipo inferido desde recinto.distrito) ===
  getAllNotarios: () => `
    SELECT 
      n.id,
      n.nombre,
      n.ci as cedula,
      n.expedido,
      n.celular as telefono,
      n.correo,
      n.cargo,
      CASE 
        WHEN r.distrito = 0 THEN 'rural'
        ELSE 'urbano'
      END as tipo_notario,
      r.nombre as recinto,
      ae.nombre as asiento_electoral,
      m.nombre as municipio,
      p.nombre as provincia,
      d.nombre as departamento,
      (SELECT COUNT(*) FROM acta WHERE recinto_id = r.id) as actas_en_recinto
    FROM notario n
    LEFT JOIN recinto r ON n.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    ORDER BY n.nombre
  `,

  // === ACTAS ===
  getAllActas: () => `
    SELECT 
      a.id,
      a.codigo,
      r.nombre as recinto,
      r.distrito,
      ae.nombre as asiento_electoral,
      m.nombre as municipio,
      p.nombre as provincia,
      d.nombre as departamento,
      GROUP_CONCAT(DISTINCT o.nombre) as operadores,
      GROUP_CONCAT(DISTINCT n.nombre) as notarios
    FROM acta a
    LEFT JOIN recinto r ON a.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN notario n ON r.id = n.recinto_id
    GROUP BY a.id
    ORDER BY a.codigo
  `,

  // === REPORTE: Actas por Recinto ===
  getActasPorRecinto: () => `
    SELECT 
      r.nombre as recinto,
      r.direccion,
      CASE 
        WHEN r.distrito = 0 THEN 'Rural'
        ELSE 'Urbano Distrito ' || r.distrito
      END as tipo,
      m.nombre as municipio,
      p.nombre as provincia,
      d.nombre as departamento,
      COUNT(a.id) as total_actas,
      GROUP_CONCAT(DISTINCT o.nombre, ', ') as operadores,
      GROUP_CONCAT(DISTINCT n.nombre, ', ') as notarios
    FROM recinto r
    LEFT JOIN acta a ON r.id = a.recinto_id
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN notario n ON r.id = n.recinto_id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    GROUP BY r.id
    HAVING total_actas > 0
    ORDER BY d.nombre, p.nombre, total_actas DESC
  `,

  // === COORDINADORES Y JEFES ===
  getJerarquiaCompleta: () => `
    SELECT 
      j.nombre as jefe,
      j.cargo as cargo_jefe,
      j.celular as jefe_telefono,
      c.nombre as coordinador,
      c.ci as cedula_coordinador,
      c.celular as coordinador_telefono,
      g.nombre as grupo,
      COUNT(o.id) as total_operadores,
      COUNT(CASE WHEN r.distrito = 0 THEN 1 END) as operadores_rurales,
      COUNT(CASE WHEN r.distrito > 0 THEN 1 END) as operadores_urbanos
    FROM jefe j
    LEFT JOIN coordinador c ON j.id = c.jefe_id
    LEFT JOIN grupo g ON c.id = g.coordinador_id
    LEFT JOIN operador o ON g.id = o.grupo_id
    LEFT JOIN recinto r ON o.recinto_id = r.id
    GROUP BY j.id, j.nombre, j.cargo, j.celular, c.nombre, c.ci, c.celular, g.nombre
    ORDER BY j.nombre, c.nombre
  `,

  // === REPORTES GEOGRÁFICOS ===
  getOperadoresPorDepartamento: () => `
    SELECT 
      d.nombre as departamento,
      p.nombre as provincia,
      p.es_urbano as provincia_urbana,
      m.nombre as municipio,
      COUNT(DISTINCT o.id) as total_operadores,
      COUNT(CASE WHEN r.distrito = 0 THEN 1 END) as rurales,
      COUNT(CASE WHEN r.distrito > 0 THEN 1 END) as urbanos,
      COUNT(DISTINCT r.id) as recintos,
      COUNT(DISTINCT a.id) as actas_registradas
    FROM departamento d
    LEFT JOIN provincia p ON d.id = p.departamento_id
    LEFT JOIN municipio m ON p.id = m.provincia_id
    LEFT JOIN asiento_electoral ae ON m.id = ae.municipio_id
    LEFT JOIN recinto r ON ae.id = r.asiento_id
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN acta a ON r.id = a.recinto_id
    GROUP BY d.id, d.nombre, p.nombre, p.es_urbano, m.nombre
    HAVING total_operadores > 0
    ORDER BY d.nombre, p.nombre, m.nombre
  `,

  // === BÚSQUEDA GLOBAL ===
  searchGlobal: (searchTerm) => `
    SELECT 'operador' as tipo, o.id, o.nombre as titulo, o.ci as subtitulo,
           COALESCE(g.nombre, 'Sin grupo') || ' | ' || COALESCE(r.nombre, 'Sin recinto') as descripcion
    FROM operador o
    LEFT JOIN grupo g ON o.grupo_id = g.id
    LEFT JOIN recinto r ON o.recinto_id = r.id
    WHERE o.nombre LIKE '%${searchTerm}%' OR o.ci LIKE '%${searchTerm}%'
    
    UNION ALL
    
    SELECT 'notario' as tipo, n.id, n.nombre as titulo, n.ci as subtitulo,
           COALESCE(r.nombre, 'Sin recinto') as descripcion
    FROM notario n
    LEFT JOIN recinto r ON n.recinto_id = r.id
    WHERE n.nombre LIKE '%${searchTerm}%' OR n.ci LIKE '%${searchTerm}%'
    
    UNION ALL
    
    SELECT 'recinto' as tipo, r.id, r.nombre as titulo, r.direccion as subtitulo,
           COALESCE(ae.nombre, 'Sin asiento') as descripcion
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    WHERE r.nombre LIKE '%${searchTerm}%' OR r.direccion LIKE '%${searchTerm}%'
    
    UNION ALL
    
    SELECT 'acta' as tipo, a.id, a.codigo as titulo, r.nombre as subtitulo,
           COALESCE(m.nombre, 'Sin municipio') as descripcion
    FROM acta a
    LEFT JOIN recinto r ON a.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    WHERE a.codigo LIKE '%${searchTerm}%'
    
    LIMIT 20
  `,

  // === VALIDACIÓN DE COBERTURA ===
  getRecintosIncompletos: () => `
    SELECT 
      r.nombre as recinto,
      m.nombre as municipio,
      COUNT(DISTINCT o.id) as operadores,
      COUNT(DISTINCT n.id) as notarios,
      COUNT(DISTINCT a.id) as actas,
      CASE 
        WHEN COUNT(DISTINCT o.id) = 0 THEN '❌ Sin operadores'
        WHEN COUNT(DISTINCT n.id) = 0 THEN '⚠️ Sin notarios'
        WHEN COUNT(DISTINCT a.id) = 0 THEN '📝 Sin actas'
        ELSE '✅ Completo'
      END as estado
    FROM recinto r
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN notario n ON r.id = n.recinto_id
    LEFT JOIN acta a ON r.id = a.recinto_id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    GROUP BY r.id
    HAVING operadores = 0 OR notarios = 0 OR actas = 0
    ORDER BY operadores ASC, notarios ASC, actas ASC
  `,

  // === NUEVO: Obtener lista de provincias únicas ===
  getProvincias: () => `
    SELECT DISTINCT nombre, es_urbano 
    FROM provincia 
    ORDER BY nombre
  `,

  // === NUEVO: Obtener lista de municipios únicos ===
  getMunicipios: () => `
    SELECT DISTINCT m.nombre, p.nombre as provincia
    FROM municipio m
    LEFT JOIN provincia p ON m.provincia_id = p.id
    ORDER BY m.nombre
  `,

  // === NUEVO: Obtener lista de asientos electorales ===
  getAsientosElectorales: () => `
    SELECT DISTINCT ae.nombre, m.nombre as municipio
    FROM asiento_electoral ae
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    ORDER BY ae.nombre
  `
}