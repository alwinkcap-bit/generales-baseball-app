import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './VideoCintilloVisor.css'

function VentanaVideo({ src, titulo, onCerrar }) {
  const ventana = useRef(null)

  useEffect(() => {
    const dialogo = ventana.current
    const focoAnterior = document.activeElement
    const overflowAnterior = document.body.style.overflow

    dialogo.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflowAnterior
      if (dialogo.open) dialogo.close()
      if (focoAnterior?.isConnected) focoAnterior.focus()
    }
  }, [])

  return createPortal(
    <dialog
      ref={ventana}
      className="video-ventana"
      aria-label={titulo}
      onCancel={evento => {
        evento.preventDefault()
        onCerrar()
      }}
      onClose={onCerrar}
    >
      <header className="video-ventana-barra">
        <button type="button" onClick={onCerrar} autoFocus>
          ← Regresar
        </button>
        <strong>{titulo}</strong>
      </header>

      <video
        src={src}
        controls
        autoPlay
        playsInline
        className="video-ventana-reproductor"
      />
    </dialog>,
    document.body
  )
}

export default function VideoCintilloVisor({ src, titulo }) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button
        type="button"
        className="video-miniatura"
        aria-label={`Ver video: ${titulo}`}
        onClick={() => setAbierto(true)}
      >
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
        />
        <span className="video-miniatura-play" aria-hidden="true">▶</span>
      </button>

      {abierto && (
        <VentanaVideo
          src={src}
          titulo={titulo}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </>
  )
}
