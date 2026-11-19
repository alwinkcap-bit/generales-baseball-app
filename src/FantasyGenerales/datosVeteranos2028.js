// Datos locales de Fantasy Veteranos 2028.
// No utiliza Supabase.

export const CLAVES_VETERANOS = Object.freeze({
  peloteros: 'fantasy-veteranos-2028-peloteros-local',
  estadisticas: 'fantasy-veteranos-2028-estadisticas-local',
  draft: 'fantasy-softbol-draft-2027'
});

export function leerPeloterosVeteranos() {
  try {
    const principal = JSON.parse(
      localStorage.getItem(CLAVES_VETERANOS.peloteros) || '[]'
    );

    if (Array.isArray(principal) && principal.length > 0) {
      return principal;
    }

    const anterior = JSON.parse(
      localStorage.getItem('fantasy-softbol-peloteros-2027') || '[]'
    );

    if (!Array.isArray(anterior)) return [];

    const validos = anterior.filter(p =>
      p && p.id != null && p.nombre &&
      String(p.equipoId || '').toLowerCase() === 'monagrillo'
    );

    if (validos.length > 0) {
      guardarPeloterosVeteranos(validos);
    }

    return validos;
  } catch {
    return [];
  }
}


export function guardarPeloterosVeteranos(peloteros) {
  if (!Array.isArray(peloteros)) {
    throw new Error('El catálogo debe ser una lista.');
  }

  const ids = peloteros.map(p => String(p.id));

  if (ids.some(id => !id || id === 'undefined') ||
      new Set(ids).size !== ids.length) {
    throw new Error('Los peloteros deben tener identificadores únicos.');
  }

  localStorage.setItem(
    CLAVES_VETERANOS.peloteros,
    JSON.stringify(peloteros)
  );
}

export function calcularPuntosEquiposVeteranos(
  registros,
  selecciones
) {
  const puntosPorJugador = new Map();

  for (const registro of registros) {
    const id = String(registro.jugadorId || '');
    if (!id) continue;

    puntosPorJugador.set(
      id,
      (puntosPorJugador.get(id) || 0) + Number(registro.puntos || 0)
    );
  }

  const resultados = new Map();

  for (const seleccion of selecciones) {
    const equipoId = String(seleccion.equipoId);
    const jugadorId = String(seleccion.jugadorId);

    if (!resultados.has(equipoId)) {
      resultados.set(equipoId, 0);
    }

    resultados.set(
      equipoId,
      resultados.get(equipoId) +
      (puntosPorJugador.get(jugadorId) || 0)
    );
  }

  return [...resultados.entries()]
    .map(([equipoId, puntos]) => ({ equipoId, puntos }))
    .sort((a, b) => b.puntos - a.puntos);
}
