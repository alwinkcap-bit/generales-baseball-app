import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import './ClasesVirtuales.css'

const clases = [
  {
    id: 1,
    icono: '⚾',
    titulo: 'Fundamentos del béisbol',
    descripcion: 'Terreno, bases y objetivo del juego.',
    disponible: true
  },
  {
    id: 2,
    icono: '🧤',
    titulo: 'Fildeo',
    descripcion: 'Posición básica, rodados y recepción.',
    disponible: false
  },
  {
    id: 3,
    icono: '🏏',
    titulo: 'Bateo',
    descripcion: 'Agarre, postura, balance y coordinación.',
    disponible: false
  },
  {
    id: 4,
    icono: '🏃',
    titulo: 'Corrido de bases',
    descripcion: 'Recorrido, velocidad y seguridad.',
    disponible: false
  },
  {
    id: 5,
    icono: '🔢',
    titulo: 'Posiciones defensivas',
    descripcion: 'Nombres y números de las posiciones.',
    disponible: false
  },
  {
    id: 6,
    icono: '⭐',
    titulo: 'Valores deportivos',
    descripcion: 'Disciplina, respeto y trabajo en equipo.',
    disponible: false
  }
]

const preguntas = [
  {
    pregunta: '¿Cuál es el objetivo principal del equipo ofensivo?',
    opciones: [
      'Anotar carreras',
      'Esconder la pelota',
      'Evitar usar el bate'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Cuántas bases forman el recorrido completo?',
    opciones: ['Dos', 'Tres', 'Cuatro'],
    correcta: 2
  },
  {
    pregunta: '¿Qué equipo intenta realizar los outs?',
    opciones: [
      'El equipo defensivo',
      'El público',
      'El equipo que descansa'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Dónde se completa una carrera?',
    opciones: [
      'En segunda base',
      'En el plato de home',
      'En el jardín central'
    ],
    correcta: 1
  },
  {
    pregunta: '¿Cuántos outs terminan el turno ofensivo?',
    opciones: ['Uno', 'Dos', 'Tres'],
    correcta: 2
  }
]

function obtenerCompletadas() {
  try {
    return JSON.parse(
      window.localStorage.getItem(
        'generales-clases-completadas'
      ) || '[]'
    )
  } catch {
    return []
  }
}

export default function ClasesVirtuales({ onCerrar }) {
  const [claseActiva, setClaseActiva] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [resultado, setResultado] = useState(null)
  const [completadas, setCompletadas] = useState(
    obtenerCompletadas
  )

  function abrirClase(clase) {
    if (!clase.disponible) {
      window.alert('Esta clase estará disponible próximamente.')
      return
    }

    setClaseActiva(clase)
    setRespuestas({})
    setResultado(null)
  }

  function volverAClases() {
    setClaseActiva(null)
    setRespuestas({})
    setResultado(null)
  }

  function seleccionarRespuesta(preguntaIndice, opcionIndice) {
    if (resultado) return

    setRespuestas((actuales) => ({
      ...actuales,
      [preguntaIndice]: opcionIndice
    }))
  }

  function evaluarClase() {
    if (Object.keys(respuestas).length < preguntas.length) {
      window.alert('Debes responder las cinco preguntas.')
      return
    }

    const aciertos = preguntas.reduce(
      (total, pregunta, indice) =>
        total +
        (respuestas[indice] === pregunta.correcta ? 1 : 0),
      0
    )

    const aprobada = aciertos >= 4

    setResultado({
      aciertos,
      aprobada
    })

    if (aprobada && !completadas.includes(1)) {
      const nuevasCompletadas = [...completadas, 1]

      setCompletadas(nuevasCompletadas)

      window.localStorage.setItem(
        'generales-clases-completadas',
        JSON.stringify(nuevasCompletadas)
      )
    }
  }

  function repetirEvaluacion() {
    setRespuestas({})
    setResultado(null)
  }

  return createPortal(
    <div className="clases-fondo" onClick={onCerrar}>
      <section
        className="clases-ventana"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="clases-header">
          <div>
            <small>ACADEMIA DIGITAL</small>
            <h2>Clases virtuales de béisbol</h2>
            <p>
              Aprende fundamentos, reglas y valores deportivos.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar clases virtuales"
          >
            ×
          </button>
        </header>

        {!claseActiva ? (
          <>
            <section className="clases-progreso">
              <div>
                <small>PROGRESO DE APRENDIZAJE</small>
                <strong>
                  {completadas.length} de {clases.length} clases
                </strong>
              </div>

              <div className="clases-progreso-barra">
                <i
                  style={{
                    width:
                      `${(completadas.length / clases.length) * 100}%`
                  }}
                />
              </div>
            </section>

            <div className="clases-grid">
              {clases.map((clase) => {
                const completada = completadas.includes(clase.id)

                return (
                  <article
                    key={clase.id}
                    className={completada ? 'completada' : ''}
                  >
                    <small>
                      CLASE {String(clase.id).padStart(2, '0')}
                    </small>

                    <span>{clase.icono}</span>
                    <h3>{clase.titulo}</h3>
                    <p>{clase.descripcion}</p>

                    {completada && (
                      <strong className="clase-completada-marca">
                        ✓ CLASE COMPLETADA
                      </strong>
                    )}

                    <button
                      type="button"
                      onClick={() => abrirClase(clase)}
                    >
                      {clase.disponible
                        ? completada
                          ? 'Repasar clase →'
                          : 'Comenzar clase →'
                        : 'Próximamente 🔒'}
                    </button>
                  </article>
                )
              })}
            </div>
          </>
        ) : (
          <main className="clase-contenido">
            <button
              type="button"
              className="clase-volver"
              onClick={volverAClases}
            >
              ← Volver a todas las clases
            </button>

            <section className="clase-portada">
              <span>⚾</span>
              <div>
                <small>CLASE 01 · NIVEL INICIAL</small>
                <h3>Fundamentos del béisbol</h3>
                <p>
                  Conoce el objetivo del juego, el terreno,
                  las bases y las funciones de cada equipo.
                </p>
              </div>
            </section>

            <section className="clase-bloque clase-objetivo">
              <h4>🎯 Objetivo de la clase</h4>
              <p>
                Al finalizar, el jugador podrá reconocer las
                partes básicas del terreno, explicar cómo se
                anota una carrera y diferenciar entre ofensiva
                y defensa.
              </p>
            </section>

            <section className="clase-bloque">
              <h4>1. ¿Qué es el béisbol?</h4>
              <p>
                El béisbol es un deporte de equipo donde dos
                conjuntos se alternan para batear y defender.
                El equipo que consigue más carreras gana el juego.
              </p>

              <div className="clase-conceptos">
                <article>
                  <span>🏏</span>
                  <strong>Ofensiva</strong>
                  <p>
                    Batea la pelota y corre por las bases para
                    intentar anotar carreras.
                  </p>
                </article>

                <article>
                  <span>🧤</span>
                  <strong>Defensa</strong>
                  <p>
                    Atrapa la pelota y busca realizar tres outs
                    para terminar el turno ofensivo.
                  </p>
                </article>
              </div>
            </section>

            <section className="clase-bloque">
              <h4>2. El terreno y las bases</h4>
              <p>
                El recorrido comienza en home, continúa por
                primera, segunda y tercera base, y termina
                nuevamente en home.
              </p>

              <div className="clase-diamante">
                <div className="clase-base base-segunda">2</div>
                <div className="clase-base base-tercera">3</div>
                <div className="clase-base base-primera">1</div>
                <div className="clase-home">HOME</div>
                <span className="linea linea-uno"></span>
                <span className="linea linea-dos"></span>
                <span className="linea linea-tres"></span>
                <span className="linea linea-cuatro"></span>
              </div>

              <p className="clase-dato">
                💡 Cuando un corredor toca las cuatro bases
                correctamente, anota una carrera.
              </p>
            </section>

            <section className="clase-bloque">
              <h4>3. ¿Cómo termina un turno?</h4>
              <p>
                El equipo a la ofensiva continúa bateando hasta
                que la defensa consigue tres outs. Después, los
                equipos intercambian sus funciones.
              </p>

              <div className="clase-outs">
                <span>OUT 1</span>
                <span>OUT 2</span>
                <span>OUT 3</span>
              </div>
            </section>

            <section className="clase-bloque clase-actividad">
              <h4>🏃 Actividad práctica</h4>
              <ol>
                <li>
                  Coloca cuatro objetos formando un diamante.
                </li>
                <li>
                  Identifica home, primera, segunda y tercera.
                </li>
                <li>
                  Corre y toca las bases en el orden correcto.
                </li>
                <li>
                  Al llegar a home, di en voz alta:
                  “¡Carrera!”
                </li>
              </ol>
            </section>

            <section className="clase-bloque clase-seguridad">
              <h4>🛡️ Seguridad</h4>
              <ul>
                <li>
                  Utiliza casco cuando realices prácticas de bateo.
                </li>
                <li>
                  Mantén distancia de quien está usando el bate.
                </li>
                <li>
                  Escucha siempre las indicaciones del entrenador.
                </li>
                <li>
                  No lances el bate después de golpear la pelota.
                </li>
              </ul>
            </section>

            <section className="clase-evaluacion">
              <header>
                <small>EVALUACIÓN FINAL</small>
                <h4>Demuestra lo aprendido</h4>
                <p>
                  Necesitas cuatro respuestas correctas para
                  completar la clase.
                </p>
              </header>

              {preguntas.map((pregunta, preguntaIndice) => (
                <article
                  className="clase-pregunta"
                  key={pregunta.pregunta}
                >
                  <strong>
                    {preguntaIndice + 1}. {pregunta.pregunta}
                  </strong>

                  <div>
                    {pregunta.opciones.map(
                      (opcion, opcionIndice) => {
                        const seleccionada =
                          respuestas[preguntaIndice] ===
                          opcionIndice

                        let claseOpcion =
                          seleccionada ? 'seleccionada' : ''

                        if (resultado) {
                          if (
                            opcionIndice === pregunta.correcta
                          ) {
                            claseOpcion = 'correcta'
                          } else if (seleccionada) {
                            claseOpcion = 'incorrecta'
                          }
                        }

                        return (
                          <button
                            type="button"
                            key={opcion}
                            className={claseOpcion}
                            onClick={() =>
                              seleccionarRespuesta(
                                preguntaIndice,
                                opcionIndice
                              )
                            }
                          >
                            {opcion}
                          </button>
                        )
                      }
                    )}
                  </div>
                </article>
              ))}

              {!resultado ? (
                <button
                  type="button"
                  className="clase-evaluar"
                  onClick={evaluarClase}
                >
                  Evaluar mis respuestas
                </button>
              ) : (
                <div
                  className={
                    resultado.aprobada
                      ? 'clase-resultado aprobada'
                      : 'clase-resultado pendiente'
                  }
                >
                  <span>
                    {resultado.aprobada ? '🏆' : '💪'}
                  </span>

                  <h4>
                    {resultado.aprobada
                      ? '¡Clase completada!'
                      : 'Continúa practicando'}
                  </h4>

                  <strong>
                    {resultado.aciertos} de 5 respuestas correctas
                  </strong>

                  <p>
                    {resultado.aprobada
                      ? 'Tu progreso quedó guardado en este dispositivo.'
                      : 'Necesitas cuatro aciertos para completar la clase.'}
                  </p>

                  <button
                    type="button"
                    onClick={
                      resultado.aprobada
                        ? volverAClases
                        : repetirEvaluacion
                    }
                  >
                    {resultado.aprobada
                      ? 'Ver todas las clases'
                      : 'Intentar nuevamente'}
                  </button>
                </div>
              )}
            </section>
          </main>
        )}
      </section>
    </div>,
    document.body
  )
}
