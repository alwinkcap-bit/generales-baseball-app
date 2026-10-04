import React, { useEffect, useState } from 'react'

export default function InstalarApp() {
  const [instalador, setInstalador] = useState(null)

  useEffect(() => {
    navigator.serviceWorker?.register(
      '/generales-baseball-app/sw.js'
    )

    const guardar = (evento) => {
      evento.preventDefault()
      setInstalador(evento)
    }

    window.addEventListener('beforeinstallprompt', guardar)

    return () =>
      window.removeEventListener(
        'beforeinstallprompt',
        guardar
      )
  }, [])

  async function instalar() {
    if (!instalador) {
      const agente = navigator.userAgent.toLowerCase()
      const esIOS = /iphone|ipad|ipod/.test(agente)
      const navegadorInterno =
        /instagram|fbav|fban|messenger/.test(agente)

      if (navegadorInterno) {
        alert(
          'Abre esta página en Chrome o Safari y vuelve a tocar Instalar app.'
        )
      } else if (esIOS) {
        alert(
          'En iPhone: abre Safari, toca Compartir y luego Agregar a pantalla de inicio.'
        )
      } else {
        alert(
          'En Android: abre Chrome, toca los tres puntos y selecciona Instalar aplicación o Agregar a pantalla principal.'
        )
      }

      return
    }

    await instalador.prompt()
    setInstalador(null)
  }

  return (
    <button
      type="button"
      className="inicio-instalar-cabecera"
      onClick={instalar}
      aria-label="Instalar la aplicación"
      title="Instalar aplicación"
    >
      <span className="inicio-instalar-texto">
        <small>DESCARGAR</small>
        <strong>APP</strong>
      </span>

      <span
        className="inicio-instalar-flecha"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24">
          <path
            d="M11 3h2v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4 3.6 3.6V3Zm-5 16h12v2H6v-2Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  )
}
