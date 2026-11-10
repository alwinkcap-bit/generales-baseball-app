// Situaciones estratégicas de simulación
export const situacionesManager = [
  {
    id: 1, titulo: 'Defender la ventaja',
    episodio: 9, mitad: 'alta',
    equipoDefensivo: 'Herrera', equipoOfensivo: 'Chiriquí',
    carrerasDefensivo: 5, carrerasOfensivo: 4,
    outs: 1, cuenta: { bolas: 1, strikes: 2 },
    corredores: { primera: true, segunda: false, tercera: true },
    lanzamientos: 27,
    explicacion: 'Herrera gana 5-4. Corredores en primera y tercera con un out. Evita el empate.',
    recomendada: 'ponche'
  },
  {
    id: 2, titulo: 'Bases llenas',
    episodio: 8, mitad: 'baja',
    equipoDefensivo: 'Los Santos', equipoOfensivo: 'Panamá Metro',
    carrerasDefensivo: 3, carrerasOfensivo: 2,
    outs: 1, cuenta: { bolas: 2, strikes: 1 },
    corredores: { primera: true, segunda: true, tercera: true },
    lanzamientos: 48,
    explicacion: 'Bases llenas y un out. Debes impedir la carrera del empate.',
    recomendada: 'cuadro_adentro'
  },
  {
    id: 3, titulo: 'Defender home',
    episodio: 7, mitad: 'alta',
    equipoDefensivo: 'Coclé', equipoOfensivo: 'Veraguas',
    carrerasDefensivo: 4, carrerasOfensivo: 3,
    outs: 0, cuenta: { bolas: 1, strikes: 1 },
    corredores: { primera: false, segunda: false, tercera: true },
    lanzamientos: 36,
    explicacion: 'Corredor en tercera sin outs. Protege una ventaja de una carrera.',
    recomendada: 'cuadro_adentro'
  },
  {
    id: 4, titulo: 'Buscar doble play',
    episodio: 6, mitad: 'baja',
    equipoDefensivo: 'Herrera', equipoOfensivo: 'Chiriquí',
    carrerasDefensivo: 6, carrerasOfensivo: 5,
    outs: 1, cuenta: { bolas: 0, strikes: 1 },
    corredores: { primera: true, segunda: false, tercera: false },
    lanzamientos: 42,
    explicacion: 'Corredor en primera y un out. Busca terminar el episodio con doble play.',
    recomendada: 'doble_play'
  },
  {
    id: 5, titulo: 'Lanzador cansado',
    episodio: 8, mitad: 'alta',
    equipoDefensivo: 'Panamá Oeste', equipoOfensivo: 'Colón',
    carrerasDefensivo: 4, carrerasOfensivo: 4,
    outs: 1, cuenta: { bolas: 3, strikes: 1 },
    corredores: { primera: true, segunda: true, tercera: false },
    lanzamientos: 105,
    explicacion: 'Juego empatado y lanzador con 105 pitcheos. Evalúa un relevo.',
    recomendada: 'cambio_lanzador'
  },
  {
    id: 6, titulo: 'Evitar la victoria rival',
    episodio: 9, mitad: 'baja',
    equipoDefensivo: 'Chiriquí', equipoOfensivo: 'Herrera',
    carrerasDefensivo: 5, carrerasOfensivo: 5,
    outs: 1, cuenta: { bolas: 1, strikes: 2 },
    corredores: { primera: false, segunda: false, tercera: true },
    lanzamientos: 58,
    explicacion: 'Empate en el noveno. El corredor de tercera representa la victoria rival.',
    recomendada: 'ponche'
  }
  ,{
    id: 7, titulo: 'Cuenta llena, bases llenas',
    episodio: 9, mitad: 'alta',
    equipoDefensivo: 'Herrera', equipoOfensivo: 'Los Santos',
    carrerasDefensivo: 6, carrerasOfensivo: 5,
    outs: 2, cuenta: { bolas: 3, strikes: 2 },
    corredores: { primera: true, segunda: true, tercera: true },
    lanzamientos: 96,
    explicacion: 'Bases llenas, dos outs y cuenta de 3-2. Una base por bolas empata el juego.',
    recomendada: 'ponche'
  },
  {
    id: 8, titulo: 'La carrera de la victoria',
    episodio: 9, mitad: 'baja',
    equipoDefensivo: 'Chiriquí', equipoOfensivo: 'Herrera',
    carrerasDefensivo: 4, carrerasOfensivo: 4,
    outs: 0, cuenta: { bolas: 2, strikes: 0 },
    corredores: { primera: false, segunda: false, tercera: true },
    lanzamientos: 68,
    explicacion: 'Juego empatado. Corredor en tercera sin outs. Un elevado de sacrificio puede terminar el partido.',
    recomendada: 'cuadro_adentro'
  },
  {
    id: 9, titulo: 'El relevista bajo presión',
    episodio: 9, mitad: 'alta',
    equipoDefensivo: 'Coclé', equipoOfensivo: 'Panamá Metro',
    carrerasDefensivo: 3, carrerasOfensivo: 2,
    outs: 1, cuenta: { bolas: 3, strikes: 1 },
    corredores: { primera: true, segunda: true, tercera: false },
    lanzamientos: 112,
    explicacion: 'Lanzador con 112 pitcheos, cuenta desfavorable y dos corredores en base. ¿Buscas un relevo?',
    recomendada: 'cambio_lanzador'
  },
  {
    id: 10, titulo: 'El cuarto bate',
    episodio: 8, mitad: 'baja',
    equipoDefensivo: 'Veraguas', equipoOfensivo: 'Herrera',
    carrerasDefensivo: 7, carrerasOfensivo: 6,
    outs: 2, cuenta: { bolas: 1, strikes: 2 },
    corredores: { primera: true, segunda: true, tercera: true },
    lanzamientos: 74,
    explicacion: 'Bases llenas, dos outs y el cuarto bate al plato. Un hit puede cambiar el partido.',
    recomendada: 'ponche'
  },
  {
    id: 11, titulo: 'Dos corredores en posición de anotar',
    episodio: 9, mitad: 'alta',
    equipoDefensivo: 'Los Santos', equipoOfensivo: 'Herrera',
    carrerasDefensivo: 5, carrerasOfensivo: 4,
    outs: 1, cuenta: { bolas: 0, strikes: 1 },
    corredores: { primera: false, segunda: true, tercera: true },
    lanzamientos: 83,
    explicacion: 'Corredores en segunda y tercera con un out. Un sencillo puede darle la ventaja al rival.',
    recomendada: 'cuadro_adentro'
  }
];
