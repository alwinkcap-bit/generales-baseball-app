import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './BateoRetro.css'

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

  function programarSiguiente() {
    if (!jugandoRef.current) return

    siguienteRef.current = window.setTimeout(() => {
      lanzarPelota()
    }, 900)
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

    programarSiguiente()
  }

  return createPortal(
    <div className="bateo-retro-fondo">
      <section className="bateo-retro">
        <header className="bateo-retro-header">
          <div>
            <small>GENERALES ARCADE</small>
            <h2>⚾ Bateo Retro</h2>
          </div>

          <button type="button" onClick={onCerrar} aria-label="Cerrar juego">
            ×
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

        <div className="bateo-retro-estadio">
          <div className="bateo-retro-cielo">
            <span>★ GENERALES DE CHITRÉ ★</span>
          </div>

          <div className="bateo-retro-publico"></div>
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
            <path
              className="linea-foul-svg"
              d="M 500 485 L 65 72"
            />
            <path
              className="linea-foul-svg"
              d="M 500 485 L 935 72"
            />

            <rect
              className="base-svg"
              x="273"
              y="285"
              width="28"
              height="28"
              transform="rotate(45 287 299)"
            />
            <rect
              className="base-svg"
              x="486"
              y="141"
              width="28"
              height="28"
              transform="rotate(45 500 155)"
            />
            <rect
              className="base-svg"
              x="699"
              y="285"
              width="28"
              height="28"
              transform="rotate(45 713 299)"
            />

            <path
              className="home-svg"
              d="M 482 457 L 518 457 L 518 478 L 500 494 L 482 478 Z"
            />
          </svg>

          <div className="bateo-retro-lanzador jugador-retro lanzador-retro">
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
