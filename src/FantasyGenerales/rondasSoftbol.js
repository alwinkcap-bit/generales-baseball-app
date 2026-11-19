// Posiciones obligatorias del Draft de Sóftbol Veteranos 2027.
export const RONDAS_SOFTBOL = [
  { ronda: 1, posicion: 'P', nombre: 'Lanzador' },
  { ronda: 2, posicion: 'C', nombre: 'Receptor' },
  { ronda: 3, posicion: '1B', nombre: 'Primera base' },
  { ronda: 4, posicion: '2B', nombre: 'Segunda base' },
  { ronda: 5, posicion: '3B', nombre: 'Tercera base' },
  { ronda: 6, posicion: 'SS', nombre: 'Campo corto' },
  { ronda: 7, posicion: 'OF', nombre: 'Jardinero 1' },
  { ronda: 8, posicion: 'OF', nombre: 'Jardinero 2' },
  { ronda: 9, posicion: 'OF', nombre: 'Jardinero 3' },
  { ronda: 10, posicion: 'DH', nombre: 'Bateador designado' },
  { ronda: 11, posicion: 'LIBRE', nombre: 'Suplente 1' },
  { ronda: 12, posicion: 'LIBRE', nombre: 'Suplente 2' },
  { ronda: 13, posicion: 'LIBRE', nombre: 'Suplente 3' },
  { ronda: 14, posicion: 'LIBRE', nombre: 'Suplente 4' },
  { ronda: 15, posicion: 'LIBRE', nombre: 'Suplente 5' },
  { ronda: 16, posicion: 'LIBRE', nombre: 'Suplente 6' },
  { ronda: 17, posicion: 'LIBRE', nombre: 'Suplente 7' },
  { ronda: 18, posicion: 'LIBRE', nombre: 'Suplente 8' }
];

export function obtenerPosicionRonda(ronda) {
  return RONDAS_SOFTBOL.find(item => item.ronda === ronda) || null;
}
