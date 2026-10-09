import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './CorreBases.css'

const bases = [
  { x: 250, y: 360, nombre: 'Home' },
  { x: 410, y: 220, nombre: 'Primera' },
  { x: 250, y: 80, nombre: 'Segunda' },
  { x: 90, y: 220, nombre: 'Tercera' }
]

function leerRecord(modo) {
  try { return Number(localStorage.getItem(`generales-bases-${modo}`)) || 0 }
  catch { return 0 }
}

function nuevaPartida(modo) {
  return {
    modo, base: 0, avance: 0, corriendo: false, deslizando: false,
    tiempoTramo: 0, limiteTiro: Infinity, bola: 0,
    reloj: 0, carreras: 0, outs: 0, puntos: 0, nivel: 1,
    pausa: 0, final: false, mensaje: '¡Batazo! Observa al defensor.'
  }
}

export default function CorreBases({ onCerrar }) {
  const motor = useRef(null)
  const [modo, setModo] = useState('facil')
  const [estado, setEstado] = useState('inicio')
  const [vista, setVista] = useState(() => nuevaPartida('facil'))
  const [record, setRecord] = useState(() => leerRecord('facil'))

  useEffect(() => { setRecord(leerRecord(modo)) }, [modo])

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [])

  useEffect(() => {
    if (estado !== 'jugando') return
    let frame
    let previo = performance.now()
    let actualizar = 0

    function resolver(g, safe) {
      if (safe) {
        g.base = (g.base + 1) % 4
        g.puntos += 20
        g.mensaje = `¡Safe en ${bases[g.base].nombre}!`
        if (g.base === 0) {
          g.carreras++
          g.puntos += 100
          g.nivel = 1 + Math.floor(g.carreras / 2)
          g.mensaje = '¡Carrera para Generales!'
        }
      } else {
        g.outs++
        g.base = 0
        g.mensaje = '¡Out! Vuelve a intentarlo.'
        if (g.outs >= 3) {
          g.final = true
          const mejor = Math.max(leerRecord(g.modo), g.puntos)
          try {
            localStorage.setItem(`generales-bases-${g.modo}`, String(mejor))
          } catch {}
          setRecord(mejor)
        }
      }
      g.corriendo = false
      g.avance = 0
      g.deslizando = false
      g.bola = 0
      g.pausa = 1.2
    }

    function tick(ahora) {
      const g = motor.current
      if (!g) return
      const dt = Math.min((ahora - previo) / 1000, 0.05)
      previo = ahora

      if (!document.hidden && document.hasFocus()) {
        g.reloj += dt
        if (g.pausa > 0) {
          g.pausa = Math.max(0, g.pausa - dt)
        } else if (g.corriendo) {
          g.tiempoTramo += dt
          g.avance = Math.min(
            1, g.avance + dt / (g.modo === 'facil' ? 1.65 : 1.85)
          )
          g.bola = Number.isFinite(g.limiteTiro)
            ? Math.min(1, g.tiempoTramo / g.limiteTiro) : 0

          const tiempoOut = g.limiteTiro + (g.deslizando ? 0.35 : 0)
          if (g.avance >= 1) resolver(g, g.tiempoTramo <= tiempoOut)
          else if (g.tiempoTramo > tiempoOut) resolver(g, false)
        }
      }

      actualizar += dt
      if (actualizar >= 0.04 || g.final) {
        setVista({ ...g })
        actualizar = 0
      }
      if (g.final) {
        setEstado('final')
        return
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [estado])

  function comenzar() {
    motor.current = nuevaPartida(modo)
    setVista({ ...motor.current })
    setEstado('jugando')
  }

  function correr() {
    const g = motor.current
    if (!g || g.corriendo || g.pausa > 0 || g.final) return
    const fase = g.reloj % 5
    const lejos = fase < 2.5
    const preparando = fase >= 2.5 && fase < 3.6
    g.limiteTiro = Math.max(
      0.65,
      (lejos ? 2.65 : preparando ? 1.65 : 0.9) -
      (g.nivel - 1) * 0.1 -
      (g.modo === 'normal' ? 0.2 : 0)
    )
    g.corriendo = true
    g.avance = 0
    g.tiempoTramo = 0
    g.deslizando = false
    g.mensaje = `¡Corre hacia ${bases[(g.base + 1) % 4].nombre}!`
    setVista({ ...g })
  }

  function quedarse() {
    const g = motor.current
    if (!g || g.corriendo || g.pausa > 0 || g.final) return
    g.mensaje = 'Estás seguro en la base. Espera una oportunidad.'
    setVista({ ...g })
  }

  function deslizarse() {
    const g = motor.current
    if (!g || !g.corriendo || g.deslizando) return
    if (g.avance < 0.65 || g.avance > 0.95) {
      g.mensaje = '¡Deslízate cuando estés más cerca de la base!'
    } else {
      g.deslizando = true
      g.avance = Math.min(1, g.avance + 0.12)
      g.mensaje = '¡Deslizamiento! Tienes una ventaja contra el tiro.'
    }
    setVista({ ...g })
  }

  const desde = bases[vista.base]
  const hasta = bases[(vista.base + 1) % 4]
  const x = desde.x + (hasta.x - desde.x) * vista.avance
  const y = desde.y + (hasta.y - desde.y) * vista.avance
  const fase = vista.reloj % 5
  const aviso = fase < 2.5
    ? ['lejos', 'Defensor lejos', '¡Avanza!']
    : fase < 3.6
      ? ['prepara', 'Preparando el tiro', '¡Cuidado!']
      : ['listo', 'Listo para lanzar', '¡Espera!']

  return createPortal(
    <div className="bases-fondo">
      <section className="bases-panel" role="dialog" aria-modal="true"
        aria-labelledby="bases-titulo">
        <header className="bases-header">
          <div><small>GENERALES DE CHITRÉ</small>
            <h2 id="bases-titulo">Corre las bases</h2></div>
          <button type="button" onClick={onCerrar}
            aria-label="Volver a juegos">×</button>
        </header>

        <div className="bases-marcador">
          <span>🏠 Carreras: <b>{vista.carreras}</b></span>
          <span>Outs: <b>{vista.outs}/3</b></span>
          <span>⭐ <b>{vista.puntos}</b></span>
          <span>🏆 Récord: <b>{record}</b></span>
        </div>

        {estado === 'jugando' ? (
          <>
            <div className={`bases-aviso bases-${aviso[0]}`}>
              {vista.corriendo ? '¡El tiro va hacia la base!' :
                `${aviso[1]}${modo === 'facil' ? ` · ${aviso[2]}` : ''}`}
            </div>
            <svg viewBox="0 0 500 420" className="bases-campo"
              role="img" aria-label="Diamante con el corredor y el tiro hacia la base">
              <rect width="500" height="420" rx="20" fill="#1c6545" />
              <path d="M250 360 L410 220 L250 80 L90 220 Z"
                fill="#ae7746" stroke="#eedac0" strokeWidth="5" />
              <path d="M250 327 L375 220 L250 113 L125 220 Z"
                fill="#26734d" />
              <circle cx="250" cy="220" r="20" fill="#ae7746" />
              <text x="250" y="38" textAnchor="middle" fill="#f5cd65"
                fontSize="16" fontWeight="bold">GENERALES DE CHITRÉ</text>
              {bases.map((base, i) => (
                <g key={base.nombre}>
                  <rect x={base.x - 8} y={base.y - 8} width="16" height="16"
                    fill="white" transform={`rotate(45 ${base.x} ${base.y})`} />
                  <text x={base.x} y={base.y + (i === 2 ? -22 : 32)}
                    textAnchor="middle" fill="white" fontSize="13">
                    {base.nombre}
                  </text>
                </g>
              ))}
              <g transform="translate(250 200)">
                <circle cy="-10" r="8" fill="#efc49b" />
                <rect x="-9" y="-2" width="18" height="20" rx="4" fill="#e64d4d" />
                <path d="M-5 18 L-7 30 M5 18 L7 30" stroke="#fff" strokeWidth="5" />
              </g>
              {vista.corriendo && (
                <circle
                  cx={250 + (hasta.x - 250) * vista.bola}
                  cy={200 + (hasta.y - 200) * vista.bola}
                  r="6" fill="#fff" stroke="#dd4141" strokeWidth="2" />
              )}
              <g transform={`translate(${x} ${y - 13}) rotate(${vista.deslizando ? -55 : 0})`}>
                <ellipse cy="29" rx="15" ry="5" fill="#0004" />
                <circle cy="-10" r="9" fill="#efc49b" />
                <path d="M-10 -13 Q0 -27 10 -13" fill="#081b30" />
                <rect x="-10" y="0" width="20" height="20" rx="4"
                  fill="#102d59" stroke="#f5cd65" strokeWidth="2" />
                <text x="0" y="14" textAnchor="middle" fill="#f5cd65"
                  fontSize="10" fontWeight="bold">G</text>
                <path d="M-5 20 L-8 29 M5 20 L8 29"
                  stroke="white" strokeWidth="5" />
              </g>
            </svg>
            <p className="bases-mensaje" aria-live="polite">{vista.mensaje}</p>
            <div className="bases-controles">
              <button type="button" onClick={correr}
                disabled={vista.corriendo || vista.pausa > 0}>🏃 Correr</button>
              <button type="button" onClick={quedarse}
                disabled={vista.corriendo || vista.pausa > 0}>✋ Quedarse</button>
              <button type="button" onClick={deslizarse}
                disabled={!vista.corriendo || vista.deslizando}>💨 Deslizarse</button>
            </div>
            <p className="bases-ayuda">
              Deslízate al completar entre el 65% y el 95% del trayecto.
              Nivel {vista.nivel}.
            </p>
          </>
        ) : (
          <div className="bases-portada">
            <div className="bases-icono">🏃⚾</div>
            <h3>{estado === 'final' ? '¡Partida terminada!' : '¡Anota para Generales!'}</h3>
            <p>{estado === 'final'
              ? `${vista.carreras} carreras · ${vista.puntos} puntos`
              : 'Completa las cuatro bases. La partida termina con tres outs.'}</p>
            <p>Observa al defensor antes de correr y deslízate cerca de la base.</p>
            <div className="bases-controles">
              <button type="button" aria-pressed={modo === 'facil'}
                onClick={() => setModo('facil')}>Fácil</button>
              <button type="button" aria-pressed={modo === 'normal'}
                onClick={() => setModo('normal')}>Normal</button>
            </div>
            <button type="button" className="bases-iniciar" onClick={comenzar}>
              {estado === 'final' ? 'Volver a jugar' : 'Comenzar'}
            </button>
            <p className="bases-ayuda">
              Juego de reflejos con reglas simplificadas.
              Récord guardado en este dispositivo.
            </p>
          </div>
        )}
      </section>
    </div>, document.body
  )
}
