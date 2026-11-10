// MÁNAGER VIRTUAL GENERALES 2027
// Motor de decisiones estratégicas - Versión inicial

export const situacionInicial = {
  episodio: 9,
  mitad: "alta",
  equipoOfensivo: "Chiriquí",
  equipoDefensivo: "Herrera",
  carrerasOfensivo: 4,
  carrerasDefensivo: 5,
  outs: 1,
  corredores: {
    primera: true,
    segunda: false,
    tercera: true
  },
  cuenta: {
    bolas: 1,
    strikes: 2
  },
  bateador: {
    mano: "derecha",
    porcentajeRodados: 62,
    promedio: 0.315
  },
  lanzador: {
    lanzamientos: 27,
    fatigado: false
  }
};

export const decisionesManager = [
  {
    id: "ponche",
    texto: "Buscar el ponche con un lanzamiento fuera de la zona",
    puntosBase: 40
  },
  {
    id: "cuadro_adentro",
    texto: "Adelantar el cuadro para evitar la carrera del empate",
    puntosBase: 35
  },
  {
    id: "doble_play",
    texto: "Buscar un rodado para doble play",
    puntosBase: 25
  },
  {
    id: "cambio_lanzador",
    texto: "Cambiar al cerrador por un relevista descansado",
    puntosBase: 15
  }
];

export function evaluarDecision(decisionId, situacion = situacionInicial) {
  const decision = decisionesManager.find(
    (opcion) => opcion.id === decisionId
  );

  if (!decision) {
    return {
      puntos: 0,
      mensaje: "Decisión no reconocida"
    };
  }

  let puntos = decision.puntosBase;

  if (
    decisionId === "ponche" &&
    situacion.cuenta.strikes === 2
  ) {
    puntos += 30;
  }

  if (
    decisionId === "cuadro_adentro" &&
    situacion.corredores.tercera
  ) {
    puntos += 20;
  }

  if (
    decisionId === "cambio_lanzador" &&
    situacion.lanzador.fatigado
  ) {
    puntos += 35;
  }

  return {
    puntos: Math.min(puntos, 100),
    mensaje: `Decisión evaluada: ${decision.texto}`
  };
}
