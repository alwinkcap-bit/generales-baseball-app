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
  const [carrerasVisitante, setCarrerasVisitante] = useState(
  Array(9).fill(0)
)
const [carrerasLocal, setCarrerasLocal] = useState(
  Array(9).fill(0)
)
const [hitsVisitante, setHitsVisitante] = useState(0)
const [erroresVisitante, setErroresVisitante] = useState(0)
const [hitsLocal, setHitsLocal] = useState(0)
const [erroresLocal, setErroresLocal] = useState(0)
const [primeraBase, setPrimeraBase] = useState(false)
const [segundaBase, setSegundaBase] = useState(false)
const [terceraBase, setTerceraBase] = useState(false)
function cambiarCarrera(equipo, cantidad) {
  if (inning < 1 || inning > 9) return

  const posicion = inning - 1
  const actualizarEntradas =
    equipo === 'visitante'
      ? setCarrerasVisitante
      : setCarrerasLocal

  actualizarEntradas((entradasActuales) => {
    const nuevasEntradas = [...entradasActuales]
    const nuevaCantidad = Math.max(
      0,
      nuevasEntradas[posicion] + cantidad
    )

    nuevasEntradas[posicion] = nuevaCantidad

    const total = nuevasEntradas.reduce(
      (suma, carreras) => suma + carreras,
      0
    )

    if (equipo === 'visitante') {
      setVisitante(total)
    } else {
      setLocal(total)
    }

    return nuevasEntradas
  })
}
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
    setPrimeraBase(false)
setSegundaBase(false)
setTerceraBase(false)
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
    setCarrerasVisitante(Array(9).fill(0))
setCarrerasLocal(Array(9).fill(0))
setHitsVisitante(0)
setErroresVisitante(0)
setHitsLocal(0)
setErroresLocal(0)
setPrimeraBase(false)
setSegundaBase(false)
setTerceraBase(false)
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
                onClick={() => cambiarCarrera('visitante', -1)}
              >
                −
              </button>

              <button
                type="button"
                onClick={() => cambiarCarrera('visitante', 1)}
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
               onClick={() => cambiarCarrera('local', -1)}
              >
                −
              </button>

              <button
                type="button"
               onClick={() => cambiarCarrera('local', 1)}
              >
                +
              </button>
            </div>
          </article>
        </div>
<div className="scoreboard-linea-contenedor">
  <table className="scoreboard-linea">
    <thead>
      <tr>
        <th>EQUIPO</th>

        {Array.from({ length: 9 }, (_, indice) => (
          <th
            key={indice}
            className={inning === indice + 1 ? 'entrada-actual' : ''}
          >
            {indice + 1}
          </th>
        ))}

        <th>R</th>
        <th>H</th>
<th>E</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <th>Visitante</th>

        {carrerasVisitante.map((carreras, indice) => (
          <td
            key={indice}
            className={
              inning === indice + 1 && parte === 'Alta'
                ? 'equipo-bateando'
                : ''
            }
          >
            {carreras}
          </td>
        ))}

        <td className="total">{visitante}</td>
        <td>{hitsVisitante}</td>
<td>{erroresVisitante}</td>
      </tr>

      <tr>
        <th>Generales</th>

        {carrerasLocal.map((carreras, indice) => (
          <td
            key={indice}
            className={
              inning === indice + 1 && parte === 'Baja'
                ? 'equipo-bateando'
                : ''
            }
          >
            {carreras}
          </td>
        ))}

        <td className="total">{local}</td>
        <td>{hitsLocal}</td>
<td>{erroresLocal}</td>
      </tr>
    </tbody>
  </table>
</div>
<div className="scoreboard-estadisticas">
  <div className="scoreboard-estadisticas-titulos">
    <span>EQUIPO</span>
    <span>HITS</span>
    <span>ERRORES</span>
  </div>

  <div className="scoreboard-estadisticas-fila">
    <strong>Visitante</strong>

    <div className="scoreboard-ajuste">
      <button
        type="button"
        onClick={() =>
          setHitsVisitante((actual) => Math.max(0, actual - 1))
        }
      >
        −
      </button>
      <span>{hitsVisitante}</span>
      <button
        type="button"
        onClick={() => setHitsVisitante((actual) => actual + 1)}
      >
        +
      </button>
    </div>

    <div className="scoreboard-ajuste">
      <button
        type="button"
        onClick={() =>
          setErroresVisitante((actual) => Math.max(0, actual - 1))
        }
      >
        −
      </button>
      <span>{erroresVisitante}</span>
      <button
        type="button"
        onClick={() => setErroresVisitante((actual) => actual + 1)}
      >
        +
      </button>
    </div>
  </div>

  <div className="scoreboard-estadisticas-fila">
    <strong>Generales</strong>

    <div className="scoreboard-ajuste">
      <button
        type="button"
        onClick={() =>
          setHitsLocal((actual) => Math.max(0, actual - 1))
        }
      >
        −
      </button>
      <span>{hitsLocal}</span>
      <button
        type="button"
        onClick={() => setHitsLocal((actual) => actual + 1)}
      >
        +
      </button>
    </div>

    <div className="scoreboard-ajuste">
      <button
        type="button"
        onClick={() =>
          setErroresLocal((actual) => Math.max(0, actual - 1))
        }
      >
        −
      </button>
      <span>{erroresLocal}</span>
      <button
        type="button"
        onClick={() => setErroresLocal((actual) => actual + 1)}
      >
        +
      </button>
    </div>
  </div>
</div>
<div className="scoreboard-bases">
  <button
    type="button"
    className={
      segundaBase
        ? 'base ocupada base-segunda'
        : 'base base-segunda'
    }
    onClick={() => setSegundaBase((actual) => !actual)}
  >
    2
  </button>

  <button
    type="button"
    className={
      terceraBase
        ? 'base ocupada base-tercera'
        : 'base base-tercera'
    }
    onClick={() => setTerceraBase((actual) => !actual)}
  >
    3
  </button>

  <div className="base-home">⌂</div>

  <button
    type="button"
    className={
      primeraBase
        ? 'base ocupada base-primera'
        : 'base base-primera'
    }
    onClick={() => setPrimeraBase((actual) => !actual)}
  >
    1
  </button>

  <span>CORREDORES EN BASE</span>
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