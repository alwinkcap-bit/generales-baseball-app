import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './BateoRetro.css'
import './BateoRetroConsola.css'

export default function BateoRetro({ onCerrar }) {
  const [jugando, setJugando] = useState(false)
  const [terminado, setTerminado] = useState(false)
  const [puntos, setPuntos] = useState(0)
  const [hits, setHits] = useState(0)
  const [jonrones, setJonrones] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [outs, setOuts] = useState(0)
  const [nivel, setNivel] = useState(1)
  const [mensaje, setMensaje] = useState('Pulsa COMENZAR')
  const [lanzamiento, setLanzamiento] = useState(0)
  const [duracion, setDuracion] = useState(1500)
  const [bateando, setBateando] = useState(false)
  const [pelotaActiva, setPelotaActiva] = useState(false)
  const [vueloJonron, setVueloJonron] = useState(false)
  const [record, setRecord] = useState(() => {
    try {
      return JSON.parse(
        window.localStorage.getItem('bateo-retro-record') ||
          '{"puntos":0,"nivel":1,"hits":0,"jonrones":0}'
      )
    } catch {
      return {
        puntos: 0,
        nivel: 1,
        hits: 0,
        jonrones: 0
      }
    }
  })

  const activoRef = useRef(false)
  const jugandoRef = useRef(false)
  const inicioRef = useRef(0)
  const duracionRef = useRef(1500)
  const temporizadorRef = useRef(null)
  const siguienteRef = useRef(null)
  const strikesRef = useRef(0)
  const outsRef = useRef(0)
  const hitsRef = useRef(0)

  useEffect(() => {
    return () => {
      window.clearTimeout(temporizadorRef.current)
      window.clearTimeout(siguienteRef.current)
    }
  }, [])

  useEffect(() => {
    const nuevoRecord = {
      puntos: Math.max(record.puntos || 0, puntos),
      nivel: Math.max(record.nivel || 1, nivel),
      hits: Math.max(record.hits || 0, hits),
      jonrones: Math.max(record.jonrones || 0, jonrones)
    }

    const mejoro =
      nuevoRecord.puntos !== record.puntos ||
      nuevoRecord.nivel !== record.nivel ||
      nuevoRecord.hits !== record.hits ||
      nuevoRecord.jonrones !== record.jonrones

    if (!mejoro) return

    setRecord(nuevoRecord)
    window.localStorage.setItem(
      'bateo-retro-record',
      JSON.stringify(nuevoRecord)
    )
  }, [puntos, nivel, hits, jonrones, record])

  function sonido(frecuencia, tiempo = 0.1) {
    try {
      const AudioContexto =
        window.AudioContext || window.webkitAudioContext
      const contexto = new AudioContexto()
      const oscilador = contexto.createOscillator()
      const ganancia = contexto.createGain()

      oscilador.frequency.value = frecuencia
      oscilador.type = 'square'
      ganancia.gain.setValueAtTime(0.08, contexto.currentTime)
      ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        contexto.currentTime + tiempo
      )

      oscilador.connect(ganancia)
      ganancia.connect(contexto.destination)
      oscilador.start()
      oscilador.stop(contexto.currentTime + tiempo)
    } catch {
      // El juego continúa aunque el navegador bloquee el sonido.
    }
  }

  function programarSiguiente(espera = 900) {
    if (!jugandoRef.current) return

    siguienteRef.current = window.setTimeout(() => {
      lanzarPelota()
    }, espera)
  }

  function terminarJuego() {
    jugandoRef.current = false
    activoRef.current = false
    setJugando(false)
    setPelotaActiva(false)
    setTerminado(true)
    setMensaje('FIN DEL JUEGO')
    sonido(120, 0.35)
  }

  function registrarStrike(texto = '¡STRIKE!') {
    activoRef.current = false
    setPelotaActiva(false)
    setMensaje(texto)
    sonido(180)

    if (strikesRef.current >= 2) {
      strikesRef.current = 0
      setStrikes(0)

      const nuevosOuts = outsRef.current + 1
      outsRef.current = nuevosOuts
      setOuts(nuevosOuts)

      if (nuevosOuts >= 3) {
        terminarJuego()
        return
      }

      setMensaje('¡PONCHADO!')
    } else {
      strikesRef.current += 1
      setStrikes(strikesRef.current)
    }

    programarSiguiente()
  }

  function registrarFoul() {
    activoRef.current = false
    setPelotaActiva(false)
    setMensaje('¡FOUL!')
    sonido(260)

    if (strikesRef.current < 2) {
      strikesRef.current += 1
      setStrikes(strikesRef.current)
    }

    programarSiguiente()
  }

  function lanzarPelota() {
    setVueloJonron(false)
    if (!jugandoRef.current || activoRef.current) return

    const nivelActual = Math.min(10, Math.floor(hitsRef.current / 3) + 1)
    const nuevaDuracion = Math.max(720, 1550 - (nivelActual - 1) * 85)

    setNivel(nivelActual)
    setDuracion(nuevaDuracion)
    duracionRef.current = nuevaDuracion
    inicioRef.current = performance.now()
    activoRef.current = true

    setMensaje('¡LANZAMIENTO!')
    setLanzamiento((actual) => actual + 1)
    setPelotaActiva(true)

    window.clearTimeout(temporizadorRef.current)

    temporizadorRef.current = window.setTimeout(() => {
      if (activoRef.current) {
        registrarStrike('¡STRIKE CANTADO!')
      }
    }, nuevaDuracion + 80)
  }

  function comenzarJuego() {
    setVueloJonron(false)
    window.clearTimeout(temporizadorRef.current)
    window.clearTimeout(siguienteRef.current)

    strikesRef.current = 0
    outsRef.current = 0
    hitsRef.current = 0
    jugandoRef.current = true
    activoRef.current = false

    setPuntos(0)
    setHits(0)
    setJonrones(0)
    setStrikes(0)
    setOuts(0)
    setNivel(1)
    setTerminado(false)
    setJugando(true)
    setPelotaActiva(false)
    setMensaje('¡PREPÁRATE!')

    siguienteRef.current = window.setTimeout(lanzarPelota, 850)
  }

  function batear() {
    if (!jugandoRef.current || !activoRef.current) return

    setBateando(true)
    window.setTimeout(() => setBateando(false), 220)

    window.clearTimeout(temporizadorRef.current)

    const transcurrido = performance.now() - inicioRef.current
    const posicion = transcurrido / duracionRef.current

    activoRef.current = false
    setPelotaActiva(false)

    if (posicion >= 0.77 && posicion <= 0.86) {
      setVueloJonron(true)
      const puntosJonron = 100 * nivel

      hitsRef.current += 1
      setHits(hitsRef.current)
      setJonrones((actual) => actual + 1)
      setPuntos((actual) => actual + puntosJonron)
      setStrikes(0)
      strikesRef.current = 0
      setMensaje('💥 ¡JONRÓN!')
      sonido(620, 0.25)
    } else if (posicion >= 0.70 && posicion <= 0.93) {
      const distanciaCentro = Math.abs(0.815 - posicion)
      const esDoble = distanciaCentro < 0.075
      const puntosHit = (esDoble ? 50 : 25) * nivel

      hitsRef.current += 1
      setHits(hitsRef.current)
      setPuntos((actual) => actual + puntosHit)
      setStrikes(0)
      strikesRef.current = 0
      setMensaje(esDoble ? '⚾ ¡DOBLE!' : '⚾ ¡HIT!')
      sonido(esDoble ? 500 : 420, 0.18)
    } else if (
      (posicion >= 0.57 && posicion < 0.70) ||
      (posicion > 0.93 && posicion <= 1.03)
    ) {
      registrarFoul()
      return
    } else {
      registrarStrike(
        posicion < 0.57 ? '¡MUY TEMPRANO!' : '¡MUY TARDE!'
      )
      return
    }

    programarSiguiente(
      posicion >= 0.77 && posicion <= 0.86 ? 2400 : 900
    )
  }

  return createPortal(
    <div className="bateo-retro-fondo">
      <section className="bateo-retro">
        <header className="bateo-retro-header">
          <div>
            <small>GENERALES ARCADE</small>
            <h2>BATEO RETRO</h2>
          </div>

          <button type="button" onClick={onCerrar} aria-label="Regresar al inicio">
            ← Regresar
          </button>
        </header>

        <div className="bateo-retro-marcador">
          <span>
            PUNTOS
            <b>{String(puntos).padStart(5, '0')}</b>
          </span>

          <span>
            NIVEL
            <b>{nivel}</b>
          </span>

          <span>
            HITS
            <b>{hits}</b>
          </span>

          <span>
            HR
            <b>{jonrones}</b>
          </span>
        </div>

        <div className="bateo-retro-record">
          <span>🏆 RÉCORD</span>
          <strong>{String(record.puntos).padStart(5, '0')} puntos</strong>
          <small>
            Nivel {record.nivel} · {record.hits} hits ·{' '}
            {record.jonrones} HR
          </small>
        </div>

        <div className="bateo-retro-estadio">
          <div className="retro-luces" aria-hidden="true">
            <i></i><i></i>
          </div>
          <div className="retro-cartel" aria-hidden="true">
            GENERALES PARK · CHITRÉ
          </div>
          {!jugando && (
            <div className="retro-presentacion">
              <small>GENERALES ARCADE · BASEBALL</small>
              <strong>{terminado ? 'FIN DE PARTIDA' : 'BATEO RETRO'}</strong>
              <span>
                {terminado
                  ? `${puntos} PUNTOS · ${jonrones} JONRONES`
                  : 'TU MOMENTO. TU SWING.'}
              </span>
              <button type="button" onClick={comenzarJuego}>
                {terminado ? 'VOLVER A JUGAR' : 'PRESIONA PARA JUGAR'}
              </button>
            </div>
          )}

          <div className="bateo-retro-cielo">
            <span>★ GENERALES DE CHITRÉ ★</span>
          </div>

          
          <div className={`retro-gradas ${vueloJonron ? 'retro-gradas-celebrando' : ''}`} aria-hidden="true">
            {Array.from({ length: 4 }, (_, fila) => (
              <div className="retro-fila-publico" key={fila}>
                {Array.from({ length: 36 }, (_, asiento) => (
                  <i key={asiento}
                    style={{
                      '--camisa': ['#e9bd59', '#54a3ce', '#e46d62', '#e3e8ee'][
                        (asiento + fila * 3) % 4
                      ]
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="retro-cerca" aria-hidden="true">
            <span>GENERALES</span>
            <span>CHITRÉ</span>
            <span>400</span>
            <span>BASEBALL</span>
            <span>PLAY BALL</span>
          </div>

          <div className="bateo-retro-campo"></div>
          <div className="bateo-retro-tierra"></div>

          <div className="bateo-retro-linea-foul foul-izquierda"></div>
          <div className="bateo-retro-linea-foul foul-derecha"></div>

          <div className="bateo-retro-base base-primera" title="Primera base"></div>
          <div className="bateo-retro-base base-segunda" title="Segunda base"></div>
          <div className="bateo-retro-base base-tercera" title="Tercera base"></div>

          <div className="bateo-retro-monticulo"></div>

          
<svg
  className="bateo-retro-diamante-svg"
  viewBox="0 0 1000 500"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  {/* Cuadro: segunda arriba, home abajo */}
  <path
    d="M500 235 L790 330 L500 485 L210 330 Z"
    fill="#d5a064"
    stroke="#a8753f"
    strokeWidth="4"
  />
  <path
    d="M500 260 L715 334 L500 447 L285 334 Z"
    fill="#27804e"
    stroke="#206c43"
    strokeWidth="3"
  />

  {/* Lineas de foul desde home */}
  <path
    d="M90 267 L500 475 L910 267"
    fill="none"
    stroke="#fff5de"
    strokeWidth="3"
  />

  {/* Caminos entre las cuatro bases */}
  <path
    d="M500 475 L760 330 L500 247 L240 330 Z"
    fill="none"
    stroke="#efd0a0"
    strokeWidth="3"
  />

  {/* Tierra alrededor de home */}
  <ellipse cx="500" cy="472" rx="48" ry="20"
    fill="#d5a064" />

  {/* Monticulo y goma */}
  <ellipse cx="500" cy="290" rx="49" ry="17"
    fill="#a8753f" />
  <ellipse cx="500" cy="286" rx="46" ry="15"
    fill="#e1b27b" stroke="#bd874c" strokeWidth="3" />
  <rect x="484" y="282" width="32" height="5"
    fill="#fff4dc" />

  {/* Tercera, segunda y primera */}
  <g fill="#fff9e8" stroke="#b6c5c9" strokeWidth="2">
    <path d="M240 320 L258 330 L240 340 L222 330 Z" />
    <path d="M500 239 L514 247 L500 255 L486 247 Z" />
    <path d="M760 320 L778 330 L760 340 L742 330 Z" />
    <path d="M484 459 L516 459 L516 473 L500 485 L484 473 Z" />
  </g>

  {/* Cajas del bateador */}
  <g fill="none" stroke="#fff5de" strokeWidth="2" opacity=".75">
    <path d="M440 447 H471 V482 H440 Z" />
    <path d="M529 447 H560 V482 H529 Z" />
  </g>
</svg>


          <div className={`bateo-retro-lanzador jugador-retro lanzador-retro ${
              pelotaActiva ? 'lanzando' : ''
            }`}>
            <div className="jugador-cabeza">
              <span className="jugador-gorra"></span>
              <span className="jugador-cara"></span>
            </div>

            <div className="jugador-cuerpo">
              <span className="jugador-numero">G</span>
              <span className="jugador-brazo brazo-izquierdo"></span>
              <span className="jugador-brazo brazo-derecho"></span>
              <span className="jugador-guante"></span>
            </div>

            <div className="jugador-piernas">
              <span></span>
              <span></span>
            </div>
          </div>
          <div
            className={`bateo-retro-bateador jugador-retro bateador-retro ${
              bateando ? 'bateando' : ''
            }`}
          >
            <div className="jugador-cabeza">
              <span className="jugador-casco"></span>
              <span className="jugador-cara"></span>
            </div>

            <div className="jugador-cuerpo">
              <span className="jugador-numero">G</span>
              <span className="jugador-brazo brazo-izquierdo"></span>
              <span className="jugador-brazo brazo-derecho"></span>
            </div>

            <div className="jugador-piernas">
              <span></span>
              <span></span>
            </div>

            <span className="jugador-bate"></span>
          </div>

          <div className="bateo-retro-home">◆</div>

          {pelotaActiva && (
            <span
              key={lanzamiento}
              className="bateo-retro-pelota"
              style={{ animationDuration: `${duracion}ms` }}
            >
              ⚾
            </span>
          )}

          
          {vueloJonron && (
            <svg
              key={`jonron-${lanzamiento}`}
              className="retro-vuelo-jonron"
              viewBox="0 0 1000 500"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="retro-estela-jonron"
                d="M500 465 Q650 -70 790 155"
                fill="none"
                stroke="#ffe19a"
                strokeWidth="3"
                strokeDasharray="8 10"
              />
              <g>
                <animateMotion
                  dur="2s"
                  path="M500 465 Q650 -70 790 155"
                  calcMode="paced"
                  fill="freeze"
                />
                <circle r="13" fill="#ffdd75" opacity=".25" />
                <circle r="7" fill="#fff" stroke="#cabca4" strokeWidth="1" />
                <path
                  d="M-3 -5 Q1 0 -3 5 M3 -5 Q-1 0 3 5"
                  fill="none"
                  stroke="#c83434"
                  strokeWidth="1.3"
                />
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  from="1.3"
                  to=".65"
                  dur="2s"
                  fill="freeze"
                />
              </g>
            </svg>
          )}

          <div className="bateo-retro-mensaje">{mensaje}</div>
        </div>

        <div className="bateo-retro-conteo">
          <span>
            STRIKES
            <i className={strikes >= 1 ? 'encendido' : ''}></i>
            <i className={strikes >= 2 ? 'encendido' : ''}></i>
          </span>

          <span>
            OUTS
            <i className={outs >= 1 ? 'rojo' : ''}></i>
            <i className={outs >= 2 ? 'rojo' : ''}></i>
            <i className={outs >= 3 ? 'rojo' : ''}></i>
          </span>
        </div>

        <div className="bateo-retro-controles">
          {!jugando ? (
            <button
              type="button"
              className="bateo-retro-comenzar"
              onClick={comenzarJuego}
            >
              {terminado ? 'JUGAR DE NUEVO' : 'COMENZAR'}
            </button>
          ) : (
            <button
              type="button"
              className={`bateo-retro-boton-batear ${
                pelotaActiva ? 'listo' : ''
              }`}
              onClick={batear}
              disabled={!pelotaActiva}
            >
              BATEAR
            </button>
          )}
        </div>

        <p className="bateo-retro-ayuda">
          Espera que la pelota se acerque al bateador y pulsa
          <strong> BATEAR</strong>. Mientras más preciso seas, más lejos
          viajará la pelota.
        </p>
      </section>
    </div>,
    document.body
  )
}
