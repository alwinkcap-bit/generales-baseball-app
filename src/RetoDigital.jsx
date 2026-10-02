import React, { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import preguntasBasicas from './PreguntasReto'
import './RetoDigital.css'

const reglasIntermedias = [
  {
    pregunta: '¿Cuándo se acredita una base por bolas?',
    correcta: 'Después de cuatro bolas',
    distractores: ['Después de dos strikes', 'Después de tres fouls']
  },
  {
    pregunta: '¿Qué sucede si una pelota elevada es atrapada antes de tocar el suelo?',
    correcta: 'El bateador es out',
    distractores: ['El bateador recibe dos bases', 'Se declara foul automáticamente']
  },
  {
    pregunta: '¿Qué es un doble play?',
    correcta: 'Dos outs en una misma jugada',
    distractores: ['Dos hits consecutivos', 'Dos carreras del mismo jugador']
  },
  {
    pregunta: '¿Qué es un toque de sacrificio?',
    correcta: 'Un toque para avanzar a un corredor',
    distractores: ['Un batazo para buscar jonrón', 'Un lanzamiento intencional']
  },
  {
    pregunta: '¿Qué significa robar una base?',
    correcta: 'Avanzar durante el lanzamiento sin que exista batazo',
    distractores: ['Mover físicamente una base', 'Avanzar después de un foul']
  },
  {
    pregunta: '¿Qué jugador cubre normalmente el home?',
    correcta: 'El receptor',
    distractores: ['El campocorto', 'El jardinero central']
  },
  {
    pregunta: '¿Cuándo puede avanzar un corredor después de un fly atrapado?',
    correcta: 'Después de retocar su base',
    distractores: ['Antes de que llegue la pelota', 'Solamente después de dos outs']
  },
  {
    pregunta: '¿Qué indica una pelota fair?',
    correcta: 'Que permanece dentro del terreno válido',
    distractores: ['Que fue lanzada muy rápido', 'Que pasó detrás del receptor']
  },
  {
    pregunta: '¿Qué es una jugada forzada?',
    correcta: 'El corredor debe avanzar porque otro corredor ocupa su base',
    distractores: ['El corredor decide no avanzar', 'El árbitro obliga a cambiar al lanzador']
  },
  {
    pregunta: '¿Qué posición juega entre segunda y tercera base?',
    correcta: 'Campocorto',
    distractores: ['Receptor', 'Jardinero derecho']
  },
  {
    pregunta: '¿Qué significa RBI?',
    correcta: 'Carrera impulsada',
    distractores: ['Base robada', 'Entrada lanzada']
  },
  {
    pregunta: '¿Qué significa ERA para un lanzador?',
    correcta: 'Promedio de carreras limpias permitidas',
    distractores: ['Cantidad de errores defensivos', 'Promedio de bateo']
  },
  {
    pregunta: '¿Qué es un balk?',
    correcta: 'Un movimiento ilegal del lanzador con corredores en base',
    distractores: ['Un batazo fuera del estadio', 'Una atrapada realizada contra la pared']
  },
  {
    pregunta: '¿Qué es interferencia ofensiva?',
    correcta: 'Cuando la ofensiva impide ilegalmente una jugada defensiva',
    distractores: ['Cuando llueve durante el partido', 'Cuando el lanzador pide tiempo']
  },
  {
    pregunta: '¿Qué es una selección del fildeador?',
    correcta: 'Una jugada en la que la defensa intenta retirar a otro corredor',
    distractores: ['Un cambio obligatorio de jardinero', 'Una base por bolas intencional']
  }
]

const situacionesAvanzadas = [
  {
    pregunta: 'Corredor en tercera y menos de dos outs: ¿qué batazo suele permitir una carrera de sacrificio?',
    correcta: 'Un elevado profundo al jardín',
    distractores: ['Un foul detrás de home', 'Un rodado directo al receptor']
  },
  {
    pregunta: 'Con corredor en primera y rodado al campocorto, ¿cuál es una opción común para iniciar doble play?',
    correcta: 'Tirar a segunda base',
    distractores: ['Tirar directamente al jardín', 'Conservar siempre la pelota']
  },
  {
    pregunta: '¿Por qué un bateador puede acortar su swing con dos strikes?',
    correcta: 'Para aumentar el contacto con la pelota',
    distractores: ['Para abandonar el turno', 'Para recibir una base automática']
  },
  {
    pregunta: '¿Cuál es el objetivo principal de un cambio de velocidad?',
    correcta: 'Alterar el ritmo y engañar al bateador',
    distractores: ['Lanzar siempre más alto', 'Hacer que la pelota sea foul']
  },
  {
    pregunta: '¿Qué debe hacer un jardinero antes de lanzar a una base?',
    correcta: 'Alinear el cuerpo y realizar un relevo preciso',
    distractores: ['Lanzar de espaldas', 'Esperar que todos los corredores anoten']
  },
  {
    pregunta: 'Con dos outs, ¿por qué los corredores suelen salir al contacto?',
    correcta: 'Porque no necesitan esperar una posible atrapada',
    distractores: ['Porque el inning ya terminó', 'Porque no pueden ser retirados']
  },
  {
    pregunta: '¿Qué busca la defensa al realizar un corte y relevo?',
    correcta: 'Reducir la distancia y controlar el avance de corredores',
    distractores: ['Cambiar el conteo del bateador', 'Eliminar una carrera ya anotada']
  },
  {
    pregunta: '¿Cuándo conviene lanzar al cutoff?',
    correcta: 'Cuando el tiro directo sería largo o impreciso',
    distractores: ['Después de cada strike', 'Solamente cuando no hay corredores']
  },
  {
    pregunta: '¿Qué ventaja ofrece batear detrás del corredor?',
    correcta: 'Puede permitir que avance con menor riesgo',
    distractores: ['Convierte automáticamente el batazo en jonrón', 'Elimina un out anterior']
  },
  {
    pregunta: '¿Qué busca un lanzador trabajando las esquinas de la zona?',
    correcta: 'Provocar contacto débil o swings fallidos',
    distractores: ['Conceder bases por bolas', 'Evitar que el receptor toque la pelota']
  },
  {
    pregunta: '¿Cuál es la responsabilidad principal del campocorto en un rodado entre segunda y tercera?',
    correcta: 'Atacar la pelota y completar el out disponible',
    distractores: ['Cubrir siempre el home', 'Permanecer inmóvil']
  },
  {
    pregunta: '¿Por qué la comunicación es importante en un elevado entre dos defensores?',
    correcta: 'Evita choques y asegura quién realizará la atrapada',
    distractores: ['Cambia el valor del batazo', 'Permite cuatro outs en la entrada']
  }
]

function crearPregunta(pregunta, correcta, distractores, semilla) {
  const posicion = semilla % 3
  const opciones = [...distractores.slice(0, 2)]
  opciones.splice(posicion, 0, correcta)

  return {
    pregunta,
    opciones,
    correcta: posicion
  }
}

function preguntaEstadistica(tipo, nivel, indice) {
  const ajuste = nivel + indice

  if (tipo === 0) {
    const turnos = 20 + ajuste
    const hits = Math.max(5, Math.floor(turnos * (0.22 + (indice % 5) * 0.015)))
    const promedio = (hits / turnos).toFixed(3)

    return crearPregunta(
      `Un bateador conecta ${hits} hits en ${turnos} turnos. ¿Cuál es su promedio?`,
      promedio,
      [
        ((hits + 2) / turnos).toFixed(3),
        (hits / (turnos + 5)).toFixed(3)
      ],
      ajuste
    )
  }

  if (tipo === 1) {
    const entradas = 9 + (indice % 5) * 3
    const carreras = 1 + (ajuste % 6)
    const efectividad = ((carreras * 9) / entradas).toFixed(2)

    return crearPregunta(
      `Un lanzador permite ${carreras} carreras limpias en ${entradas} entradas. ¿Cuál es su ERA?`,
      efectividad,
      [
        ((carreras * 7) / entradas).toFixed(2),
        ((carreras * 10) / entradas).toFixed(2)
      ],
      ajuste
    )
  }

  if (tipo === 2) {
    const sencillos = 3 + (indice % 4)
    const dobles = 2 + (nivel % 3)
    const triples = 1
    const jonrones = 1 + (indice % 2)
    const bases = sencillos + dobles * 2 + triples * 3 + jonrones * 4

    return crearPregunta(
      `¿Cuántas bases totales producen ${sencillos} sencillos, ${dobles} dobles, ${triples} triple y ${jonrones} jonrón(es)?`,
      String(bases),
      [String(bases - 3), String(bases + 4)],
      ajuste
    )
  }

  if (tipo === 3) {
    const ganados = 8 + (ajuste % 12)
    const perdidos = 3 + (indice % 7)
    const total = ganados + perdidos
    const porcentaje = (ganados / total).toFixed(3)

    return crearPregunta(
      `Un equipo tiene ${ganados} victorias y ${perdidos} derrotas. ¿Cuál es su porcentaje de victorias?`,
      porcentaje,
      [
        (perdidos / total).toFixed(3),
        (ganados / (total + 2)).toFixed(3)
      ],
      ajuste
    )
  }

  if (tipo === 4) {
    const oportunidades = 25 + ajuste
    const errores = 1 + (indice % 4)
    const exitosas = oportunidades - errores
    const fildeo = (exitosas / oportunidades).toFixed(3)

    return crearPregunta(
      `Un defensor completa ${exitosas} jugadas de ${oportunidades} oportunidades. ¿Cuál es su porcentaje de fildeo?`,
      fildeo,
      [
        (errores / oportunidades).toFixed(3),
        (exitosas / (oportunidades + 3)).toFixed(3)
      ],
      ajuste
    )
  }

  const carreras = 2 + (ajuste % 5)
  const innings = 3 + (indice % 5)

  return crearPregunta(
    `Si un equipo anota ${carreras} carreras por entrada durante ${innings} entradas, ¿cuántas carreras suma?`,
    String(carreras * innings),
    [
      String(carreras + innings),
      String(carreras * innings + carreras)
    ],
    ajuste
  )
}

function generarNivel(nivel) {
  if (nivel <= 20) {
    return Array.from({ length: 10 }, (_, indice) => {
      const base =
        preguntasBasicas[
          ((nivel - 1) * 7 + indice) % preguntasBasicas.length
        ]

      return {
        ...base,
        pregunta: `Nivel ${nivel}: ${base.pregunta}`
      }
    })
  }

  if (nivel <= 45) {
    return Array.from({ length: 10 }, (_, indice) => {
      const base =
        reglasIntermedias[
          ((nivel - 21) * 3 + indice) % reglasIntermedias.length
        ]

      return crearPregunta(
        base.pregunta,
        base.correcta,
        base.distractores,
        nivel + indice
      )
    })
  }

  if (nivel <= 70) {
    return Array.from({ length: 10 }, (_, indice) => {
      const base =
        situacionesAvanzadas[
          ((nivel - 46) * 2 + indice) % situacionesAvanzadas.length
        ]

      return crearPregunta(
        base.pregunta,
        base.correcta,
        base.distractores,
        nivel + indice
      )
    })
  }

  return Array.from({ length: 10 }, (_, indice) =>
    preguntaEstadistica(indice % 6, nivel, indice)
  )
}

export default function RetoDigital({ onCerrar }) {
  const [nivelDesbloqueado, setNivelDesbloqueado] = useState(() => {
    const guardado = Number(
      window.localStorage.getItem('generales-reto-nivel') || 1
    )

    return Math.min(100, Math.max(1, guardado))
  })

  const [nivel, setNivel] = useState(null)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [seleccionada, setSeleccionada] = useState(null)
  const [terminado, setTerminado] = useState(false)

  const preguntas = useMemo(
    () => (nivel ? generarNivel(nivel) : []),
    [nivel]
  )

  function comenzarNivel(numero) {
    if (numero > nivelDesbloqueado) return

    setNivel(numero)
    setPreguntaActual(0)
    setAciertos(0)
    setSeleccionada(null)
    setTerminado(false)
  }

  function responder(indice) {
    if (seleccionada !== null) return

    setSeleccionada(indice)

    const correcta = preguntas[preguntaActual].correcta === indice
    const nuevosAciertos = aciertos + (correcta ? 1 : 0)

    window.setTimeout(() => {
      if (preguntaActual >= 9) {
        setAciertos(nuevosAciertos)
        setTerminado(true)

        if (
          nuevosAciertos >= 7 &&
          nivel < 100 &&
          nivel >= nivelDesbloqueado
        ) {
          const nuevoNivel = nivel + 1
          setNivelDesbloqueado(nuevoNivel)
          window.localStorage.setItem(
            'generales-reto-nivel',
            String(nuevoNivel)
          )
        }

        return
      }

      setAciertos(nuevosAciertos)
      setPreguntaActual((actual) => actual + 1)
      setSeleccionada(null)
    }, 750)
  }

  function estrellas() {
    if (aciertos === 10) return 3
    if (aciertos >= 8) return 2
    if (aciertos >= 7) return 1
    return 0
  }

  return createPortal(
    <div className="reto-digital-fondo">
      <section className="reto-digital">
        <header className="reto-digital-header">
          <div>
            <small>GENERALES DE CHITRÉ</small>
            <h2>🏆 Reto Digital</h2>
            <p>100 niveles de conocimiento sobre béisbol</p>
          </div>

          <button type="button" onClick={onCerrar}>×</button>
        </header>

        {!nivel ? (
          <>
            <div className="reto-digital-progreso">
              <span>NIVEL ALCANZADO</span>
              <strong>{nivelDesbloqueado} / 100</strong>
              <div>
                <i
                  style={{
                    width: `${nivelDesbloqueado}%`
                  }}
                ></i>
              </div>
            </div>

            <div className="reto-digital-niveles">
              {Array.from({ length: 100 }, (_, indice) => {
                const numero = indice + 1
                const bloqueado = numero > nivelDesbloqueado

                return (
                  <button
                    type="button"
                    key={numero}
                    disabled={bloqueado}
                    className={
                      numero === nivelDesbloqueado ? 'actual' : ''
                    }
                    onClick={() => comenzarNivel(numero)}
                  >
                    <small>NIVEL</small>
                    <strong>{numero}</strong>
                    <span>{bloqueado ? '🔒' : '⚾'}</span>
                  </button>
                )
              })}
            </div>
          </>
        ) : terminado ? (
          <div className="reto-digital-resultado">
            <span className="reto-digital-trofeo">
              {aciertos >= 7 ? '🏆' : '💪'}
            </span>

            <small>NIVEL {nivel} COMPLETADO</small>
            <h3>
              {aciertos >= 7
                ? '¡Excelente trabajo!'
                : 'Sigue practicando'}
            </h3>

            <div className="reto-digital-estrellas">
              {[1, 2, 3].map((estrella) => (
                <span
                  key={estrella}
                  className={estrella <= estrellas() ? 'ganada' : ''}
                >
                  ★
                </span>
              ))}
            </div>

            <strong>{aciertos} de 10 respuestas correctas</strong>

            <p>
              {aciertos >= 7
                ? nivel === 100
                  ? '¡Completaste todos los niveles!'
                  : 'Has desbloqueado el siguiente nivel.'
                : 'Necesitas 7 respuestas correctas para avanzar.'}
            </p>

            <div>
              <button
                type="button"
                onClick={() => comenzarNivel(nivel)}
              >
                Repetir nivel
              </button>

              {aciertos >= 7 && nivel < 100 && (
                <button
                  type="button"
                  onClick={() => comenzarNivel(nivel + 1)}
                >
                  Siguiente nivel →
                </button>
              )}

              <button type="button" onClick={() => setNivel(null)}>
                Ver niveles
              </button>
            </div>
          </div>
        ) : (
          <div className="reto-digital-pregunta">
            <div className="reto-digital-pregunta-info">
              <span>NIVEL {nivel}</span>
              <strong>
                PREGUNTA {preguntaActual + 1} / 10
              </strong>
              <b>{aciertos} ACIERTOS</b>
            </div>

            <div className="reto-digital-barra">
              <i
                style={{
                  width: `${(preguntaActual + 1) * 10}%`
                }}
              ></i>
            </div>

            <h3>{preguntas[preguntaActual].pregunta}</h3>

            <div className="reto-digital-opciones">
              {preguntas[preguntaActual].opciones.map(
                (opcion, indice) => {
                  let clase = ''

                  if (seleccionada !== null) {
                    if (
                      indice === preguntas[preguntaActual].correcta
                    ) {
                      clase = 'correcta'
                    } else if (indice === seleccionada) {
                      clase = 'incorrecta'
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={`${opcion}-${indice}`}
                      className={clase}
                      onClick={() => responder(indice)}
                      disabled={seleccionada !== null}
                    >
                      <span>{String.fromCharCode(65 + indice)}</span>
                      {opcion}
                    </button>
                  )
                }
              )}
            </div>
          </div>
        )}
      </section>
    </div>,
    document.body
  )
}
