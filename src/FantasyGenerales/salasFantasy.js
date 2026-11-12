// Gestión local de salas Fantasy Generales 2027.
// La sincronización entre usuarios se implementará posteriormente.

export const CUPO_SALA = 10;
export const CAMPEONATOS_FANTASY = ['juvenil', 'mayor', 'mlb', 'softbol-veteranos'];

export function crearSala(campeonato, numero) {
  if (!CAMPEONATOS_FANTASY.includes(campeonato)) {
    throw new Error('Campeonato no válido');
  }

  return {
    id: `${campeonato}-sala-${numero}`,
    campeonato,
    nombre: `Sala ${numero}`,
    capacidad: CUPO_SALA,
    participantes: [],
    estado: 'inscripciones'
  };
}

export function inscribirParticipante(salas, campeonato, participante) {
  if (!CAMPEONATOS_FANTASY.includes(campeonato)) {
    throw new Error('Campeonato no válido');
  }

  if (!participante?.id || !participante?.nombre?.trim()) {
    throw new Error('Participante no válido');
  }

  const actualizadas = salas.map(sala => ({
    ...sala,
    participantes: [...sala.participantes]
  }));

  if (actualizadas.some(sala =>
    sala.campeonato === campeonato &&
    sala.participantes.some(p => p.id === participante.id)
  )) {
    throw new Error('El participante ya está inscrito en este campeonato');
  }

  let sala = actualizadas.find(s =>
    s.campeonato === campeonato &&
    s.estado === 'inscripciones' &&
    s.participantes.length < CUPO_SALA
  );

  if (!sala) {
    const numeros = actualizadas
      .filter(s => s.campeonato === campeonato)
      .map(s => Number(s.id.split('-').pop()) || 0);

    sala = crearSala(campeonato, Math.max(0, ...numeros) + 1);
    actualizadas.push(sala);
  }

  sala.participantes.push({
    id: participante.id,
    nombre: participante.nombre.trim()
  });

  if (sala.participantes.length === CUPO_SALA) {
    sala.estado = 'completa';

    const numeros = actualizadas
      .filter(s => s.campeonato === campeonato)
      .map(s => Number(s.id.split('-').pop()) || 0);

    actualizadas.push(crearSala(campeonato, Math.max(...numeros) + 1));
  }

  return {
    salas: actualizadas,
    salaAsignada: sala.id
  };
}

export function salaListaParaDraft(sala) {
  return sala.participantes.length === CUPO_SALA &&
    sala.estado === 'completa';
}
