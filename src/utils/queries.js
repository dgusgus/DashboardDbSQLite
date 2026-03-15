// src/utils/queries.js
// ✅ Actualizado para BD v2: tabla 'persona' unificada, coordinador con nombre_grupo

export const queries = {

  // ── ESTADÍSTICAS GENERALES ─────────────────────────────────────────
  getGeneralStats: () => `
    SELECT
      (SELECT COUNT(*) FROM persona WHERE tipo = 'operador')                          AS total_operadores,
      (SELECT COUNT(*) FROM persona p
       JOIN recinto r ON p.recinto_id = r.id
       JOIN asiento_electoral ae ON r.asiento_id = ae.id
       JOIN municipio m ON ae.municipio_id = m.id
       JOIN provincia pr ON m.provincia_id = pr.id
       WHERE p.tipo = 'operador' AND pr.es_urbano = 0)                                AS operadores_rurales,
      (SELECT COUNT(*) FROM persona p
       JOIN recinto r ON p.recinto_id = r.id
       JOIN asiento_electoral ae ON r.asiento_id = ae.id
       JOIN municipio m ON ae.municipio_id = m.id
       JOIN provincia pr ON m.provincia_id = pr.id
       WHERE p.tipo = 'operador' AND pr.es_urbano = 1)                                AS operadores_urbanos,
      (SELECT COUNT(*) FROM recinto)                                                   AS total_recintos,
      (SELECT COUNT(*) FROM persona WHERE tipo = 'notario')                           AS total_notarios,
      (SELECT COUNT(*) FROM acta)                                                      AS total_actas,
      (SELECT COUNT(*) FROM coordinador)                                               AS total_coordinadores,
      (SELECT COUNT(*) FROM jefe)                                                      AS total_jefes,
      (SELECT COUNT(*) FROM persona WHERE user IS NOT NULL AND tipo = 'operador')     AS total_cuentas
  `,

  // ── OPERADORES ─────────────────────────────────────────────────────
  // tipo_operador inferido desde provincia.es_urbano
  getAllOperadores: () => `
    SELECT
      p.id,
      p.nombre,
      p.ci          AS cedula,
      p.expedido,
      p.celular     AS telefono,
      p.correo,
      p.cargo,
      p.user,
      CASE WHEN pr.es_urbano = 1 THEN 'urbano' ELSE 'rural' END AS tipo_operador,
      c.nombre_grupo  AS grupo,
      c.nombre        AS coordinador,
      c.ci            AS coordinador_ci,
      c.celular       AS coordinador_telefono,
      j.nombre        AS jefe,
      j.celular       AS jefe_telefono,
      r.id            AS recinto_id,
      r.nombre        AS recinto,
      r.direccion     AS recinto_direccion,
      r.distrito,
      ae.nombre       AS asiento_electoral,
      m.nombre        AS municipio,
      pr.nombre       AS provincia,
      pr.es_urbano    AS provincia_urbana,
      d.nombre        AS departamento,
      (SELECT COUNT(*) FROM acta a2 WHERE a2.persona_id = p.id) AS actas_asignadas
    FROM persona p
    LEFT JOIN coordinador c   ON p.coordinador_id = c.id
    LEFT JOIN jefe j          ON c.jefe_id = j.id
    LEFT JOIN recinto r       ON p.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m     ON ae.municipio_id = m.id
    LEFT JOIN provincia pr    ON m.provincia_id = pr.id
    LEFT JOIN departamento d  ON pr.departamento_id = d.id
    WHERE p.tipo = 'operador'
    ORDER BY p.nombre
  `,

  searchOperadores: (term) => `
    SELECT
      p.id, p.nombre, p.ci AS cedula, p.celular AS telefono,
      CASE WHEN pr.es_urbano = 1 THEN 'urbano' ELSE 'rural' END AS tipo_operador,
      c.nombre_grupo AS grupo,
      r.nombre AS recinto,
      c.nombre AS coordinador
    FROM persona p
    LEFT JOIN coordinador c  ON p.coordinador_id = c.id
    LEFT JOIN recinto r      ON p.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m    ON ae.municipio_id = m.id
    LEFT JOIN provincia pr   ON m.provincia_id = pr.id
    WHERE p.tipo = 'operador' AND (
      p.nombre LIKE '%${term}%' OR
      p.ci     LIKE '%${term}%' OR
      c.nombre_grupo LIKE '%${term}%' OR
      r.nombre LIKE '%${term}%' OR
      c.nombre LIKE '%${term}%'
    )
    ORDER BY p.nombre
    LIMIT 100
  `,

  // ── NOTARIOS ───────────────────────────────────────────────────────
  getAllNotarios: () => `
    SELECT
      p.id,
      p.nombre,
      p.ci          AS cedula,
      p.expedido,
      p.celular     AS telefono,
      p.correo,
      p.cargo,
      CASE WHEN pr.es_urbano = 1 THEN 'urbano' ELSE 'rural' END AS tipo_notario,
      r.nombre      AS recinto,
      r.direccion   AS recinto_direccion,
      ae.nombre     AS asiento_electoral,
      m.nombre      AS municipio,
      pr.nombre     AS provincia,
      d.nombre      AS departamento,
      (SELECT COUNT(*) FROM acta a2
       JOIN persona p2 ON a2.persona_id = p2.id
       WHERE p2.recinto_id = r.id)  AS actas_en_recinto
    FROM persona p
    LEFT JOIN recinto r       ON p.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m     ON ae.municipio_id = m.id
    LEFT JOIN provincia pr    ON m.provincia_id = pr.id
    LEFT JOIN departamento d  ON pr.departamento_id = d.id
    WHERE p.tipo = 'notario'
    ORDER BY p.nombre
  `,

  // ── RECINTOS ───────────────────────────────────────────────────────
  // Counts como subqueries para evitar colapso de GROUP BY con múltiples LEFT JOINs
  getAllRecintos: () => `
    SELECT
      r.id,
      r.nombre,
      r.direccion,
      r.distrito,
      CASE WHEN pr.es_urbano = 1 THEN 'urbano' ELSE 'rural' END AS tipo,
      ae.nombre    AS asiento_electoral,
      m.nombre     AS municipio,
      pr.nombre    AS provincia,
      pr.es_urbano AS provincia_urbana,
      d.nombre     AS departamento,
      (SELECT COUNT(*) FROM persona WHERE recinto_id = r.id AND tipo = 'operador') AS operadores_asignados,
      (SELECT COUNT(*) FROM persona WHERE recinto_id = r.id AND tipo = 'notario')  AS notarios_asignados,
      (SELECT COUNT(*) FROM acta a JOIN persona p ON a.persona_id = p.id WHERE p.recinto_id = r.id) AS actas_registradas
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m          ON ae.municipio_id = m.id
    LEFT JOIN provincia pr         ON m.provincia_id = pr.id
    LEFT JOIN departamento d       ON pr.departamento_id = d.id
    ORDER BY d.nombre, pr.nombre, m.nombre, r.nombre
  `,

  // ── ACTAS ──────────────────────────────────────────────────────────
  // acta.persona_id → persona → recinto (v2)
  getAllActas: () => `
    SELECT
      a.id,
      a.codigo,
      p.nombre      AS operador,
      p.ci          AS operador_ci,
      p.celular     AS operador_celular,
      c.nombre_grupo AS grupo,
      c.nombre      AS coordinador,
      r.nombre      AS recinto,
      r.direccion   AS recinto_direccion,
      ae.nombre     AS asiento_electoral,
      m.nombre      AS municipio,
      pr.nombre     AS provincia,
      d.nombre      AS departamento,
      CASE WHEN pr.es_urbano = 1 THEN 'urbano' ELSE 'rural' END AS tipo_zona
    FROM acta a
    JOIN persona p            ON a.persona_id = p.id
    LEFT JOIN coordinador c   ON p.coordinador_id = c.id
    LEFT JOIN recinto r       ON p.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m     ON ae.municipio_id = m.id
    LEFT JOIN provincia pr    ON m.provincia_id = pr.id
    LEFT JOIN departamento d  ON pr.departamento_id = d.id
    ORDER BY a.codigo
  `,

  // Actas de un operador específico (por recinto_id)
  getActasByRecintoId: (recintoId) => `
    SELECT a.id, a.codigo
    FROM acta a
    JOIN persona p ON a.persona_id = p.id
    WHERE p.recinto_id = ${recintoId}
    ORDER BY a.codigo
  `,

  // ── JERARQUÍA ──────────────────────────────────────────────────────
  getJerarquiaCompleta: () => `
    SELECT
      j.nombre        AS jefe,
      j.cargo         AS cargo_jefe,
      j.celular       AS jefe_telefono,
      c.nombre        AS coordinador,
      c.ci            AS cedula_coordinador,
      c.celular       AS coordinador_telefono,
      c.nombre_grupo  AS grupo,
      COUNT(p.id)     AS total_operadores,
      SUM(CASE WHEN pr.es_urbano = 0 THEN 1 ELSE 0 END) AS operadores_rurales,
      SUM(CASE WHEN pr.es_urbano = 1 THEN 1 ELSE 0 END) AS operadores_urbanos
    FROM jefe j
    LEFT JOIN coordinador c   ON c.jefe_id = j.id
    LEFT JOIN persona p       ON p.coordinador_id = c.id AND p.tipo = 'operador'
    LEFT JOIN recinto r       ON p.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m     ON ae.municipio_id = m.id
    LEFT JOIN provincia pr    ON m.provincia_id = pr.id
    GROUP BY j.id, j.nombre, j.cargo, j.celular, c.id, c.nombre, c.ci, c.celular, c.nombre_grupo
    ORDER BY j.nombre, c.nombre
  `,

  // ── REPORTES GEOGRÁFICOS ───────────────────────────────────────────
  getOperadoresPorDepartamento: () => `
    SELECT
      d.nombre        AS departamento,
      pr.nombre       AS provincia,
      pr.es_urbano    AS provincia_urbana,
      m.nombre        AS municipio,
      COUNT(DISTINCT p.id)  AS total_operadores,
      SUM(CASE WHEN pr.es_urbano = 0 THEN 1 ELSE 0 END) AS rurales,
      SUM(CASE WHEN pr.es_urbano = 1 THEN 1 ELSE 0 END) AS urbanos,
      COUNT(DISTINCT r.id)  AS recintos,
      COUNT(DISTINCT a.id)  AS actas_registradas
    FROM departamento d
    LEFT JOIN provincia pr   ON d.id = pr.departamento_id
    LEFT JOIN municipio m    ON pr.id = m.provincia_id
    LEFT JOIN asiento_electoral ae ON m.id = ae.municipio_id
    LEFT JOIN recinto r      ON ae.id = r.asiento_id
    LEFT JOIN persona p      ON p.recinto_id = r.id AND p.tipo = 'operador'
    LEFT JOIN acta a         ON a.persona_id = p.id
    GROUP BY d.id, pr.id, m.id
    HAVING total_operadores > 0
    ORDER BY d.nombre, pr.nombre, m.nombre
  `,

  // ── REPORTE ACTAS POR RECINTO ──────────────────────────────────────
  getActasPorRecinto: () => `
    SELECT
      r.nombre        AS recinto,
      r.direccion,
      CASE WHEN pr.es_urbano = 1 THEN 'Urbano' ELSE 'Rural' END AS tipo,
      m.nombre        AS municipio,
      pr.nombre       AS provincia,
      d.nombre        AS departamento,
      COUNT(DISTINCT a.id)  AS total_actas,
      GROUP_CONCAT(DISTINCT p.nombre)  AS operadores
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m     ON ae.municipio_id = m.id
    LEFT JOIN provincia pr    ON m.provincia_id = pr.id
    LEFT JOIN departamento d  ON pr.departamento_id = d.id
    LEFT JOIN persona p       ON p.recinto_id = r.id AND p.tipo = 'operador'
    LEFT JOIN acta a          ON a.persona_id = p.id
    GROUP BY r.id
    HAVING total_actas > 0
    ORDER BY d.nombre, pr.nombre, total_actas DESC
  `,

  // ── COBERTURA / VALIDACIÓN ─────────────────────────────────────────
  getRecintosIncompletos: () => `
    SELECT
      r.nombre        AS recinto,
      m.nombre        AS municipio,
      pr.nombre       AS provincia,
      d.nombre        AS departamento,
      COUNT(DISTINCT CASE WHEN p.tipo = 'operador' THEN p.id END) AS operadores,
      COUNT(DISTINCT CASE WHEN p.tipo = 'notario'  THEN p.id END) AS notarios,
      COUNT(DISTINCT a.id)                                         AS actas,
      CASE
        WHEN COUNT(DISTINCT CASE WHEN p.tipo = 'operador' THEN p.id END) = 0 THEN '❌ Sin operadores'
        WHEN COUNT(DISTINCT CASE WHEN p.tipo = 'notario'  THEN p.id END) = 0 THEN '⚠️ Sin notarios'
        WHEN COUNT(DISTINCT a.id) = 0                                          THEN '📝 Sin actas'
        ELSE '✅ Completo'
      END AS estado
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m     ON ae.municipio_id = m.id
    LEFT JOIN provincia pr    ON m.provincia_id = pr.id
    LEFT JOIN departamento d  ON pr.departamento_id = d.id
    LEFT JOIN persona p       ON p.recinto_id = r.id
    LEFT JOIN acta a          ON a.persona_id = p.id
    GROUP BY r.id
    HAVING operadores = 0 OR notarios = 0 OR actas = 0
    ORDER BY operadores ASC, notarios ASC, actas ASC
  `,

  // ── BÚSQUEDA GLOBAL ────────────────────────────────────────────────
  searchGlobal: (term) => `
    SELECT 'operador' as tipo, p.id,
           p.nombre as titulo, p.ci as subtitulo,
           COALESCE(c.nombre_grupo,'Sin grupo') || ' | ' || COALESCE(r.nombre,'Sin recinto') as descripcion
    FROM persona p
    LEFT JOIN coordinador c ON p.coordinador_id = c.id
    LEFT JOIN recinto r ON p.recinto_id = r.id
    WHERE p.tipo = 'operador' AND (p.nombre LIKE '%${term}%' OR p.ci LIKE '%${term}%')

    UNION ALL

    SELECT 'notario' as tipo, p.id,
           p.nombre as titulo, p.ci as subtitulo,
           COALESCE(r.nombre,'Sin recinto') as descripcion
    FROM persona p
    LEFT JOIN recinto r ON p.recinto_id = r.id
    WHERE p.tipo = 'notario' AND (p.nombre LIKE '%${term}%' OR p.ci LIKE '%${term}%')

    UNION ALL

    SELECT 'recinto' as tipo, r.id,
           r.nombre as titulo, r.direccion as subtitulo,
           COALESCE(ae.nombre,'Sin asiento') as descripcion
    FROM recinto r
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    WHERE r.nombre LIKE '%${term}%' OR r.direccion LIKE '%${term}%'

    UNION ALL

    SELECT 'acta' as tipo, a.id,
           a.codigo as titulo, p.nombre as subtitulo,
           COALESCE(m.nombre,'Sin municipio') as descripcion
    FROM acta a
    JOIN persona p ON a.persona_id = p.id
    LEFT JOIN recinto r ON p.recinto_id = r.id
    LEFT JOIN asiento_electoral ae ON r.asiento_id = ae.id
    LEFT JOIN municipio m ON ae.municipio_id = m.id
    WHERE a.codigo LIKE '%${term}%'

    LIMIT 20
  `,

  // ── LISTAS PARA FILTROS ────────────────────────────────────────────
  getProvincias: () => `SELECT DISTINCT nombre, es_urbano FROM provincia ORDER BY nombre`,
  getMunicipios: () => `
    SELECT DISTINCT m.nombre, p.nombre AS provincia
    FROM municipio m LEFT JOIN provincia p ON m.provincia_id = p.id
    ORDER BY m.nombre
  `,
  getAsientosElectorales: () => `
    SELECT DISTINCT ae.nombre, m.nombre AS municipio
    FROM asiento_electoral ae LEFT JOIN municipio m ON ae.municipio_id = m.id
    ORDER BY ae.nombre
  `,
  getDepartamentos: () => `SELECT DISTINCT nombre FROM departamento ORDER BY nombre`,
}