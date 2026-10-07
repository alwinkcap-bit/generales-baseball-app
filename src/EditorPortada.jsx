import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase'
import './EditorPortada.css'

function normalizar(valor = {}) {
  const numero = (v, defecto, min, max) =>
    Number.isFinite(Number(v))
      ? Math.min(max, Math.max(min, Number(v)))
      : defecto

  return {
    modo: valor?.modo === 'cover' ? 'cover' : 'contain',
    x: numero(valor?.x, 50, 0, 100),
    y: numero(valor?.y, 50, 0, 100),
    zoom: numero(valor?.zoom, 1, 1, 3),
    tiempo: numero(valor?.tiempo, 0, 0, 20)
  }
}

export function estiloPortada(valor) {
  const ajuste = normalizar(valor)
  return {
    '--portada-modo': ajuste.modo,
    '--portada-posicion': `${ajuste.x}% ${ajuste.y}%`,
    objectFit: ajuste.modo,
    objectPosition: `${ajuste.x}% ${ajuste.y}%`,
    transform: `scale(${ajuste.zoom})`,
    transformOrigin: `${ajuste.x}% ${ajuste.y}%`
  }
}

function Ventana({
  src, tipo, titulo, valor, tabla, columna, id,
  proporcion, onGuardado, onCerrar
}) {
  const dialogo = useRef(null)
  const video = useRef(null)
  const [ajuste, setAjuste] = useState(() => normalizar(valor))
  const [duracion, setDuracion] = useState(20)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function cambiar(campo, nuevo) {
    setAjuste(actual => ({ ...actual, [campo]: nuevo }))
  }

  useEffect(() => {
    const ventana = dialogo.current
    const focoAnterior = document.activeElement
    ventana.showModal()

    return () => {
      if (ventana.open) ventana.close()
      if (focoAnterior?.isConnected) focoAnterior.focus()
    }
  }, [])

  useEffect(() => {
    if (video.current?.readyState >= 1) {
      video.current.currentTime = Math.min(
        ajuste.tiempo, Math.max(0, duracion - 0.05)
      )
    }
  }, [ajuste.tiempo, duracion])

  async function guardar() {
    setGuardando(true)
    setError('')

    try {
      const { data, error: fallo } = await supabase
        .from(tabla)
        .update({ [columna]: ajuste })
        .eq('id', id)
        .select('id')

      if (fallo) throw fallo
      if (!data?.length) {
        throw new Error('No se confirmó el guardado. Revisa los permisos de edición.')
      }

      await onGuardado?.(ajuste)
      onCerrar()
    } catch (fallo) {
      setError(fallo.message || 'No se pudo guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return createPortal(
    <dialog
      ref={dialogo}
      className="editor-portada-dialogo"
      aria-label={`Ajustar ${titulo}`}
      onCancel={evento => {
        evento.preventDefault()
        if (!guardando) onCerrar()
      }}
    >
      <header>
        <div>
          <small>AJUSTE DE PORTADA</small>
          <h3>{titulo}</h3>
        </div>
        <button type="button" disabled={guardando}
          onClick={onCerrar} aria-label="Cerrar editor">×</button>
      </header>

      <div className="editor-portada-preview"
        style={{ aspectRatio: proporcion }}>
        {tipo === 'video' ? (
          <video
            ref={video}
            src={src}
            muted
            playsInline
            preload="metadata"
            style={estiloPortada(ajuste)}
            onLoadedMetadata={evento => {
              const elemento = evento.currentTarget
              if (Number.isFinite(elemento.duration)) {
                setDuracion(elemento.duration)
                elemento.currentTime = Math.min(
                  ajuste.tiempo,
                  Math.max(0, elemento.duration - 0.05)
                )
              }
            }}
            onError={() => setError('No se pudo cargar el video.')}
          />
        ) : (
          <img src={src} alt="Vista previa del encuadre"
            style={estiloPortada(ajuste)}
            onError={() => setError('No se pudo cargar la imagen.')} />
        )}
      </div>

      <div className="editor-portada-controles">
        <label>
          Presentación
          <select value={ajuste.modo} disabled={guardando}
            onChange={evento => cambiar('modo', evento.target.value)}>
            <option value="contain">Mostrar imagen completa</option>
            <option value="cover">Llenar y recortar</option>
          </select>
        </label>

        {[
          ['zoom', 'Acercamiento', 1, 3, 0.05],
          ['x', 'Posición horizontal', 0, 100, 1],
          ['y', 'Posición vertical', 0, 100, 1]
        ].map(([campo, nombre, min, max, paso]) => (
          <label key={campo}>
            {nombre}
            <output>
              {campo === 'zoom'
                ? `${ajuste[campo].toFixed(2)}×`
                : `${ajuste[campo]}%`}
            </output>
            <input type="range" min={min} max={max} step={paso}
              value={ajuste[campo]} disabled={guardando}
              onChange={evento =>
                cambiar(campo, Number(evento.target.value))
              } />
          </label>
        ))}

        {tipo === 'video' && (
          <label>
            Fotograma de portada
            <output>{ajuste.tiempo.toFixed(1)} s</output>
            <input type="range" min="0"
              max={Math.max(0, duracion - 0.05)} step="0.05"
              value={Math.min(ajuste.tiempo, Math.max(0, duracion - 0.05))}
              disabled={guardando}
              onChange={evento =>
                cambiar('tiempo', Number(evento.target.value))
              } />
          </label>
        )}

        <p>La opción «Imagen completa» evita recortes.
          Los ajustes conservan el archivo original.</p>

        {error && (
          <p role="alert" className="editor-portada-error">{error}</p>
        )}
      </div>

      <footer>
        <button type="button" disabled={guardando}
          onClick={() => setAjuste(normalizar())}>Restablecer</button>
        <button type="button" disabled={guardando}
          onClick={onCerrar}>Regresar</button>
        <button type="button" disabled={guardando} onClick={guardar}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </footer>
    </dialog>,
    document.body
  )
}

export default function EditorPortada({
  src, tipo = 'imagen', titulo = 'Portada', valor,
  tabla, columna = 'ajuste_portada', id, onGuardado,
  proporcion = '270 / 155', etiqueta = 'Ajustar portada'
}) {
  const [abierto, setAbierto] = useState(false)

  return (
    <>
      <button type="button" className="editor-portada-abrir"
        onClick={evento => {
          evento.stopPropagation()
          setAbierto(true)
        }}>
        {etiqueta}
      </button>

      {abierto && (
        <Ventana src={src} tipo={tipo} titulo={titulo} valor={valor}
          tabla={tabla} columna={columna} id={id}
          proporcion={proporcion} onGuardado={onGuardado}
          onCerrar={() => setAbierto(false)} />
      )}
    </>
  )
}
