import { supabase } from './supabase'
export async function guardarPartidaJonrones(userId, resultado, clave) {
  if (!userId) return 'Partida local: inicia sesión para participar en la liga.'
  const { data: perfil, error: lectura } = await supabase.from('perfiles_juegos').select('nickname').eq('user_id', userId).maybeSingle()
  if (lectura) throw lectura
  if (!perfil) return 'Crea tu nickname en la sala para participar en la liga.'
  const { error } = await supabase.from('resultados_juegos').insert({user_id:userId,modo:'jonrones',clave,jonrones:resultado.jonrones,puntos:resultado.puntos,total:0,aciertos:0})
  if (error && error.code !== '23505') throw error
  return '✅ Partida registrada en la liga semanal.'
}
export function fechaPanama(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US',{timeZone:'America/Panama',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(fecha)
  const valor = tipo => partes.find(p=>p.type===tipo).value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}
export function elegirPreguntas(banco, semilla, cantidad) {
  let estado=2166136261
  for(const c of semilla) estado=Math.imul(estado^c.charCodeAt(0),16777619)>>>0
  const copia=[...banco]
  for(let i=copia.length-1;i>0;i--){estado=(Math.imul(estado,1664525)+1013904223)>>>0;const j=estado%(i+1);[copia[i],copia[j]]=[copia[j],copia[i]]}
  return copia.slice(0,cantidad)
}
export function calcularRacha(resultados, hoy) {
  const fechas=new Set(resultados.filter(r=>r.modo==='diario').map(r=>r.clave))
  let fecha=new Date(`${hoy}T12:00:00Z`),racha=0
  const clave=()=>fecha.toISOString().slice(0,10)
  if(!fechas.has(clave())) fecha.setUTCDate(fecha.getUTCDate()-1)
  while(fechas.has(clave())){racha++;fecha.setUTCDate(fecha.getUTCDate()-1)}
  return racha
}

export function mejorRacha(resultados) {
  const dias=[...new Set(resultados.filter(r=>r.modo==='diario').map(r=>r.clave))].sort()
  let anterior=null,seguidos=0,mejor=0
  for(const dia of dias){
    const actual=new Date(`${dia}T12:00:00Z`).getTime()
    seguidos=anterior!==null&&actual-anterior===86400000?seguidos+1:1
    mejor=Math.max(mejor,seguidos);anterior=actual
  }
  return mejor
}
