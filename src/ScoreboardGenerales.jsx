import React, { useState } from 'react'
import './ScoreboardGenerales.css'

export default function ScoreboardGenerales({ onCerrar }) {
  const [visitante, setVisitante] = useState(0)
  const [local, setLocal] = useState(0)
  const [inning, setInning] = useState(1)
  const [parte, setParte] = useState('Alta')
  const [bolas, setBolas] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [outs, setOuts] = useState(0)

  function cambiarInning() {
    if (parte === 'Alta') {
      setParte('Baja')
    } else {
      setParte('Alta')
      setInning((actual) => actual + 1)
    }

    setBolas(0)
    setStrikes(0)
    setOuts(0)
  }

  function sumarBola() {
    if (bolas >= 3) {
      setBolas(0)
      setStrikes(0)
    } else {
      setBolas((actual) => actual + 1)
    }
  }

  function sumarStrike() {
    if (strikes >= 2) {
      setStrikes(0)
      setBolas(0)
      setOuts((actual) => Math.min(actual + 1, 3))
    } else {
      setStrikes((actual) => actual + 1)
    }
  }

  function reiniciar() {
    const confirmar = window.confirm(
      '¿Deseas reiniciar completamente el marcador?'
    )

    if (!confirmar) return

    setVisitante(0)
    setLocal(0)
    setInning(1)
    setParte('Alta')
    setBolas(0)
    setStrikes(0)
    setOuts(0)
  }

  return (
    <div className="scoreboard-fondo">
      <section className="scoreboard">
        <button
          type="button"
          className="scoreboard-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar marcador"
        >
          ×
        </button>

        <header className="scoreboard-encabezado">
          <span>TRANSMISIÓN EN VIVO</span>
          <h1>⚾ Scoreboard Generales</h1>
          <p>Generales de Chitré Baseball Academy</p>
        </header>

        <div className="scoreboard-equipos">
          <article className="scoreboard-equipo">
            <small>VISITANTE</small>
            <h2>Visitante</h2>
            <strong>{visitante}</strong>

            <div className="scoreboard-controles-carrera">
              <button
                type="button"
                onClick={() =>
                  setVisitante((actual) => Math.max(0, actual - 1))
                }
              >
                −
              </button>

              <button
                type="button"
                onClick={() =>
                  setVisitante((actual) => actual + 1)
                }
              >
                +
              </button>
            </div>
          </article>

          <div className="scoreboard-vs">VS</div>

          <article className="scoreboard-equipo scoreboard-local">
            <small>LOCAL</small>
            <h2>Generales</h2>
            <strong>{local}</strong>

            <div className="scoreboard-controles-carrera">
              <button
                type="button"
                onClick={() =>
                  setLocal((actual) => Math.max(0, actual - 1))
                }
              >
                −
              </button>

              <button
                type="button"
                onClick={() =>
                  setLocal((actual) => actual + 1)
                }
              >
                +
              </button>
            </div>
          </article>
        </div>

        <div className="scoreboard-inning">
          <small>ENTRADA</small>
          <strong>{inning}</strong>
          <span>{parte} ▲</span>

          <button type="button" onClick={cambiarInning}>
            Siguiente mitad →
          </button>
        </div>

        <div className="scoreboard-conteo">
          <button type="button" onClick={sumarBola}>
            <span>BOLAS</span>
            <strong>{bolas}</strong>
          </button>

          <button type="button" onClick={sumarStrike}>
            <span>STRIKES</span>
            <strong>{strikes}</strong>
          </button>

          <button
            type="button"
            onClick={() =>
              setOuts((actual) => (actual >= 3 ? 0 : actual + 1))
            }
          >
            <span>OUTS</span>
            <strong>{outs}</strong>
          </button>
        </div>

        <div className="scoreboard-acciones">
          <button type="button" onClick={reiniciar}>
            Reiniciar juego
          </button>
        </div>
      </section>
    </div>
  )
}