import React, { useEffect, useMemo, useState } from 'react'
import './SopaLetras.css'

const PALABRAS_BEISBOL = [
  'BATE',
  'PELOTA',
  'GUANTE',
  'CASCO',
  'BASE',
  'HOME',
  'CARRERA',
  'EQUIPO',
  'ESTADIO',
  'JUGADOR',
  'RECEPTOR',
  'LANZADOR',
  'BATEADOR',
  'JARDIN',
  'DUGOUT',
  'STRIKE',
  'BOLA',
  'OUT',
  'HIT',
  'DOBLE',
  'TRIPLE',
  'TROFEO',
  'ARBITRO',
  'ENTRADA',
  'DEFENSA',
  'ATAQUE',
  'LINEA',
  'ROBO',
  'EMBASE',
  'INNING',
  'PITCHER',
  'CATCHER',
  'DIAMANTE',
  'CAMPO',
  'MALLA',
  'GORRA',
  'UNIFORME',
  'PRACTICA',
  'RESPETO',
  'DISCIPLINA',
  'ESFUERZO',
  'AMISTAD',
  'VALORES',
  'ENTRENADOR',
  'ACADEMIA',
  'GENER簗ALES'.replace('簗', ''),
  'CHITRE',
  'HERrERA'.toUpperCase(),
  'VICTORIA',
  'DEPORTE'
]

const DIRECCIONES = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1]
]

function crearAleatorio(semilla) {
  let valor = semilla % 2147483647

  if (valor <= 0) {
    valor += 2147483646
  }

  return () => {
    valor = (valor * 16807) % 2147483647
    return (valor - 1) / 2147483646
  }
}

function mismaCelda(a, b) {
  return a.fila === b.fila && a.columna === b.columna
}

function crearNivel(numeroNivel) {
  const tamaño = 12
  const aleatorio = crearAleatorio(numeroNivel * 7919 + 37)

  const tablero = Array.from(
    { length: tamaño },
    () => Array(tamaño).fill('')
  )

  const palabras = Array.from({ length: 6 }, (_, indice) => {
    const posicion =
      (numeroNivel * 5 + indice * 11) % PALABRAS_BEISBOL.length

    return PALABRAS_BEISBOL[posicion]
  })

  const ubicaciones = []

  palabras.forEach((palabraOriginal) => {
    const palabraColocada =
      aleatorio() > 0.5
        ? palabraOriginal
        : palabraOriginal.split('').reverse().join('')

    let colocada = false

    for (let intento = 0; intento < 500 && !colocada; intento += 1) {
      const [cambioFila, cambioColumna] =
        DIRECCIONES[
          Math.floor(aleatorio() * DIRECCIONES.length)
        ]

      const filaInicial = Math.floor(aleatorio() * tamaño)
      const columnaInicial = Math.floor(aleatorio() * tamaño)

      const filaFinal =
        filaInicial + cambioFila * (palabraColocada.length - 1)

      const columnaFinal =
        columnaInicial + cambioColumna * (palabraColocada.length - 1)

      if (
        filaFinal < 0 ||
        filaFinal >= tamaño ||
        columnaFinal < 0 ||
        columnaFinal >= tamaño
      ) {
        continue
      }

      const celdas = palabraColocada.split('').map((letra, indice) => ({
        fila: filaInicial + cambioFila * indice,
        columna: columnaInicial + cambioColumna * indice,
        letra
      }))

      const puedeColocarse = celdas.every(({ fila, columna, letra }) => {
        return tablero[fila][columna] === '' ||
          tablero[fila][columna] === letra
      })

      if (!puedeColocarse) {
        continue
      }

      celdas.forEach(({ fila, columna, letra }) => {
        tablero[fila][columna] = letra
      })

      ubicaciones.push({
        palabra: palabraOriginal,
        celdas: celdas.map(({ fila, columna }) => ({
          fila,
          columna
        }))
      })

      colocada = true
    }
  })

  const letras = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'

  tablero.forEach((fila) => {
    fila.forEach((letra, columna) => {
      if (!letra) {
        fila[columna] =
          letras[Math.floor(aleatorio() * letras.length)]
      }
    })
  })

  return {
    tablero,
    ubicaciones
  }
}

export default function SopaLetras({ onCerrar }) {
  const progresoGuardado = Number(
    window.localStorage.getItem('sopa-letras-progreso') || 0
  )

  const [nivel, setNivel] = useState(
    Math.min(100, progresoGuardado + 1)
  )

  const [progreso, setProgreso] = useState(progresoGuardado)
  const [inicioSeleccion, setInicioSeleccion] = useState(null)
  const [encontradas, setEncontradas] = useState([])
  const [mensaje, setMensaje] = useState(
    'Toca la primera y la última letra de una palabra.'
  )

  const juego = useMemo(() => crearNivel(nivel), [nivel])

  const nivelCompleto =
    encontradas.length === juego.ubicaciones.length

  useEffect(() => {
    setInicioSeleccion(null)
    setEncontradas([])
    setMensaje(
      'Toca la primera y la última letra de una palabra.'
    )
  }, [nivel])

  useEffect(() => {
    if (!nivelCompleto) return

    const nuevoProgreso = Math.max(progreso, nivel)

    setProgreso(nuevoProgreso)

    window.localStorage.setItem(
      'sopa-letras-progreso',
      String(nuevoProgreso)
    )

    setMensaje(
      nivel === 100
        ? '🏆 ¡Completaste los 100 niveles!'
        : '🎉 ¡Nivel completado! Ya puedes avanzar.'
    )
  }, [nivelCompleto, nivel, progreso])

  const celdasEncontradas = useMemo(() => {
    const resultado = new Set()

    juego.ubicaciones.forEach((ubicacion) => {
      if (!encontradas.includes(ubicacion.palabra)) return

      ubicacion.celdas.forEach(({ fila, columna }) => {
        resultado.add(`${fila}-${columna}`)
      })
    })

    return resultado
  }, [encontradas, juego])

  function seleccionarCelda(fila, columna) {
    const celda = { fila, columna }

    if (!inicioSeleccion) {
      setInicioSeleccion(celda)
      setMensaje('Ahora toca la última letra de la palabra.')
      return
    }

    const palabraEncontrada = juego.ubicaciones.find((ubicacion) => {
      if (encontradas.includes(ubicacion.palabra)) return false

      const primera = ubicacion.celdas[0]
      const ultima =
        ubicacion.celdas[ubicacion.celdas.length - 1]

      return (
        (
          mismaCelda(inicioSeleccion, primera) &&
          mismaCelda(celda, ultima)
        ) ||
        (
          mismaCelda(inicioSeleccion, ultima) &&
          mismaCelda(celda, primera)
        )
      )
    })

    if (palabraEncontrada) {
      setEncontradas((actuales) => [
        ...actuales,
        palabraEncontrada.palabra
      ])

      setMensaje(`✅ Encontraste: ${palabraEncontrada.palabra}`)
    } else {
      setMensaje('Intenta nuevamente con otra combinación.')
    }

    setInicioSeleccion(null)
  }

  function cambiarNivel(nuevoNivel) {
    if (nuevoNivel < 1 || nuevoNivel > 100) return
    setNivel(nuevoNivel)
  }

  return (
    <div
      className="sopa-fondo"
      onClick={onCerrar}
    >
      <section
        className="sopa-ventana"
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          className="sopa-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar sopa de letras"
        >
          ×
        </button>

        <header className="sopa-encabezado">
          <span>JUEGO EDUCATIVO</span>
          <h2>🔎 Sopa de letras</h2>
          <p>
            Nivel {nivel} de 100 · Progreso: {progreso} completados
          </p>
        </header>

        <p className="sopa-mensaje">{mensaje}</p>

        <div className="sopa-contenido">
          <div
            className="sopa-tablero"
            aria-label={`Sopa de letras nivel ${nivel}`}
          >
            {juego.tablero.map((fila, indiceFila) =>
              fila.map((letra, indiceColumna) => {
                const clave = `${indiceFila}-${indiceColumna}`

                const seleccionada =
                  inicioSeleccion?.fila === indiceFila &&
                  inicioSeleccion?.columna === indiceColumna

                const encontrada =
                  celdasEncontradas.has(clave)

                return (
                  <button
                    type="button"
                    key={clave}
                    style={{
  gridColumn: indiceColumna + 1,
  gridRow: indiceFila + 1
}}
                    className={[
                      'sopa-celda',
                      seleccionada ? 'seleccionada' : '',
                      encontrada ? 'encontrada' : ''
                    ].join(' ')}
                    onClick={() =>
                      seleccionarCelda(
                        indiceFila,
                        indiceColumna
                      )
                    }
                  >
                    {letra}
                  </button>
                )
              })
            )}
          </div>

          <aside className="sopa-palabras">
            <h3>Encuentra estas palabras</h3>

            <div>
              {juego.ubicaciones.map(({ palabra }) => (
                <span
                  key={palabra}
                  className={
                    encontradas.includes(palabra)
                      ? 'encontrada'
                      : ''
                  }
                >
                  {encontradas.includes(palabra) ? '✓ ' : ''}
                  {palabra}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <footer className="sopa-controles">
          <button
            type="button"
            disabled={nivel === 1}
            onClick={() => cambiarNivel(nivel - 1)}
          >
            ← Anterior
          </button>

          <strong>{nivel} / 100</strong>

          <button
            type="button"
            disabled={
              nivel === 100 ||
              (nivel > progreso && !nivelCompleto)
            }
            onClick={() => cambiarNivel(nivel + 1)}
          >
            Siguiente →
          </button>
        </footer>
      </section>
    </div>
  )
}