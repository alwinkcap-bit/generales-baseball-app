// Catalogos de peloteros para Fantasy Generales 2027.
// Las listas se completaran con rosters verificados.
// Formato: { id, nombre, equipo, posiciones: ['P'] }

export const jugadoresFantasy = {
  juvenil: [],
  mayor: [],
  mlb: []
};

export function obtenerJugadoresFantasy(campeonato, posicion) {
  const jugadores = jugadoresFantasy[campeonato] || [];
  if (!posicion) return jugadores;

  const posicionBase = posicion.startsWith('OF') ? 'OF' : posicion;

  return jugadores.filter(jugador =>
    jugador.posiciones.includes(posicionBase)
  );
}
