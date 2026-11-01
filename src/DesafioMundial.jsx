import { obtenerInsignia, generarTarjetaInsignia } from './GeneradorInsignia'
import React, { useEffect, useState } from 'react'
import preguntasReto from './PreguntasDesafioMundial'
import './DesafioMundial.css'

const TOTAL = 7
const SEGUNDOS = 7

const NIVELES = [
  { id: 'novato', nombre: '🟢 Novato', descripcion: 'Aprende las reglas y fundamentos' },
  { id: 'profesional', nombre: '🔵 Profesional', descripcion: 'MLB, historia y estrategias' },
  { id: 'leyenda', nombre: '🏆 Leyenda', descripcion: 'Demuestra tus conocimientos avanzados' },
]

function seleccionarPreguntas(nivel) {
  const disponibles = preguntasReto.filter(p => p.nivel === nivel)

  for (let i = disponibles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]]
  }

  return disponibles.slice(0, TOTAL)
}

export default function DesafioMundial({ onCerrar }) {
  const [nivel, setNivel] = useState(null)
  const [preguntas, setPreguntas] = useState([])
  const [actual, setActual] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [seleccionada, setSeleccionada] = useState(null)
  const [tiempo, setTiempo] = useState(SEGUNDOS)
  const [terminado, setTerminado] = useState(false)

  const [nombreJugador, setNombreJugador] = useState('')
  const [generandoTarjeta, setGenerandoTarjeta] = useState(false)
  const [errorTarjeta, setErrorTarjeta] = useState('')
  const pregunta = preguntas[actual]
  const respondida = seleccionada !== null

  function iniciar(nuevoNivel) {
    const nuevas = seleccionarPreguntas(nuevoNivel)

    if (nuevas.length < TOTAL) {
      alert('Todavía no hay suficientes preguntas para este nivel.')
      return
    }

    setPreguntas(nuevas)
    setNivel(nuevoNivel)
    setActual(0)
    setAciertos(0)
    setSeleccionada(null)
    setTiempo(SEGUNDOS)
    setTerminado(false)
  }

  function responder(indice) {
    if (seleccionada !== null || terminado || !pregunta) return

    setSeleccionada(indice === -1 ? -1 : indice)

    if (indice === pregunta.correcta) {
      setAciertos(a => a + 1)
    }
  }

  useEffect(() => {
    if (!nivel || terminado || respondida) return

    if (tiempo === 0) {
      responder(-1)
      return
    }

    const timer = setTimeout(() => {
      setTiempo(t => Math.max(0, t - 1))
    }, 1000)

  
  return () => clearTimeout(timer)
  }, [nivel, terminado, respondida, tiempo])

  function siguiente() {
    if (!respondida) return

    if (actual === preguntas.length - 1) {
      setTerminado(true)
    } else {
      setActual(a => a + 1)
      setSeleccionada(null)
      setTiempo(SEGUNDOS)
    }
  }

  function compartir() {
    const nombreNivel = NIVELES.find(n => n.id === nivel)?.nombre || nivel
    const mensaje =
      `⚾🌎 ¡Jugué el Desafío Mundial de Generales de Chitré!\n\n` +
      `Nivel: ${nombreNivel}\n` +
      `🏆 Resultado: ${aciertos}/${TOTAL}\n\n` +
      `¿Puedes superarme?\n` +
      `https://alwinkcap-bit.github.io/generales-baseball-app/`

    window.open(
      `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  async function crearArchivoInsignia() {
    const insignia = obtenerInsignia(aciertos, nivel)
    const blob = await generarTarjetaInsignia(
      nombreJugador.trim() || 'JUGADOR',
      insignia,
      nivel
    )
    return new File([blob], 'insignia-desafio-mundial.png', {
      type: 'image/png'
    })
  }

  function guardarArchivo(archivo) {
    const url = URL.createObjectURL(archivo)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = archivo.name
    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function descargarInsignia() {
    setGenerandoTarjeta(true)
    setErrorTarjeta('')
    try {
      const archivo = await crearArchivoInsignia()
      guardarArchivo(archivo)
    } catch (error) {
      console.error(error)
      setErrorTarjeta('No se pudo generar la tarjeta. Verifica la imagen de la plantilla.')
    } finally {
      setGenerandoTarjeta(false)
    }
  }

  async function compartirInsignia() {
    setGenerandoTarjeta(true)
    setErrorTarjeta('')
    try {
      const archivo = await crearArchivoInsignia()
      const mensaje = '⚾🏆 ¡Desbloqueé una insignia en el Desafío Mundial de Generales de Chitré! ¿Te atreves a jugar? https://alwinkcap-bit.github.io/generales-baseball-app/'

      if (navigator.share && navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          title: 'Desafío Mundial',
          text: mensaje
        })
      } else {
        guardarArchivo(archivo)
        setErrorTarjeta('Tarjeta descargada. Puedes adjuntarla a WhatsApp, Instagram o Facebook.')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error(error)
        setErrorTarjeta('No se pudo compartir la tarjeta.')
      }
    } finally {
      setGenerandoTarjeta(false)
    }
  }

  return (
    <div className="desafio-mundial">
      <div className="desafio-panel">
        <button className="desafio-cerrar" onClick={onCerrar}>
          ✕ Cerrar
        </button>

        <h1>⚾🌎 DESAFÍO MUNDIAL</h1>
        <p>Generales de Chitré Baseball Academy</p>

        {!nivel ? (
          <div className="desafio-niveles">
            <h2>Selecciona tu dificultad</h2>
            <p>7 preguntas para demostrar cuánto sabes de béisbol.</p>

            {NIVELES.map(n => (
              <button
                key={n.id}
                onClick={() => iniciar(n.id)}
                className="desafio-nivel"
              >
                <strong>{n.nombre}</strong>
                <span>{n.descripcion}</span>
              </button>
            ))}
          </div>
        ) : terminado ? (
          <div className="desafio-resultado">
            <h2>🏆 ¡Reto completado!</h2>
            <p>{NIVELES.find(n => n.id === nivel)?.nombre}</p>

            <div className="desafio-puntuacion">
              {aciertos}/{TOTAL}
            </div>

            <h3>
              {aciertos === 7
                ? '🥇 Leyenda del Béisbol'
                : aciertos >= 5
                ? '🥈 Experto del Diamante'
                : aciertos >= 3
                ? '🥉 Promesa del Béisbol'
                : '⚾ Sigue entrenando'}
            </h3>

            <div className="desafio-personalizacion">
              <h3>🎖️ Insignia desbloqueada</h3>
              <p>{obtenerInsignia(aciertos, nivel)}</p>
              <label htmlFor="nombre-insignia">
                Escribe tu nombre para personalizar la tarjeta
              </label>
              <input
                id="nombre-insignia"
                type="text"
                maxLength={35}
                value={nombreJugador}
                onChange={e => setNombreJugador(e.target.value)}
                placeholder="Nombre del participante"
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 400,
                  margin: '12px auto',
                  padding: 12,
                  borderRadius: 10,
                  border: '1px solid #bbb',
                  fontSize: 16,
                  color: '#17233c',
                  background: '#fff'
                }}
              />
              <button
                onClick={descargarInsignia}
                disabled={generandoTarjeta}
              >
                📥 Descargar insignia
              </button>
              <button
                onClick={compartirInsignia}
                disabled={generandoTarjeta}
              >
                📲 Compartir logro
              </button>
              {errorTarjeta && <p role="status">{errorTarjeta}</p>}
            </div>
            <button onClick={() => iniciar(nivel)}>🔄 Volver a jugar</button>
            <button onClick={() => setNivel(null)}>🎯 Cambiar nivel</button>
          </div>
        ) : pregunta ? (
          <>
            <h2>Pregunta {actual + 1} de {TOTAL}</h2>
            <p>{NIVELES.find(n => n.id === nivel)?.nombre}</p>

            <div className="desafio-tiempo">⏱️ {tiempo}s</div>

            <h3>{pregunta.pregunta}</h3>

            <div className="desafio-opciones">
              {pregunta.opciones.map((opcion, indice) => (
                <button
                  key={indice}
                  disabled={respondida}
                  className={
                    respondida
                      ? indice === pregunta.correcta
                        ? 'correcta'
                        : indice === seleccionada
                        ? 'incorrecta'
                        : ''
                      : ''
                  }
                  onClick={() => responder(indice)}
                >
                  {opcion}
                </button>
              ))}
            </div>

            {respondida && (
              <div className="desafio-explicacion">
                <h3>
                  {seleccionada === pregunta.correcta
                    ? '✅ ¡Correcto!'
                    : seleccionada === -1
                    ? '⏰ ¡Tiempo agotado!'
                    : '❌ Respuesta incorrecta'}
                </h3>

                <p>
                  {pregunta.explicacion ||
                    `Respuesta correcta: ${pregunta.opciones[pregunta.correcta]}`}
                </p>

                <button onClick={siguiente}>
                  {actual === preguntas.length - 1
                    ? '🏆 Ver resultado'
                    : '➡️ Siguiente pregunta'}
                </button>
              </div>
            )}

            <p>Aciertos: {aciertos}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}
