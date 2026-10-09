import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './AtrapaPelota.css'

function leerRecord(modo) {
  try {
    return Number(localStorage.getItem(`generales-atrapa-${modo}`)) || 0
  } catch {
    return 0
  }
}

export default function AtrapaPelota({ onCerrar }) {
  const canvasRef = useRef(null)
  const motor = useRef(null)
  const audioRef = useRef(null)
  const sonidoRef = useRef(true)
  const [sonido, setSonido] = useState(true)
  const [modo, setModo] = useState('facil')
  const [estado, setEstado] = useState('inicio')
  const [marcador, setMarcador] = useState({
    puntos: 0, tiempo: 60, atrapadas: 0, fallos: 0, racha: 0
  })
  const [record, setRecord] = useState(() => leerRecord('facil'))

  useEffect(() => {
    setRecord(leerRecord(modo))
  }, [modo])

  useEffect(() => {
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [])

  useEffect(() => {
    if (estado !== 'jugando') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setEstado('inicio')
      return
    }

    const ancho = 600
    const alto = 460
    const anchoGuante = modo === 'facil' ? 100 : 72
    const g = {
      x: 300, bolas: [], puntos: 0, atrapadas: 0,
      fallos: 0, racha: 0, segundos: 0, generar: 0,
      izquierda: false, derecha: false, pausa: false,
      efecto: 0
    }
    motor.current = g
    let frame
    let previo = performance.now()

    function teclado(evento, presionado) {
      if (evento.key === 'ArrowLeft' || evento.key === 'ArrowRight') {
        evento.preventDefault()
        g[evento.key === 'ArrowLeft' ? 'izquierda' : 'derecha'] = presionado
      }
    }
    const bajar = e => teclado(e, true)
    const subir = e => teclado(e, false)
    const desenfocar = () => {
      g.izquierda = false
      g.derecha = false
      g.pausa = true
    }
    const enfocar = () => { g.pausa = false }
    window.addEventListener('keydown', bajar)
    window.addEventListener('keyup', subir)
    window.addEventListener('blur', desenfocar)
    window.addEventListener('focus', enfocar)

    function tick(ahora) {
      const dt = Math.min((ahora - previo) / 1000, 0.05)
      previo = ahora
      if (!document.hidden && !g.pausa) {
        g.segundos = Math.min(60, g.segundos + dt)
        const direccion = Number(g.derecha) - Number(g.izquierda)
        g.x = Math.max(
          anchoGuante / 2,
          Math.min(ancho - anchoGuante / 2, g.x + direccion * 420 * dt)
        )

        g.generar -= dt
        if (g.generar <= 0 && g.segundos < 59) {
          g.bolas.push({
            x: 22 + Math.random() * (ancho - 44),
            y: -20,
            velocidad: (modo === 'facil' ? 100 : 155) + g.segundos * 2,
            giro: Math.random() * 6
          })
          g.generar = Math.max(
            0.45, (modo === 'facil' ? 1.15 : 0.85) - g.segundos * 0.008
          )
        }

        g.bolas = g.bolas.filter(bola => {
          const anterior = bola.y
          bola.y += bola.velocidad * dt
          bola.giro += dt * 2

          if (anterior < 380 && bola.y >= 380 &&
              Math.abs(bola.x - g.x) <= anchoGuante / 2) {
            reproducirAtrapada()
            g.atrapadas++
            g.racha++
            g.puntos += 10 + (g.racha % 5 === 0 ? 25 : 0)
            g.efecto = 0.3
            return false
          }
          if (bola.y > 440) {
            g.fallos++
            g.racha = 0
            return false
          }
          return true
        })
        g.efecto = Math.max(0, g.efecto - dt)
      }

      const fondo = ctx.createLinearGradient(0, 0, 0, alto)
      fondo.addColorStop(0, '#123c5a')
      fondo.addColorStop(0.4, '#226a4b')
      fondo.addColorStop(1, '#103d2e')
      ctx.fillStyle = fondo
      ctx.fillRect(0, 0, ancho, alto)

      ctx.fillStyle = '#ffffff08'
      for (let y = 170; y < alto; y += 60) {
        ctx.fillRect(0, y, ancho, 30)
      }
      ctx.strokeStyle = '#ffffff50'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, 270)
      ctx.lineTo(300, 430)
      ctx.lineTo(600, 270)
      ctx.stroke()

      ctx.fillStyle = '#f5cd65'
      ctx.font = 'bold 18px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GENERALES DE CHITRÉ', 300, 38)

      for (const bola of g.bolas) {
        ctx.save()
        ctx.translate(bola.x, bola.y)
        ctx.rotate(bola.giro)
        ctx.fillStyle = '#fff'
        ctx.shadowColor = '#0006'
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.arc(0, 0, 13, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = '#d34444'
        ctx.lineWidth = 2
        for (const x of [-6, 6]) {
          ctx.beginPath()
          ctx.moveTo(x, -9)
          ctx.quadraticCurveTo(x * 0.3, 0, x, 9)
          ctx.stroke()
        }
        ctx.restore()
      }

      // Guante dibujado: mismo aspecto en celular y computadora.
      ctx.save()
      ctx.translate(g.x, 400)
      const escala = anchoGuante / 90
      ctx.scale(escala, escala)
      ctx.fillStyle = g.efecto > 0 ? '#f8cf63' : '#bb7838'
      ctx.strokeStyle = '#563016'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-32, 22)
      ctx.bezierCurveTo(-52, 2, -47, -35, -35, -31)
      ctx.lineTo(-26, -9)
      ctx.lineTo(-26, -36)
      ctx.quadraticCurveTo(-20, -48, -13, -35)
      ctx.lineTo(-10, -12)
      ctx.lineTo(-8, -42)
      ctx.quadraticCurveTo(0, -51, 7, -40)
      ctx.lineTo(9, -12)
      ctx.lineTo(15, -36)
      ctx.quadraticCurveTo(24, -44, 28, -31)
      ctx.lineTo(27, -7)
      ctx.lineTo(34, -21)
      ctx.quadraticCurveTo(48, -28, 43, -6)
      ctx.quadraticCurveTo(40, 28, 15, 32)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(0, 7, 21, 16, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      if (document.hidden || g.pausa) {
        ctx.fillStyle = '#071b30cc'
        ctx.fillRect(0, 0, ancho, alto)
        ctx.fillStyle = '#fff'
        ctx.fillText('Partida en pausa', 300, 230)
      }

      setMarcador({
        puntos: g.puntos,
        tiempo: Math.max(0, Math.ceil(60 - g.segundos)),
        atrapadas: g.atrapadas,
        fallos: g.fallos,
        racha: g.racha
      })

      if (g.segundos >= 60) {
        const mejor = Math.max(leerRecord(modo), g.puntos)
        try {
          localStorage.setItem(`generales-atrapa-${modo}`, String(mejor))
        } catch {}
        setRecord(mejor)
        setEstado('final')
        return
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      motor.current = null
      window.removeEventListener('keydown', bajar)
      window.removeEventListener('keyup', subir)
      window.removeEventListener('blur', desenfocar)
      window.removeEventListener('focus', enfocar)
    }
  }, [estado, modo])

  function mover(evento) {
    const g = motor.current
    if (!g) return
    const rect = evento.currentTarget.getBoundingClientRect()
    const mitad = modo === 'facil' ? 50 : 36
    g.x = Math.max(mitad, Math.min(
      600 - mitad, (evento.clientX - rect.left) / rect.width * 600
    ))
  }

  function reproducirAtrapada() {
    const audio = audioRef.current
    if (!sonidoRef.current || !audio || audio.state !== 'running') return

    try {
      const ahora = audio.currentTime
      const tono = audio.createOscillator()
      const volumen = audio.createGain()

      tono.type = 'sine'
      tono.frequency.setValueAtTime(740, ahora)
      tono.frequency.exponentialRampToValueAtTime(1100, ahora + 0.07)

      volumen.gain.setValueAtTime(0, ahora)
      volumen.gain.linearRampToValueAtTime(0.12, ahora + 0.008)
      volumen.gain.exponentialRampToValueAtTime(0.001, ahora + 0.14)

      tono.connect(volumen)
      volumen.connect(audio.destination)
      tono.onended = () => {
        tono.disconnect()
        volumen.disconnect()
      }
      tono.start(ahora)
      tono.stop(ahora + 0.15)
    } catch {}
  }

  function prepararAudio() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext
      if (!Audio) return
      if (!audioRef.current) audioRef.current = new Audio()
      if (audioRef.current.state === 'suspended') {
        audioRef.current.resume().catch(() => {})
      }
    } catch {}
  }

  function alternarSonido() {
    const activo = !sonidoRef.current
    sonidoRef.current = activo
    setSonido(activo)
    if (activo) prepararAudio()
  }

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      if (audio && audio.state !== 'closed') {
        audio.close().catch(() => {})
      }
      audioRef.current = null
    }
  }, [])

  function comenzar() {
    prepararAudio()
    setMarcador({ puntos: 0, tiempo: 60, atrapadas: 0, fallos: 0, racha: 0 })
    setEstado('jugando')
  }

  return createPortal(
    <div className="atrapa-fondo">
      <section className="atrapa-panel" role="dialog"
        aria-modal="true" aria-labelledby="atrapa-titulo">
        <header className="atrapa-header">
          <div>
            <small>GENERALES DE CHITRÉ</small>
            <h2 id="atrapa-titulo">Atrapa la pelota</h2>
          </div>
          <button type="button" onClick={onCerrar}
            aria-label="Volver a la Zona de Juegos">×</button>
        </header>

        <div className="atrapa-marcador">
          <span>⏱️ <b>{marcador.tiempo}s</b></span>
          <span>⭐ <b>{marcador.puntos}</b></span>
          <span>🏆 Récord: <b>{record}</b></span>
          <button
            type="button"
            onClick={alternarSonido}
            aria-pressed={sonido}
            aria-label={sonido ? 'Silenciar sonido' : 'Activar sonido'}
          >
            {sonido ? '🔊 Sonido' : '🔇 Silenciado'}
          </button>
        </div>

        {estado === 'jugando' ? (
          <>
            <canvas ref={canvasRef} width="600" height="460"
              className="atrapa-campo"
              aria-label="Campo de juego. Mueve el guante con las flechas."
              tabIndex={0}
              onPointerDown={evento => {
                evento.currentTarget.focus()
                evento.currentTarget.setPointerCapture(evento.pointerId)
                mover(evento)
              }}
              onPointerMove={evento => {
                if (evento.pointerType === 'mouse' || evento.buttons) mover(evento)
              }}
            />
            <p className="atrapa-ayuda">
              Desliza el dedo, mueve el mouse o usa ← →.
              Cada 5 atrapadas seguidas: +25 puntos.
            </p>
            <p className="atrapa-resultado">
              Atrapadas: {marcador.atrapadas} ·
              Fallos: {marcador.fallos} · Racha: {marcador.racha}
            </p>
          </>
        ) : (
          <div className="atrapa-portada">
            <div className="atrapa-pelota">⚾</div>
            <h3>{estado === 'final' ? '¡Partida terminada!' : '¡Demuestra tus reflejos!'}</h3>
            {estado === 'final' ? (
              <p>
                Conseguiste <strong>{marcador.puntos} puntos</strong><br />
                {marcador.atrapadas} atrapadas · {marcador.fallos} fallos
              </p>
            ) : (
              <p>Atrapa las pelotas antes de que toquen el suelo.<br />
                ¡Tienes 60 segundos para sumar puntos!</p>
            )}

            <div className="atrapa-modos">
              <button type="button" aria-pressed={modo === 'facil'}
                onClick={() => setModo('facil')}>Fácil</button>
              <button type="button" aria-pressed={modo === 'normal'}
                onClick={() => setModo('normal')}>Normal</button>
            </div>
            <p>{modo === 'facil'
              ? 'Guante grande y pelotas más lentas.'
              : 'Guante más pequeño y pelotas más rápidas.'}</p>
            <button type="button" className="atrapa-jugar" onClick={comenzar}>
              {estado === 'final' ? 'Volver a jugar' : 'Comenzar'}
            </button>
            <p className="atrapa-ayuda">El récord se guarda en este dispositivo.</p>
          </div>
        )}
      </section>
    </div>,
    document.body
  )
}
