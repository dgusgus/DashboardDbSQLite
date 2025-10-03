// src/utils/queries.js - CORREGIDO (sin vehículos)
export const queries = {
  // === ESTADÍSTICAS GENERALES ===
  getGeneralStats: () => `
    SELECT 
      (SELECT COUNT(*) FROM operador) as total_operadores,
      (SELECT COUNT(*) FROM operador WHERE tipo = 'rural') as operadores_rurales,
      (SELECT COUNT(*) FROM operador WHERE tipo = 'urbano') as operadores_urbanos,
      (SELECT COUNT(*) FROM recinto) as total_recintos,
      (SELECT COUNT(*) FROM recinto WHERE distrito = 0) as recintos_rurales,
      (SELECT COUNT(*) FROM recinto WHERE distrito > 0) as recintos_urbanos,
      (SELECT COUNT(*) FROM coordinador) as total_coordinadores,
      (SELECT COUNT(*) FROM grupo) as total_grupos,
      (SELECT COUNT(*) FROM notario) as total_notarios,
      (SELECT COUNT(*) FROM mesa) as total_mesas,
      (SELECT COUNT(*) FROM acta) as total_actas,
      (SELECT COUNT(*) FROM jefe) as total_jefes,
      (SELECT COUNT(*) FROM cuenta) as total_cuentas
  `,

  // === OPERADORES (SIN vehículos) ===
  getAllOperadores: () => `
    SELECT 
      o.id,
      o.nombre,
      o.ci as cedula,
      o.expedido,
      o.celular as telefono,
      o.correo,
      o.cargo,
      o.tipo as tipo_operador,
      g.nombre as grupo,
      r.nombre as recinto,
      ae.nombre as asiento_electoral,
      m.nombre as municipio,
      p.nombre as provincia,
      d.nombre as departamento,
      c.nombre as coordinador,
      j.nombre as jefe
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
      o.tipo as tipo_operador,
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
      d.nombre as departamento,
      COUNT(DISTINCT o.id) as operadores_asignados,
      COUNT(DISTINCT n.id) as notarios_asignados,
      COUNT(DISTINCT me.id) as mesas_asignadas
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN notario n ON r.id = n.recinto_id
    LEFT JOIN mesa me ON r.id = me.recinto_id
    GROUP BY r.id
    ORDER BY d.nombre, p.nombre, m.nombre, r.nombre
  `,

  // === NOTARIOS (NUEVO) ===
  getAllNotarios: () => `
    SELECT 
      n.id,
      n.nombre,
      n.ci as cedula,
      n.expedido,
      n.celular as telefono,
      n.correo,
      n.cargo,
      n.tipo as tipo_notario,
      r.nombre as recinto,
      ae.nombre as asiento_electoral,
      m.nombre as municipio,
      p.nombre as provincia,
      d.nombre as departamento
    FROM notario n
    LEFT JOIN recinto r ON n.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    LEFT JOIN provincia p ON m.provincia_id = p.id
    LEFT JOIN departamento d ON p.departamento_id = d.id
    ORDER BY n.nombre
  `,

  // === MESAS Y ACTAS (NUEVO) ===
  getAllMesas: () => `
    SELECT 
      m.id,
      m.numero,
      r.nombre as recinto,
      o.nombre as operador,
      no.nombre as notario,
      ae.nombre as asiento_electoral,
      (SELECT COUNT(*) FROM acta WHERE mesa_id = m.id) as actas_registradas
    FROM mesa m
    LEFT JOIN recinto r ON m.recinto_id = r.id
    LEFT JOIN operador o ON m.operador_id = o.id
    LEFT JOIN notario no ON m.notario_id = no.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    ORDER BY m.numero
  `,

  getAllActas: () => `
    SELECT 
      a.id,
      a.codigo,
      m.numero as numero_mesa,
      r.nombre as recinto,
      o.nombre as operador,
      n.nombre as notario
    FROM acta a
    LEFT JOIN mesa m ON a.mesa_id = m.id
    LEFT JOIN recinto r ON m.recinto_id = r.id
    LEFT JOIN operador o ON m.operador_id = o.id
    LEFT JOIN notario n ON m.notario_id = n.id
    ORDER BY a.codigo
  `,

  // === COORDINADORES Y JEFES (ACTUALIZADO) ===
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
      COUNT(CASE WHEN o.tipo = 'rural' THEN 1 END) as operadores_rurales,
      COUNT(CASE WHEN o.tipo = 'urbano' THEN 1 END) as operadores_urbanos
    FROM jefe j
    LEFT JOIN coordinador c ON j.id = c.jefe_id
    LEFT JOIN grupo g ON c.id = g.coordinador_id
    LEFT JOIN operador o ON g.id = o.grupo_id
    GROUP BY j.id, j.nombre, j.cargo, j.celular, c.nombre, c.ci, c.celular, g.nombre
    ORDER BY j.nombre, c.nombre
  `,

  getCoordinadorConGrupo: () => `
    SELECT 
      c.nombre as coordinador,
      c.ci as cedula_coordinador,
      c.celular as coordinador_telefono,
      c.cargo as cargo_coordinador,
      j.nombre as jefe,
      g.nombre as grupo,
      COUNT(o.id) as total_operadores,
      COUNT(CASE WHEN o.tipo = 'rural' THEN 1 END) as operadores_rurales,
      COUNT(CASE WHEN o.tipo = 'urbano' THEN 1 END) as operadores_urbanos
    FROM coordinador c
    LEFT JOIN jefe j ON c.jefe_id = j.id
    LEFT JOIN grupo g ON c.id = g.coordinador_id
    LEFT JOIN operador o ON g.id = o.grupo_id
    GROUP BY c.id, c.nombre, c.ci, c.celular, c.cargo, j.nombre, g.nombre
    ORDER BY c.nombre
  `,

  // === REPORTES GEOGRÁFICOS ===
  getOperadoresPorDepartamento: () => `
    SELECT 
      d.nombre as departamento,
      p.nombre as provincia,
      m.nombre as municipio,
      COUNT(o.id) as total_operadores,
      COUNT(CASE WHEN o.tipo = 'rural' THEN 1 END) as rurales,
      COUNT(CASE WHEN o.tipo = 'urbano' THEN 1 END) as urbanos,
      COUNT(DISTINCT r.id) as recintos,
      COUNT(DISTINCT me.id) as mesas
    FROM departamento d
    LEFT JOIN provincia p ON d.id = p.departamento_id
    LEFT JOIN municipio m ON p.id = m.provincia_id
    LEFT JOIN asiento_electoral ae ON m.id = ae.municipio_id
    LEFT JOIN recinto r ON ae.id = r.asiento_id
    LEFT JOIN operador o ON r.id = o.recinto_id
    LEFT JOIN mesa me ON r.id = me.recinto_id
    GROUP BY d.id, d.nombre, p.nombre, m.nombre
    HAVING total_operadores > 0
    ORDER BY d.nombre, p.nombre, m.nombre
  `,

  // === BÚSQUEDA GLOBAL ACTUALIZADA ===
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
    
    SELECT 'coordinador' as tipo, c.id, c.nombre as titulo, c.ci as subtitulo,
           COALESCE(j.nombre, 'Sin jefe') as descripcion
    FROM coordinador c
    LEFT JOIN jefe j ON c.jefe_id = j.id
    WHERE c.nombre LIKE '%${searchTerm}%' OR c.ci LIKE '%${searchTerm}%'
    
    LIMIT 20
  `
}