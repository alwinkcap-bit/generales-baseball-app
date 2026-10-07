import React, { useEffect, useRef, useState } from 'react'
import { estiloPortada } from './EditorPortada'

export default function AjustePortadaSubida({
  archivo,
  tipo = 'imagen',
  valor,
  onChange,
  disabled = false,
  proporcion = '270 / 155'
}) {
  const [url, setUrl] = useState('')
  const [duracion, setDuracion] = useState(0)
  const [error, setError] = useState('')
  const videoRef = useRef(null)

  const ajuste = {
    modo: 'cover',
    x: 50,
    y: 50,
    zoom: 1,
    tiempo: 0,
    ...valor
  }

  useEffect(() => {
    if (!archivo) return
    const temporal = URL.createObjectURL(archivo)
    setUrl(temporal)
    setDuracion(0)
    setError('')
    return () => URL.revokeObjectURL(temporal)
  }, [archivo])

  useEffect(() => {
    const video = videoRef.current
    if (video?.readyState >= 1 && duracion > 0) {
      video.currentTime = Math.min(
        ajuste.tiempo,
        Math.max(0, duracion - 0.05)
      )
    }
  }, [ajuste.tiempo, duracion])

  function cambiar(campo, numero) {
    onChange({ ...ajuste, [campo]: Number(numero) })
  }

  const ultimoFotograma = Math.max(0, duracion - 0.05)

  return (
    <fieldset className="portada-subida" disabled={disabled}>
      <legend>Prepara tu portada</legend>
      <p>
        Así se verá en el cintillo. Ajusta el encuadre antes de publicar.
      </p>

      <div className="portada-subida-preview"
        style={{ aspectRatio: proporcion }}>
        {url && (tipo === 'video' ? (
          <video
            ref={videoRef}
            src={url}
            muted
            playsInline
            preload="auto"
            style={estiloPortada(ajuste)}
            onLoadedMetadata={evento => {
              const video = evento.currentTarget
              if (Number.isFinite(video.duration) && video.duration > 0) {
                setDuracion(video.duration)
                video.currentTime = Math.min(
                  ajuste.tiempo,
                  Math.max(0, video.duration - 0.05)
                )
              } else {
                setError('No se pudo leer la duración del video.')
              }
            }}
            onError={() => setError(
              'No se pudo mostrar este video. Prueba exportándolo como MP4.'
            )}
          />
        ) : (
          <img
            src={url}
            alt="Vista previa de la portada"
            style={estiloPortada(ajuste)}
            onError={() => setError('No se pudo mostrar la imagen.')}
          />
        ))}
      </div>

      <div className="portada-subida-controles">
        {tipo === 'video' && (
          <label>
            Fotograma de portada
            <output>{Math.min(ajuste.tiempo, ultimoFotograma).toFixed(2)} s</output>
            <input
              type="range"
              min="0"
              max={ultimoFotograma}
              step="0.05"
              value={Math.min(ajuste.tiempo, ultimoFotograma)}
              disabled={disabled || duracion <= 0}
              onChange={evento => cambiar('tiempo', evento.target.value)}
            />
          </label>
        )}

        {[
          ['zoom', 'Acercamiento', 1, 3, 0.05],
          ['x', 'Posición horizontal', 0, 100, 1],
          ['y', 'Posición vertical', 0, 100, 1]
        ].map(([campo, nombre, min, max, paso]) => (
          <label key={campo}>
            {nombre}
            <output>
              {campo === 'zoom'
                ? `${Number(ajuste[campo]).toFixed(2)}×`
                : `${ajuste[campo]}%`}
            </output>
            <input
              type="range"
              min={min}
              max={max}
              step={paso}
              value={ajuste[campo]}
              onChange={evento => cambiar(campo, evento.target.value)}
            />
          </label>
        ))}
      </div>

      <button type="button" onClick={() => onChange({
        modo: 'cover', x: 50, y: 50, zoom: 1, tiempo: 0
      })}>
        Restablecer portada
      </button>

      <p className="portada-subida-nota">
        La portada llena la tarjeta. Ajusta la posición para conservar
        la parte importante de la imagen.
      </p>
      {error && <p role="alert">{error}</p>}
    </fieldset>
  )
}
