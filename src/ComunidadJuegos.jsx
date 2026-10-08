import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import preguntas from './PreguntasReto'
import { fechaPanama, elegirPreguntas, calcularRacha, mejorRacha } from './JuegosComunidadDatos'
import './ComunidadJuegos.css'

const jugadas = [
 {pregunta:'Rodado hacia ti: ¿cómo preparas la recepción?',opciones:['Rodillas flexionadas y guante delante del cuerpo','Espalda al lanzamiento','Piernas juntas y guante detrás'],correcta:0,accion:'rodado'},
 {pregunta:'Tu compañero recibe un tiro: ¿cómo lo apoyas?',opciones:['Te quedas mirando','Respaldas por detrás de la jugada','Corres hacia el bateador'],correcta:1,accion:'respaldo'},
 {pregunta:'Dos jardineros van por la misma pelota: ¿qué necesitan hacer?',opciones:['Cerrar los ojos','Correr sin hablar','Comunicar quién hará la atrapada'],correcta:2,accion:'elevado'},
 {pregunta:'En un swing de práctica, ¿qué espacio necesitas?',opciones:['Un área despejada sin personas cerca','Un compañero junto al bate','Una fila delante del bateador'],correcta:0,accion:'bateo'},
 {pregunta:'Al recibir un rodado, ¿para qué acompaña la mano libre?',opciones:['Para tapar los ojos','Para asegurar la pelota','Para tocar el suelo'],correcta:1,accion:'rodado'},
 {pregunta:'Terminó el ejercicio de bateo: ¿qué haces con el bate?',opciones:['Lo lanzas hacia el equipo','Corres llevándolo en alto','Lo colocas con cuidado en un lugar seguro'],correcta:2,accion:'bateo'}
]
function Campo({accion}) {
 return <svg className="comunidad-campo" viewBox="0 0 400 180" role="img" aria-label={`Demostración ilustrada: ${accion}`}>
  <rect width="400" height="180" rx="14" fill="#196349"/><path d="M200 165L85 100L200 35L315 100Z" fill="#d4a76a"/><path d="M200 144L122 100L200 55L278 100Z" fill="#28734e"/>
  <path d="M200 165L25 65M200 165L375 65" stroke="#fff" strokeWidth="2"/>
  {[['200','35'],['85','100'],['315','100'],['200','165']].map(([x,y])=><rect key={x+y} x={Number(x)-5} y={Number(y)-5} width="10" height="10" fill="white"/>)}
  <circle cx="200" cy="90" r="9" fill="#ffc94a"/><path d="M200 102v22m0-14l-10 9m10-9l10 9m-10 5l-8 12m8-12l8 12" stroke="#ffd575" strokeWidth="5" strokeLinecap="round"/>
  {accion==='elevado'? <><circle cx="150" cy="70" r="8" fill="#8dd6ff"/><path d="M155 35Q200 0 250 35" stroke="white" strokeWidth="3" fill="none" strokeDasharray="5 5"/><text x="200" y="24" textAnchor="middle" fill="white" fontSize="14">¡MÍA!</text></>: <><path d="M200 160L200 128" stroke="white" strokeWidth="3" strokeDasharray="5 5"/><circle cx="200" cy="140" r="5" fill="white"/></>}
  {accion==='respaldo'&&<><circle cx="230" cy="80" r="8" fill="#8dd6ff"/><text x="248" y="84" fill="white" fontSize="13">Respaldo</text></>}
  {accion==='bateo'&&<path d="M215 155L235 120" stroke="#f8d17d" strokeWidth="6" strokeLinecap="round"/>}
 </svg>
}
export default function ComunidadJuegos({usuario,onLogin,onBateo}) {
 const [perfil,setPerfil]=useState(null),[nickname,setNickname]=useState(''),[mensaje,setMensaje]=useState(''),[ocupado,setOcupado]=useState(false)
 const [pantalla,setPantalla]=useState('inicio'),[historial,setHistorial]=useState([]),[liga,setLiga]=useState([]),[duelo,setDuelo]=useState(null),[codigo,setCodigo]=useState(''),[rivales,setRivales]=useState([])
 const [partida,setPartida]=useState(null),[indice,setIndice]=useState(0),[respuestas,setRespuestas]=useState([]),[seleccion,setSeleccion]=useState(null),[resultado,setResultado]=useState(null)
 const bloqueo=useRef(false),hoy=fechaPanama(),userId=usuario?.id
 const racha=calcularRacha(historial,hoy)
 useEffect(()=>{
  let vigente=true;setPerfil(null);setHistorial([]);setNickname('');setPartida(null);setResultado(null)
  if(!userId)return
  ;(async()=>{
   const p=await supabase.from('perfiles_juegos').select('nickname').eq('user_id',userId).maybeSingle()
   if(p.error)throw p.error
   const h=await supabase.from('resultados_juegos').select('modo,clave,aciertos,total,jonrones,puntos').eq('user_id',userId).order('created_at',{ascending:false}).limit(1000)
   if(h.error)throw h.error
   if(vigente){setPerfil(p.data);setNickname(p.data?.nickname||'');setHistorial(h.data||[])}
  })().catch(e=>{if(vigente)setMensaje(e.message)})
  return()=>{vigente=false}
 },[userId])
 useEffect(()=>{
  const invitacion=new URLSearchParams(window.location.search).get('duelo')
  if(invitacion&&/^[A-F0-9]{8}$/.test(invitacion)){setCodigo(invitacion);setPantalla('duelo')}
 },[])
 useEffect(()=>{
  let vigente=true
  async function actualizar(){
   if(pantalla==='liga'){
    const {data,error}=await supabase.rpc('clasificacion_jonrones_generales')
    if(vigente){if(error)setMensaje(error.message);else setLiga(data||[])}
   }
   if(pantalla==='duelo'&&duelo){
    const {data,error}=await supabase.from('resultados_juegos').select('aciertos,total,perfiles_juegos(nickname)').eq('modo','duelo').eq('clave',duelo).order('aciertos',{ascending:false}).limit(100)
    if(vigente){if(error)setMensaje(error.message);else setRivales(data||[])}
   }
  }
  actualizar();const intervalo=setInterval(actualizar,15000)
  return()=>{vigente=false;clearInterval(intervalo)}
 },[pantalla,duelo,resultado])
 async function guardarPerfil(e){
  e.preventDefault();if(!userId){onLogin?.();return}
  if(!/^[A-Za-z0-9_]{3,20}$/.test(nickname)){setMensaje('Usa de 3 a 20 letras, números o guion bajo.');return}
  setOcupado(true);setMensaje('Guardando nickname…')
  try{
   const consulta=perfil?supabase.from('perfiles_juegos').update({nickname}).eq('user_id',userId):supabase.from('perfiles_juegos').insert({user_id:userId,nickname})
   const {data,error}=await consulta.select('nickname').single();if(error)throw error
   setPerfil(data);setMensaje('✅ Nickname guardado.')
  }catch(e){setMensaje(e.code==='23505'?'Ese nickname ya está ocupado. Elige otro.':e.message)}finally{setOcupado(false)}
 }
 function abrir(modo){setPantalla(modo);setPartida(null);setResultado(null);setMensaje('')}
 function comenzar(modo,clave){
  const previo=historial.find(r=>r.modo===modo&&r.clave===clave)
  if(previo){setResultado(previo);setPartida(null);return}
  const banco=modo==='jugada'?jugadas:preguntas
  const lista=elegirPreguntas(banco,modo+clave,modo==='diario'?5:modo==='jugada'?1:10)
  setPartida({modo,clave,lista});setIndice(0);setRespuestas([]);setSeleccion(null);setResultado(null);bloqueo.current=false
 }
 async function siguiente(){
  if(seleccion===null||bloqueo.current)return
  const nuevas=[...respuestas,seleccion]
  if(indice<partida.lista.length-1){setRespuestas(nuevas);setIndice(indice+1);setSeleccion(null);return}
  bloqueo.current=true;setOcupado(true)
  const fin={modo:partida.modo,clave:partida.clave,aciertos:nuevas.reduce((s,r,i)=>s+Number(r===partida.lista[i].correcta),0),total:partida.lista.length}
  try{
   if(perfil){
    const {error}=await supabase.from('resultados_juegos').insert({...fin,user_id:userId})
    if(error){
     if(error.code!=='23505')throw error
     const {data,error:lectura}=await supabase.from('resultados_juegos').select('modo,clave,aciertos,total').eq('user_id',userId).eq('modo',fin.modo).eq('clave',fin.clave).single()
     if(lectura)throw lectura;Object.assign(fin,data)
    }
    setMensaje('✅ Resultado guardado.')
    setHistorial(h=>[fin,...h.filter(r=>!(r.modo===fin.modo&&r.clave===fin.clave))])
   }else setMensaje('Resultado de práctica. Crea tu nickname para guardar progreso y competir.')
   setResultado(fin);setPartida(null)
  }catch(e){setMensaje(`No se guardó: ${e.message}. Pulsa terminar para reintentar.`);bloqueo.current=false}
  finally{setOcupado(false)}
 }
 async function crearDuelo(){
  if(!perfil){setMensaje('Inicia sesión y guarda tu nickname para crear un duelo.');return}
  setOcupado(true)
  try{
   const nuevo=crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase()
   const {error}=await supabase.from('duelos_juegos').insert({codigo:nuevo,creador_id:userId});if(error)throw error
   setCodigo(nuevo);setDuelo(nuevo);setResultado(null);setMensaje('Duelo creado. Comparte el enlace con tus amigos.')
  }catch(e){setMensaje(e.message)}finally{setOcupado(false)}
 }
 async function entrarDuelo(){
  setOcupado(true);setResultado(null);setPartida(null)
  try{
   const clave=codigo.trim().toUpperCase()
   const {data,error}=await supabase.from('duelos_juegos').select('codigo').eq('codigo',clave).maybeSingle()
   if(error)throw error;if(!data)throw new Error('No encontramos ese código.')
   setDuelo(data.codigo);setMensaje('Todos responden las mismas diez preguntas. Un resultado por cuenta.')
  }catch(e){setMensaje(e.message)}finally{setOcupado(false)}
 }
 async function compartir(esDuelo=false){
  const url=new URL(window.location.href);url.search='';url.hash='';if(esDuelo)url.searchParams.set('duelo',duelo)
  const text=esDuelo?`⚾ ${perfil?.nickname||'Un amigo'} te reta en Generales. Código ${duelo}.`:`⚾ ${perfil?.nickname||'Yo'}: ${resultado?.aciertos}/${resultado?.total} en ${resultado?.modo==='jugada'?'Adivina la jugada':'el reto de Generales'}. ¿Puedes igualarme?`
  try{if(navigator.share)await navigator.share({title:'Generales de Chitré',text,url:url.href});else{await navigator.clipboard.writeText(`${text}\n${url.href}`);setMensaje('Enlace copiado para compartir.')}}catch(e){if(e.name!=='AbortError')setMensaje('No se pudo compartir. Copia el enlace: '+url.href)}
 }
 const actual=partida?.lista[indice]
 return <section className="comunidad-juegos">
  <header><small>COMPITE · APRENDE · COMPARTE</small><h3>Club de retos Generales</h3><p>Tu nickname, tus logros y un nuevo reto cada día.</p></header>
  <form className="comunidad-perfil" onSubmit={guardarPerfil}>
   <label>Tu nickname<input value={nickname} onChange={e=>setNickname(e.target.value)} maxLength={20} placeholder="Ejemplo: General_32" disabled={ocupado||!userId}/></label>
   <button disabled={ocupado} type="submit">{!userId?'Iniciar sesión':perfil?'Actualizar apodo':'Guardar apodo'}</button>
   <small>El apodo y tus resultados serán públicos. Tu correo no se muestra aquí.</small>
  </form>
  <nav className="comunidad-menu" aria-label="Nuevos retos">
   {[['diario','⚾','Reto del Día','5 preguntas nuevas'],['liga','🏆','Liga de jonrones','Clasificación semanal'],['logros','🔥','Rachas e insignias','Construye tu progreso'],['jugada','🧤','Adivina la jugada','Observa y decide'],['duelo','🎯','Duelo entre amigos','Comparte tu código']].map(([modo,icono,titulo,nota])=><button key={modo} type="button" onClick={()=>abrir(modo)} disabled={ocupado} aria-pressed={pantalla===modo}><span>{icono}</span><strong>{titulo}</strong><small>{nota}</small></button>)}
  </nav>
  {mensaje&&<p role="status" className="comunidad-mensaje">{mensaje}</p>}
  {pantalla==='logros'&&<div className="comunidad-panel"><h4>Tu colección</h4><p>🔥 Racha actual: <b>{racha} días</b></p><p>Se cuenta al terminar el Reto del Día. El día cambia a medianoche en Panamá.</p><div className="comunidad-insignias">{[['⚾ Primer reto',historial.some(r=>r.modo==='diario')],['🔥 Tres días',mejorRacha(historial)>=3],['🏅 Siete días',mejorRacha(historial)>=7],['💯 Perfecto',historial.some(r=>r.modo==='diario'&&r.aciertos===5)],['💥 Jonronero',historial.some(r=>r.jonrones>0)]].map(([nombre,ganada])=><span key={nombre} className={ganada?'ganada':''}>{ganada?'✓':'🔒'} {nombre}</span>)}</div>{!perfil&&<p>Guarda tu nickname para registrar tus logros.</p>}</div>}
  {pantalla==='liga'&&<div className="comunidad-panel"><h4>Liga semanal de jonrones</h4><p>Cuenta tu mejor partida terminada de esta semana. Desempate por puntos. Nueva semana: lunes, hora de Panamá.</p><button onClick={onBateo} type="button">⚾ Jugar Bateo Retro</button><button onClick={()=>supabase.rpc('clasificacion_jonrones_generales').then(({data,error})=>error?setMensaje(error.message):setLiga(data||[]))} type="button">Actualizar</button><ol className="comunidad-ranking">{liga.map((r,i)=><li key={r.nickname}><b>{i+1}. {r.nickname}</b><span>{r.jonrones} HR · {r.puntos} puntos</span></li>)}</ol>{!liga.length&&<p>La primera posición está esperando a un jonronero.</p>}</div>}
  {pantalla==='duelo'&&!partida&&<div className="comunidad-panel"><h4>Duelo entre amigos</h4><button onClick={crearDuelo} disabled={ocupado} type="button">Crear duelo</button><label>Código<input value={codigo} onChange={e=>setCodigo(e.target.value.toUpperCase())} maxLength={8} placeholder="Código de 8 caracteres"/></label><button onClick={entrarDuelo} disabled={ocupado} type="button">Entrar</button>{duelo&&<><p>Código: <b>{duelo}</b></p><button onClick={()=>compartir(true)} type="button">Compartir invitación</button><button onClick={()=>comenzar('duelo',duelo)} disabled={!perfil||ocupado} type="button">Responder las 10 preguntas</button>{!perfil&&<p>Guarda tu nickname para competir.</p>}<ol className="comunidad-ranking">{rivales.map((r,i)=><li key={r.perfiles_juegos?.nickname||i}><b>{r.perfiles_juegos?.nickname}</b><span>{r.aciertos}/{r.total}</span></li>)}</ol></>}</div>}
  {['diario','jugada'].includes(pantalla)&&!partida&&!resultado&&<div className="comunidad-panel"><h4>{pantalla==='diario'?'Reto del Día':'Adivina la jugada'}</h4><p>{hoy} · {pantalla==='diario'?'Cinco preguntas iguales para todos.':'Una situación ilustrada para decidir.'}</p><button type="button" onClick={()=>comenzar(pantalla,hoy)}>Comenzar / Ver mi resultado</button></div>}
  {actual&&<div className="comunidad-panel"><small>Pregunta {indice+1} de {partida.lista.length}</small>{actual.accion&&<Campo accion={actual.accion}/>}<h4>{actual.pregunta}</h4><div className="comunidad-respuestas">{actual.opciones.map((opcion,i)=><button type="button" key={i} disabled={seleccion!==null||ocupado} className={seleccion===i?'seleccionada':''} onClick={()=>setSeleccion(i)}>{opcion}</button>)}</div>{seleccion!==null&&partida.modo!=='duelo'&&<p>{seleccion===actual.correcta?'✅ Correcto.':'Respuesta correcta: '+actual.opciones[actual.correcta]}</p>}<button type="button" disabled={seleccion===null||ocupado} onClick={siguiente}>{ocupado?'Guardando…':indice===partida.lista.length-1?'Terminar':'Siguiente'}</button></div>}
  {resultado&&<div className="comunidad-panel comunidad-resultado"><h4>¡Reto completado!</h4><strong>{resultado.aciertos}/{resultado.total}</strong><p>{resultado.aciertos===resultado.total?'¡Excelente! Comparte tu resultado.':'Cada pregunta es una oportunidad para aprender.'}</p><button type="button" onClick={()=>compartir()}>Compartir resultado</button></div>}
 </section>
}
