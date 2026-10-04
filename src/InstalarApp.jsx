import React, { useEffect, useState } from 'react'

export default function InstalarApp() {
  const [instalador, setInstalador] = useState(null)

  useEffect(() => {
    navigator.serviceWorker?.register('/generales-baseball-app/sw.js')
    const guardar = (evento) => {
      evento.preventDefault()
      setInstalador(evento)
    }
    window.addEventListener('beforeinstallprompt', guardar)
    return () => window.removeEventListener('beforeinstallprompt', guardar)
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
    <button type="button" onClick={instalar}>
      <span className="inicio-panel-icono">📲</span>
      <strong>Instalar app</strong>
      <b>↓</b>
    </button>
  )
}
