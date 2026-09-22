import React, { useState } from 'react'
import './ScoreboardGenerales.css'
import logoGenerales from './public/logo-generales.png'

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
const [primeraBase, setPrimeraBase] = useState(null)
const [segundaBase, setSegundaBase] = useState(null)
const [terceraBase, setTerceraBase] = useState(null)
const [estadoPartido, setEstadoPartido] = useState('Por comenzar')
const [lineupsOpen, setLineupsOpen] = useState(false)
const [reporteOpen, setReporteOpen] = useState(false)
const [lineupActivo, setLineupActivo] = useState('visitante')
const [lineupVisitante, setLineupVisitante] = useState(
  Array.from({ length: 20 }, () => ({
    numero: '',
    nombre: '',
    posicion: '',
    entradas: Array(9).fill('')
  }))
)

const [lineupLocal, setLineupLocal] = useState(
  Array.from({ length: 20 }, () => ({
    numero: '',
    nombre: '',
    posicion: '',
    entradas: Array(9).fill('')
  }))
)
const [turnoVisitante, setTurnoVisitante] = useState(0)
const [turnoLocal, setTurnoLocal] = useState(0)
const [historialJugadas, setHistorialJugadas] = useState([])
const [jugadaActual, setJugadaActual] = useState('')
const [nombreVisitante, setNombreVisitante] = useState('Visitante')
const [nombreLocal, setNombreLocal] = useState('Generales')
const [logoVisitante, setLogoVisitante] = useState('')
const [logoLocal, setLogoLocal] = useState(logoGenerales)
function cargarLogoVisitante(evento) {
  const archivo = evento.target.files?.[0]

  if (!archivo) return

  const lector = new FileReader()

  lector.onload = () => {
    setLogoVisitante(lector.result)
  }

  lector.readAsDataURL(archivo)
}

function cargarLogoLocal(evento) {
  const archivo = evento.target.files?.[0]

  if (!archivo) return

  const lector = new FileReader()

  lector.onload = () => {
    setLogoLocal(lector.result)
  }

  lector.readAsDataURL(archivo)
}

function actualizarLineup(equipo, indice, campo, valor) {
  const actualizar =
    equipo === 'visitante'
      ? setLineupVisitante
      : setLineupLocal

  actualizar((jugadores) =>
    jugadores.map((jugador, posicion) =>
      posicion === indice
        ? { ...jugador, [campo]: valor }
        : jugador
    )
  )
}

function actualizarEntradaLineup(equipo, jugadorIndice, entradaIndice, valor) {
  const actualizar =
    equipo === 'visitante'
      ? setLineupVisitante
      : setLineupLocal

  actualizar((jugadores) =>
    jugadores.map((jugador, indice) => {
      if (indice !== jugadorIndice) return jugador

      const nuevasEntradas = [...jugador.entradas]
      nuevasEntradas[entradaIndice] = valor

      return {
        ...jugador,
        entradas: nuevasEntradas
      }
    })
  )
}

function actualizarRecorridoLineup(
  equipo,
  jugadorId,
  entradaIndice,
  baseAlcanzada
) {
  const actualizar =
    equipo === 'visitante'
      ? setLineupVisitante
      : setLineupLocal

  actualizar((jugadores) =>
    jugadores.map((jugador) => {
      if (jugador.id !== jugadorId) return jugador

      const nuevosRecorridos = [...jugador.recorridos]

      nuevosRecorridos[entradaIndice] = Math.max(
        nuevosRecorridos[entradaIndice] || 0,
        baseAlcanzada
      )

      return {
        ...jugador,
        recorridos: nuevosRecorridos
      }
    })
  )
}
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
setEstadoPartido('Por comenzar')
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
  function registrarJugada() {
  if (!bateadorActual || !jugadaActual) return

  let nuevaPrimera = primeraBase
  let nuevaSegunda = segundaBase
  let nuevaTercera = terceraBase
  let carrerasAnotadas = 0
  let outsNuevos = outs

  if (jugadaActual === 'BB') {
    if (nuevaPrimera) {
      if (nuevaSegunda) {
        if (nuevaTercera) carrerasAnotadas += 1
        nuevaTercera = nuevaSegunda
      }

      nuevaSegunda = nuevaPrimera
    }

    nuevaPrimera = bateadorActual
  }

  if (jugadaActual === '1B' || jugadaActual === 'E') {
    if (nuevaTercera) carrerasAnotadas += 1

    nuevaTercera = nuevaSegunda
    nuevaSegunda = nuevaPrimera
    nuevaPrimera = bateadorActual
  }

  if (jugadaActual === '2B') {
    if (nuevaTercera) carrerasAnotadas += 1
    if (nuevaSegunda) carrerasAnotadas += 1

    nuevaTercera = nuevaPrimera
    nuevaSegunda = bateadorActual
    nuevaPrimera = null
  }

  if (jugadaActual === '3B') {
    carrerasAnotadas += [
      nuevaPrimera,
      nuevaSegunda,
      nuevaTercera
    ].filter(Boolean).length

    nuevaPrimera = null
    nuevaSegunda = null
    nuevaTercera = bateadorActual
  }

  if (jugadaActual === 'HR') {
    carrerasAnotadas +=
      [
        nuevaPrimera,
        nuevaSegunda,
        nuevaTercera
      ].filter(Boolean).length + 1

    nuevaPrimera = null
    nuevaSegunda = null
    nuevaTercera = null
  }

  if (jugadaActual === 'FC') {
    if (nuevaPrimera) {
      nuevaSegunda = nuevaPrimera
    }

    nuevaPrimera = bateadorActual
  }

  if (
    jugadaActual === 'OUT' ||
    jugadaActual === 'K' ||
    jugadaActual === 'ꓘ'
  ) {
    outsNuevos = Math.min(3, outsNuevos + 1)
  }

  if (jugadaActual === 'SF') {
    outsNuevos = Math.min(3, outsNuevos + 1)

    if (nuevaTercera) {
      carrerasAnotadas += 1
      nuevaTercera = null
    }
  }

  setHistorialJugadas((historial) => [
    ...historial,
    {
      equipo: equipoAlBate,
      bateador: bateadorActual,
      jugada: jugadaActual,
      entrada: inning,
parte,
carrerasImpulsadas: carrerasAnotadas
    }
  ])

  setPrimeraBase(nuevaPrimera)
  setSegundaBase(nuevaSegunda)
  setTerceraBase(nuevaTercera)
  setOuts(outsNuevos)
  setBolas(0)
  setStrikes(0)

  if (carrerasAnotadas > 0) {
    cambiarCarrera(equipoAlBate, carrerasAnotadas)
  }

  const posicionOriginal = lineupEnTurno.findIndex(
    (jugador) => jugador === bateadorActual
  )

  if (posicionOriginal >= 0 && inning <= 9) {
    actualizarEntradaLineup(
      equipoAlBate,
      posicionOriginal,
      inning - 1,
      jugadaActual
    )
  }

  if (equipoAlBate === 'visitante') {
    setTurnoVisitante(
      (turno) => turno + 1
    )
  } else {
    setTurnoLocal(
      (turno) => turno + 1
    )
  }

  setJugadaActual('')
}
const equipoAlBate =
  parte === 'Alta' ? 'visitante' : 'local'

const lineupEnTurno =
  equipoAlBate === 'visitante'
    ? lineupVisitante
    : lineupLocal

const jugadoresEnTurno = lineupEnTurno.filter(
  (jugador) => jugador.nombre.trim() !== ''
)

const indiceTurno =
  equipoAlBate === 'visitante'
    ? turnoVisitante
    : turnoLocal

const bateadorActual =
  jugadoresEnTurno.length > 0
    ? jugadoresEnTurno[indiceTurno % jugadoresEnTurno.length]
    : null
function calcularEstadisticasBateo(lineup, equipo) {
  function formatearPromedio(valor) {
    if (!Number.isFinite(valor) || valor <= 0) return '.000'

    return valor
      .toFixed(3)
      .replace(/^0/, '')
  }

  return lineup
    .filter((jugador) => (jugador.nombre || '').trim() !== '')
    .map((jugador) => {
      const jugadas = (jugador.entradas || []).filter(Boolean)

      const contar = (...tipos) =>
        jugadas.filter((jugada) => tipos.includes(jugada)).length

      const sencillos = contar('1B')
      const dobles = contar('2B')
      const triples = contar('3B')
      const jonrones = contar('HR')
      const basesPorBolas = contar('BB')
      const sacrificios = contar('SF')
      const ponches = contar('K', 'ꓘ')

      const hits =
        sencillos +
        dobles +
        triples +
        jonrones

      const turnos = Math.max(
        0,
        jugadas.length - basesPorBolas - sacrificios
      )

     const carreras = (jugador.recorridos || []).filter(
  (recorrido) => recorrido === 4
).length

      const carrerasImpulsadas = historialJugadas
        .filter(
          (registro) =>
            registro.equipo === equipo &&
            registro.bateador?.id === jugador.id
        )
        .reduce(
          (total, registro) =>
            total + (registro.carrerasImpulsadas || 0),
          0
        )

      const promedio =
        turnos > 0
          ? hits / turnos
          : 0

      const oportunidadesDeEmbase =
        turnos + basesPorBolas + sacrificios

      const porcentajeEmbase =
        oportunidadesDeEmbase > 0
          ? (hits + basesPorBolas) / oportunidadesDeEmbase
          : 0

      const basesTotales =
        sencillos +
        dobles * 2 +
        triples * 3 +
        jonrones * 4

      const slugging =
        turnos > 0
          ? basesTotales / turnos
          : 0

      const ops = porcentajeEmbase + slugging

      return {
        id: jugador.id,
        numero: jugador.numero,
        nombre: jugador.nombre,
        posicion: jugador.posicion,
        turnos,
        carreras,
        hits,
        impulsadas: carrerasImpulsadas,
        basesPorBolas,
        ponches,
        sencillos,
        dobles,
        triples,
        jonrones,
        promedio: formatearPromedio(promedio),
        ops: formatearPromedio(ops)
      }
    })
}
async function guardarReportePDF() {
  const elemento = document.getElementById('reporte-oficial-juego')

  if (!elemento) return

  const modulo = await import('html2pdf.js')
  const html2pdf = modulo.default

  const nombreArchivo = `resumen-${
    nombreVisitante || 'visitante'
  }-vs-${nombreLocal || 'local'}.pdf`

  await html2pdf()
    .set({
      margin: 8,
      filename: nombreArchivo,
      image: {
        type: 'jpeg',
        quality: 0.98
      },
      html2canvas: {
        scale: 2,
        useCORS: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'letter',
        orientation: 'portrait'
      }
    })
    .from(elemento)
    .save()
}

function imprimirReporte() {
  window.print()
}
const estadisticasVisitante = calcularEstadisticasBateo(
  lineupVisitante,
  'visitante'
)

const estadisticasLocal = calcularEstadisticasBateo(
  lineupLocal,
  'local'
)
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
        <div className="scoreboard-estado">
  <span
    className={`estado-indicador estado-${estadoPartido
      .toLowerCase()
      .replace(' ', '-')}`}
  ></span>

  <label htmlFor="estado-partido">ESTADO DEL PARTIDO</label>

  <select
    id="estado-partido"
    value={estadoPartido}
    onChange={(evento) => setEstadoPartido(evento.target.value)}
  >
    <option>Por comenzar</option>
    <option>En vivo</option>
    <option>Pausado</option>
    <option>Finalizado</option>
  </select>
</div>

        <div className="scoreboard-equipos">
          <article className="scoreboard-equipo">
            <small>VISITANTE</small>
            <label className="scoreboard-logo-selector">
  {logoVisitante ? (
    <img src={logoVisitante} alt={`Logo de ${nombreVisitante}`} />
  ) : (
    <span>＋ LOGO</span>
  )}

  <input
    type="file"
    accept="image/*"
    onChange={cargarLogoVisitante}
  />
</label>
            <input
  className="scoreboard-nombre-equipo"
  type="text"
  value={nombreVisitante}
  onChange={(evento) => setNombreVisitante(evento.target.value)}
  aria-label="Nombre del equipo visitante"
/>
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

            <label className="scoreboard-logo-selector">
  <img src={logoLocal} alt={`Logo de ${nombreLocal}`} />

  <input
    type="file"
    accept="image/*"
    onChange={cargarLogoLocal}
  />
</label>
            <input
  className="scoreboard-nombre-equipo"
  type="text"
  value={nombreLocal}
  onChange={(evento) => setNombreLocal(evento.target.value)}
  aria-label="Nombre del equipo local"
/>
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
        <th>{nombreVisitante || 'Visitante'}</th>

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
        <th>{nombreLocal || 'Generales'}</th>

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
    onClick={() =>
  setSegundaBase((actual) =>
    actual ? null : bateadorActual
  )
}
  >
    {segundaBase?.numero || '2'}
  </button>

  <button
    type="button"
    className={
      terceraBase
        ? 'base ocupada base-tercera'
        : 'base base-tercera'
    }
   onClick={() =>
  setTerceraBase((actual) =>
    actual ? null : bateadorActual
  )
}
  >
    {terceraBase?.numero || '3'}
  </button>

  <div className="base-home">⌂</div>

  <button
    type="button"
    className={
      primeraBase
        ? 'base ocupada base-primera'
        : 'base base-primera'
    }
    onClick={() =>
  setPrimeraBase((actual) =>
    actual ? null : bateadorActual
  )
}
  >
   {primeraBase?.numero || '1'}
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
<div className="scoreboard-bateador">
  <small>BATEADOR ACTUAL</small>

  {bateadorActual ? (
    <>
      <strong>
        #{bateadorActual.numero || '—'} · {bateadorActual.nombre}
      </strong>

      <span>
        {equipoAlBate === 'visitante'
          ? nombreVisitante || 'Visitante'
          : nombreLocal || 'Generales'}
      </span>
    </>
  ) : (
    <strong>Completa el lineup del equipo</strong>
  )}
  <div className="scoreboard-jugada-controles">
  <select
    value={jugadaActual}
    onChange={(evento) =>
      setJugadaActual(evento.target.value)
    }
    disabled={!bateadorActual}
  >
    <option value="">Seleccionar jugada</option>
    <option value="BB">BB · Base por bolas</option>
    <option value="1B">1B · Sencillo</option>
    <option value="2B">2B · Doble</option>
    <option value="3B">3B · Triple</option>
    <option value="HR">HR · Jonrón</option>
    <option value="E">E · Error</option>
    <option value="FC">FC · Selección del fildeador</option>
    <option value="SF">SF · Fly de sacrificio</option>
    <option value="K">K · Ponche tirándole</option>
    <option value="ꓘ">ꓘ · Ponche cantado</option>
    <option value="OUT">OUT · Otro out</option>
  </select>

  <button
    type="button"
    onClick={registrarJugada}
    disabled={!bateadorActual || !jugadaActual}
  >
    Registrar jugada
  </button>
</div>
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
  <button
    type="button"
    className="scoreboard-lineups-boton"
    onClick={() => setLineupsOpen(true)}
  >
    📋 Lineups del partido
  </button>
<button
  type="button"
  className="scoreboard-reporte-boton"
  onClick={() => setReporteOpen(true)}
>
  📊 Resumen del juego
</button>
  <button
    type="button"
    className="scoreboard-reiniciar-boton"
    onClick={reiniciar}
  >
    Reiniciar juego
  </button>
</div>
{reporteOpen && (
  <div className="reporte-fondo">
    <section className="reporte-ventana">
      <div className="reporte-acciones no-imprimir">
        <button type="button" onClick={guardarReportePDF}>
          📥 Guardar PDF
        </button>

        <button type="button" onClick={imprimirReporte}>
          🖨️ Imprimir
        </button>

        <button
          type="button"
          className="reporte-cerrar"
          onClick={() => setReporteOpen(false)}
        >
          ×
        </button>
      </div>

      <article id="reporte-oficial-juego" className="reporte-documento">
        <header className="reporte-encabezado">
          <img src={logoGenerales} alt="Generales de Chitré" />

          <div>
            <small>GENERales DE CHITRÉ BASEBALL ACADEMY</small>
            <h2>Resumen oficial del juego</h2>
            <p>Estadio Pepe Osorio · Chitré, Herrera</p>
          </div>
        </header>

        <section className="reporte-resultado">
          <div>
            <small>VISITANTE</small>
            <strong>{nombreVisitante || 'Visitante'}</strong>
            <b>{visitante}</b>
          </div>

          <span>FINAL</span>

          <div>
            <small>LOCAL</small>
            <strong>{nombreLocal || 'Generales'}</strong>
            <b>{local}</b>
          </div>
        </section>

        <section className="reporte-seccion">
          <h3>Resultado por entradas</h3>

          <div className="reporte-tabla-contenedor">
            <table className="reporte-linea">
              <thead>
                <tr>
                  <th>Equipo</th>

                  {Array.from({ length: 9 }, (_, indice) => (
                    <th key={indice}>{indice + 1}</th>
                  ))}

                  <th>R</th>
                  <th>H</th>
                  <th>E</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <th>{nombreVisitante || 'Visitante'}</th>

                  {carrerasVisitante.map((cantidad, indice) => (
                    <td key={indice}>{cantidad}</td>
                  ))}

                  <td>{visitante}</td>
                  <td>{hitsVisitante}</td>
                  <td>{erroresVisitante}</td>
                </tr>

                <tr>
                  <th>{nombreLocal || 'Generales'}</th>

                  {carrerasLocal.map((cantidad, indice) => (
                    <td key={indice}>{cantidad}</td>
                  ))}

                  <td>{local}</td>
                  <td>{hitsLocal}</td>
                  <td>{erroresLocal}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {[
          {
            clave: 'visitante',
            nombre: nombreVisitante || 'Visitante',
            jugadores: estadisticasVisitante
          },
          {
            clave: 'local',
            nombre: nombreLocal || 'Generales',
            jugadores: estadisticasLocal
          }
        ].map(({ clave, nombre, jugadores }) => (
          <section className="reporte-seccion" key={clave}>
            <h3>Bateadores — {nombre}</h3>

            <div className="reporte-tabla-contenedor">
              <table className="reporte-bateadores">
                <thead>
                  <tr>
                    <th>Bateador</th>
                    <th>POS.</th>
                    <th>TB</th>
                    <th>C</th>
                    <th>H</th>
                    <th>CI</th>
                    <th>BB</th>
                    <th>P</th>
                    <th>PRO</th>
<th>OPS</th>
                  </tr>
                </thead>

                <tbody>
                  {jugadores.map((jugador) => (
                    <tr key={jugador.id}>
                      <th>
                        {jugador.numero
                          ? `#${jugador.numero} `
                          : ''}
                        {jugador.nombre}
                      </th>
                      <td>{jugador.posicion || '—'}</td>
                      <td>{jugador.turnos}</td>
                      <td>{jugador.carreras}</td>
                      <td>{jugador.hits}</td>
                      <td>{jugador.impulsadas}</td>
                      <td>{jugador.basesPorBolas}</td>
                      <td>{jugador.ponches}</td>
                      <td>{jugador.promedio}</td>
<td>{jugador.ops}</td>
                    </tr>
                  ))}

                  <tr className="reporte-totales">
                    <th>Totales</th>
                    <td></td>
                    <td>
                      {jugadores.reduce(
                        (total, jugador) => total + jugador.turnos,
                        0
                      )}
                    </td>
                    <td>
                      {jugadores.reduce(
                        (total, jugador) => total + jugador.carreras,
                        0
                      )}
                    </td>
                    <td>
                      {jugadores.reduce(
                        (total, jugador) => total + jugador.hits,
                        0
                      )}
                    </td>
                    <td>
                      {jugadores.reduce(
                        (total, jugador) => total + jugador.impulsadas,
                        0
                      )}
                    </td>
                    <td>
                      {jugadores.reduce(
                        (total, jugador) =>
                          total + jugador.basesPorBolas,
                        0
                      )}
                    </td>
                    <td>
                      {jugadores.reduce(
                        (total, jugador) => total + jugador.ponches,
                        0
                      )}
                    </td>
                    <td>—</td>
<td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <section className="reporte-seccion reporte-jugadas">
          <h3>Resumen de jugadas</h3>

          {historialJugadas.length > 0 ? (
            <ul>
              {historialJugadas.map((registro, indice) => (
                <li key={indice}>
                  <strong>
                    {registro.parte} de la entrada {registro.entrada}:
                  </strong>{' '}
                  {registro.bateador?.nombre || 'Jugador'} —{' '}
                  {registro.jugada}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay jugadas registradas.</p>
          )}
        </section>

        <footer className="reporte-pie">
          Un equipo, una familia, un legado
        </footer>
      </article>
    </section>
  </div>
)}
{lineupsOpen && (
  <div className="lineups-fondo">
    <section className="lineups-ventana hoja-anotacion">
      <button
        type="button"
        className="lineups-cerrar"
        onClick={() => setLineupsOpen(false)}
        aria-label="Cerrar hoja de anotación"
      >
        ×
      </button>

      <header className="lineups-encabezado">
        <span>SCOREBOOK DIGITAL</span>
        <h2>⚾ Hoja de anotación</h2>
      </header>

      <div className="hoja-datos">
        <label>
          Fecha
          <input type="date" />
        </label>

        <label>
          Hora
          <input type="time" />
        </label>

        <label>
          Lugar
          <input
            type="text"
            defaultValue="Estadio Pepe Osorio"
          />
        </label>

        <label>
          Clima
          <input type="text" placeholder="Clima" />
        </label>
      </div>

      <div className="lineups-pestanas">
        <button
          type="button"
          className={lineupActivo === 'visitante' ? 'activa' : ''}
          onClick={() => setLineupActivo('visitante')}
        >
          {nombreVisitante || 'Visitante'}
        </button>

        <button
          type="button"
          className={lineupActivo === 'local' ? 'activa' : ''}
          onClick={() => setLineupActivo('local')}
        >
          {nombreLocal || 'Generales'}
        </button>
      </div>

      <div className="hoja-tabla-contenedor">
        <div className="hoja-tabla">
          <div className="hoja-fila hoja-cabecera">
            <span>#</span>
            <span>N.º</span>
            <span>LINEUP / JUGADOR</span>
            <span>POS.</span>

            {Array.from({ length: 9 }, (_, indice) => (
              <span key={indice}>{indice + 1}</span>
            ))}
          </div>

          {(lineupActivo === 'visitante'
            ? lineupVisitante
            : lineupLocal
          ).map((jugador, jugadorIndice) => (
            <div className="hoja-fila" key={jugadorIndice}>
              <strong>{jugadorIndice + 1}</strong>

              <input
                value={jugador.numero}
                onChange={(evento) =>
                  actualizarLineup(
                    lineupActivo,
                    jugadorIndice,
                    'numero',
                    evento.target.value
                  )
                }
                aria-label={`Número del jugador ${jugadorIndice + 1}`}
              />
<input
  className="hoja-jugador"
  value={jugador.nombre}
  onChange={(evento) =>
    actualizarLineup(
      lineupActivo,
      jugadorIndice,
      'nombre',
      evento.target.value
    )
  }
  placeholder="Nombre del jugador"
  aria-label={`Nombre del jugador ${jugadorIndice + 1}`}
/>

              <input
                value={jugador.posicion}
                onChange={(evento) =>
                  actualizarLineup(
                    lineupActivo,
                    jugadorIndice,
                    'posicion',
                    evento.target.value
                  )
                }
                placeholder="POS"
                aria-label={`Posición del jugador ${jugadorIndice + 1}`}
              />
{jugador.entradas.map((anotacion, entradaIndice) => {
 const recorridoAutomatico =
  jugador.recorridos?.[entradaIndice] || 0

const recorridoSegunJugada = {
  BB: 1,
  '1B': 1,
  E: 1,
  FC: 1,
  '2B': 2,
  '3B': 3,
  HR: 4,
  R: 4
}[anotacion] || 0

const recorrido = Math.max(
  recorridoAutomatico,
  recorridoSegunJugada
)

  return (
    <div
      key={entradaIndice}
      className={`hoja-turno recorrido-${recorrido}`}
      title={`Entrada ${entradaIndice + 1}`}
    >
      <div className="turno-diamante" aria-hidden="true">
        <span className="turno-base turno-segunda">2</span>
        <span className="turno-base turno-tercera">3</span>
        <span className="turno-base turno-primera">1</span>
        <span className="turno-home">⌂</span>
      </div>

      <select
        className={`hoja-entrada ${
          anotacion ? 'hoja-entrada-anotada' : ''
        }`}
        value={anotacion}
        onChange={(evento) =>
          actualizarEntradaLineup(
            lineupActivo,
            jugadorIndice,
            entradaIndice,
            evento.target.value
          )
        }
        aria-label={`Jugador ${jugadorIndice + 1}, entrada ${
          entradaIndice + 1
        }`}
      >
        <option value="">—</option>
        <option value="1B">1B</option>
        <option value="2B">2B</option>
        <option value="3B">3B</option>
        <option value="HR">HR</option>
        <option value="BB">BB</option>
        <option value="K">K</option>
        <option value="ꓘ">ꓘ</option>
        <option value="OUT">OUT</option>
        <option value="E">E</option>
        <option value="FC">FC</option>
        <option value="SF">SF</option>
        <option value="R">R</option>
      </select>
    </div>
  )
})}
            </div>
          ))}
        </div>
      </div>

      <label className="hoja-notas">
        Notas del partido
        <textarea
          rows="3"
          placeholder="Observaciones, jugadas importantes o sustituciones"
        />
      </label>
    </section>
  </div>
)}
      </section>
    </div>
  )
}