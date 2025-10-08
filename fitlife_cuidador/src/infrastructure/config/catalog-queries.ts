// src/infrastructure/config/catalog-queries.ts
export const SQL_GET_ALL_EXERCISES = `
SELECT
  e.id,
  e.nombre,
  e.categoria,
  e.nivel,
  e.contraindicaciones,
  e.series_recomendadas,
  e.repeticiones_recomendadas,
  e.gif_url,
  e.musculo_principal,
  e.musculo_secundario,
  e.instrucciones,
  e.activo
FROM exercises e
WHERE e.activo = true
ORDER BY e.nombre ASC;
`;

export const SQL_GET_ALL_FOODS = `
SELECT
  f.id,
  f.nombre,
  f.categoria,
  f.imagen      AS imagen,
  f.alergenos,
  f.calorias,
  f.proteinas,
  f.activo
FROM foods f
WHERE f.activo = true
ORDER BY f.nombre ASC;
`;

// Si tienes una vista/lista de rutinas YA expandida (con JSON agregado), colócala aquí.
// Debe devolver: id, nombre, categoria?, ejercicios_json[], alimentos_json[]
export const SQL_GET_ALL_PUBLIC_ROUTINES_EXPANDED = ``; // <-- déjalo vacío si aún no tienes esa vista
