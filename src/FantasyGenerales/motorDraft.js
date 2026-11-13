// Motor de Draft serpiente - Fantasy Generales
export const REGLAS_DRAFT = {
  minimoEquipos: 4,
  maximoEquipos: 12,
  jugadoresPorEquipo: 10,
  segundosPorTurno: 20
};

export function crearOrdenDraft(equipos, rondas = REGLAS_DRAFT.jugadoresPorEquipo) {
  if (!Array.isArray(equipos) ||
      equipos.length < REGLAS_DRAFT.minimoEquipos ||
      equipos.length > REGLAS_DRAFT.maximoEquipos ||
      new Set(equipos.map(e => e.id)).size !== equipos.length) {
    throw new Error('El Draft necesita entre 4 y 12 equipos con IDs únicos.');
  }

  const orden = [];
  for (let ronda = 0; ronda < rondas; ronda++) {
    const turnoEquipos = ronda % 2 === 0
      ? [...equipos]
      : [...equipos].reverse();

    turnoEquipos.forEach(equipo => {
      orden.push({
        numero: orden.length + 1,
        ronda: ronda + 1,
        equipoId: equipo.id,
        equipoNombre: equipo.nombre
      });
    });
  }
  return orden;
}

// Draft rotativo: cada equipo inicia exactamente una ronda.
export function crearOrdenRotativo(equipos, rondas = 18) {
  if (!Array.isArray(equipos) ||
      equipos.length < 2 ||
      equipos.length > 10 ||
      new Set(equipos.map(e => e.id)).size !== equipos.length) {
    throw new Error('El Draft rotativo requiere entre 2 y 10 equipos únicos.');
  }

  const orden = [];

  for (let ronda = 0; ronda < rondas; ronda++) {
    for (let turno = 0; turno < equipos.length; turno++) {
      const indice = (ronda + turno) % equipos.length;
      const equipo = equipos[indice];

      orden.push({
        numero: orden.length + 1,
        ronda: ronda + 1,
        equipoId: equipo.id,
        equipoNombre: equipo.nombre
      });
    }
  }

  return orden;
}

export function crearDraft(equipos, campeonato) {
  if (!['juvenil', 'mayor', 'mlb', 'softbol-veteranos'].includes(campeonato)) {
    throw new Error('Campeonato no válido.');
  }

  return {
    campeonato,
    estado: 'preparado',
    orden: campeonato === 'softbol-veteranos'
      ? crearOrdenRotativo(equipos, 18)
      : crearOrdenDraft(equipos),
    seleccionActual: 0,
    selecciones: []
  };
}

export function obtenerTurno(draft) {
  return draft.orden[draft.seleccionActual] || null;
}

export function seleccionarJugador(draft, equipoId, jugador) {
  if (draft.estado !== 'activo') {
    throw new Error('El Draft no está activo.');
  }

  const turno = obtenerTurno(draft);
  if (!turno || turno.equipoId !== equipoId) {
    throw new Error('No es el turno de este equipo.');
  }

  if (!jugador || !jugador.id) {
    throw new Error('Selecciona un pelotero válido.');
  }

  const jugadorRepetido = draft.selecciones.some(s =>
    s.jugadorId === jugador.id &&
    (draft.campeonato !== 'softbol-veteranos' || s.equipoId === equipoId)
  );

  if (jugadorRepetido) {
    throw new Error(
      draft.campeonato === 'softbol-veteranos'
        ? 'Este pelotero ya pertenece a tu equipo Fantasy.'
        : 'Este pelotero ya fue seleccionado.'
    );
  }

  // Veteranos: máximo cinco equipos Fantasy por pelotero.
  if (draft.campeonato === 'softbol-veteranos') {
    const equiposQueLoEligieron = new Set(
      draft.selecciones
        .filter(s => s.jugadorId === jugador.id)
        .map(s => s.equipoId)
    );

    if (equiposQueLoEligieron.size >= 5) {
      throw new Error(
        'CUPO COMPLETO: este pelotero ya fue seleccionado por 5 equipos Fantasy.'
      );
    }
  }

  const selecciones = [
    ...draft.selecciones,
    {
      numero: turno.numero,
      ronda: turno.ronda,
      equipoId,
      jugadorId: jugador.id,
      jugadorNombre: jugador.nombre
    }
  ];

  const seleccionActual = draft.seleccionActual + 1;

  return {
    ...draft,
    selecciones,
    seleccionActual,
    estado: seleccionActual >= draft.orden.length ? 'finalizado' : 'activo'
  };
}


// Inicia un Draft preparado sin alterar el orden de selección.
export function iniciarDraft(draft) {
  if (draft.estado !== 'preparado') {
    throw new Error('El Draft no está preparado para iniciar.');
  }

  if (!draft.orden.length) {
    throw new Error('El Draft no tiene turnos configurados.');
  }

  return {
    ...draft,
    estado: 'activo'
  };
}
