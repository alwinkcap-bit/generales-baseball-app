import { observarInstalaciones } from './RegistroInstalaciones'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './InstalarApp.css'

function instalada() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    navigator.standalone === true
}

function instrucciones() {
  const agente = navigator.userAgent
  const apple = /iPhone|iPad|iPod/i.test(agente) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (/Instagram|FBAV|FBAN|Messenger/i.test(agente)) {
    return {
      titulo: 'Abre la app en tu navegador',
      pasos: [
        'Abre el menú de esta ventana y selecciona Abrir en el navegador.',
        apple
          ? 'En Safari, toca Compartir y Agregar a pantalla de inicio.'
          : 'En Chrome, vuelve a tocar el botón de instalación.'
      ]
    }
  }

  if (apple) {
    return {
      titulo: 'Instalar en iPhone o iPad',
      pasos: [
        'Abre esta página en Safari.',
        'Toca Compartir y busca Agregar a pantalla de inicio.',
        'Si aparece Abrir como app web, actívalo. Luego toca Agregar.'
      ]
    }
  }

  if (/Android/i.test(agente)) {
    return {
      titulo: 'Instalar en Android',
      pasos: [
        'Abre esta página en Chrome.',
        'Abre el menú ⋮ y busca Instalar aplicación o Agregar a pantalla principal.',
        'Confirma la instalación si aparece esa opción.'
      ]
    }
  }

  return {
    titulo: 'Instalar en tu computadora',
    pasos: [
      'Abre esta página en Chrome o Edge.',
      'Busca el icono de instalación junto a la dirección, o la opción Instalar en el menú del navegador.',
      'Si tu navegador no ofrece instalación, puedes seguir usando la app desde esta página.'
    ]
  }
}

function AyudaInstalacion({ contenido, onCerrar }) {
  const dialogo = useRef(null)
  const [copiado, setCopiado] = useState(false)
  const enlace = `${window.location.origin}${import.meta.env.BASE_URL}`

  useEffect(() => {
    const anterior = document.activeElement
    dialogo.current?.showModal()
    return () => anterior?.focus?.()
  }, [])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return createPortal(
    <dialog
      ref={dialogo}
      className="instalar-app-dialogo"
      aria-labelledby="instalar-app-titulo"
      onCancel={evento => {
        evento.preventDefault()
        onCerrar()
      }}
    >
      <header>
        <div>
          <small>GENERALES DE CHITRÉ</small>
          <h2 id="instalar-app-titulo">{contenido.titulo}</h2>
        </div>
        <button type="button" onClick={onCerrar} aria-label="Cerrar">×</button>
      </header>

      <ol>
        {contenido.pasos.map(paso => <li key={paso}>{paso}</li>)}
      </ol>

      <label>
        Enlace de la app
        <input readOnly value={enlace} onFocus={evento => evento.target.select()} />
      </label>

      <p role="status">
        {copiado ? 'Enlace copiado.' : 'Puedes copiar el enlace para abrirlo en otro navegador.'}
      </p>

      <footer>
        <button type="button" onClick={copiar}>Copiar enlace</button>
        <button type="button" onClick={onCerrar}>Entendido</button>
      </footer>
    </dialog>,
    document.body
  )
}

export default function InstalarApp() {
  const instalador = useRef(null)
  const [ocupado, setOcupado] = useState(false)
  const [ayuda, setAyuda] = useState(null)
  const [enApp, setEnApp] = useState(instalada)

  useEffect(observarInstalaciones, [])

  useEffect(() => {
    const guardar = evento => {
      evento.preventDefault()
      instalador.current = evento
    }

    const confirmar = () => {
      instalador.current = null
      setEnApp(true)
      setAyuda(null)
    }

    const modo = window.matchMedia('(display-mode: standalone)')
    const actualizar = () => setEnApp(instalada())

    window.addEventListener('beforeinstallprompt', guardar)
    window.addEventListener('appinstalled', confirmar)
    modo.addEventListener('change', actualizar)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(error => console.error('No se pudo registrar la app:', error))
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', guardar)
      window.removeEventListener('appinstalled', confirmar)
      modo.removeEventListener('change', actualizar)
    }
  }, [])

  async function instalar() {
    if (ocupado) return

    if (enApp || instalada()) {
      setAyuda({
        titulo: 'La app ya está instalada',
        pasos: ['Puedes abrir Generales desde su icono en tu dispositivo.']
      })
      return
    }

    const evento = instalador.current
    if (!evento) {
      setAyuda(instrucciones())
      return
    }

    instalador.current = null
    setOcupado(true)

    try {
      await evento.prompt()
      const eleccion = await evento.userChoice
      if (eleccion.outcome === 'accepted') {
        setAyuda({
          titulo: 'Instalación solicitada',
          pasos: [
            'Tu navegador está completando la instalación.',
            'Cuando termine, busca el icono de Generales en tu dispositivo.'
          ]
        })
      }
    } catch (error) {
      console.error('No se pudo abrir la instalación:', error)
      setAyuda(instrucciones())
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="inicio-instalar-cabecera"
        onClick={instalar}
        disabled={ocupado}
        aria-label={enApp ? 'App instalada' : 'Instalar aplicación'}
        title={enApp ? 'App instalada' : 'Instalar aplicación'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"
          className="inicio-descarga-icono">
          <path
            d="M11 3h2v10.1l3.5-3.5 1.5 1.5-6 6-6-6 1.5-1.5 3.5 3.5V3Zm-5 16h12v2H6v-2Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {ayuda && (
        <AyudaInstalacion contenido={ayuda} onCerrar={() => setAyuda(null)} />
      )}
    </>
  )
}
