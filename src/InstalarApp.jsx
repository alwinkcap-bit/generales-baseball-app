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
      alert('Actualiza la página y vuelve a tocar Instalar app.')
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
