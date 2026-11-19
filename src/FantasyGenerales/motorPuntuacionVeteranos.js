// Fantasy Generales - Sóftbol Veteranos 2028
// Motor de puntuación local, sin conexión a Supabase.

export const PUNTOS_VETERANOS = Object.freeze({
  sencillo: 1,
  doble: 2,
  triple: 3,
  jonron: 5,
  carreraAnotada: 1,
  carreraImpulsada: 1,
  basePorBolas: 1,
  baseRobada: 2,
  poncheRecibido: -1,
  poncheLanzador: 2,
});

// Regla oficial: se calcula por entrada lanzada.
// 0-2 carreras: +1
// 3 carreras: 0
// 4 o más carreras: -3
export function puntosEntradaLanzada(carrerasPermitidas) {
  if (
    !Number.isInteger(carrerasPermitidas) ||
    carrerasPermitidas < 0
  ) {
    throw new Error('Las carreras permitidas deben ser un entero no negativo.');
  }

  if (carrerasPermitidas < 3) return 1;
  if (carrerasPermitidas === 3) return 0;
  return -3;
}

export function calcularPuntosVeteranos(estadisticas = {}) {
  let total = 0;
  const desglose = {};

  for (const [campo, valorPunto] of Object.entries(PUNTOS_VETERANOS)) {
    const cantidad = estadisticas[campo] ?? 0;

    if (!Number.isInteger(cantidad) || cantidad < 0) {
      throw new Error(`Estadística inválida: ${campo}`);
    }

    desglose[campo] = cantidad * valorPunto;
    total += desglose[campo];
  }

  const entradas = estadisticas.entradasLanzadas ?? [];

  if (!Array.isArray(entradas)) {
    throw new Error('Las entradas lanzadas deben ser una lista.');
  }

  desglose.entradasLanzadas = entradas.map(
    puntosEntradaLanzada
  );

  total += desglose.entradasLanzadas.reduce(
    (suma, puntos) => suma + puntos,
    0
  );

  return { total, desglose };
}
