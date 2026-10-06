import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './SalaClaseEnVivo.css'

export default function SalaClaseEnVivo({
  sesionId,
  sala,
  titulo,
  usuario,
  isAdmin,
  onCerrar
}) {
  const contenedor = useRef(null)
  const api = useRef(null)

  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [enlaceExterno, setEnlaceExterno] = useState('')

  useEffect(() => {
    let desmontado = false

    async function prepararSala() {
      setError('')
      setCargando(true)

      const { data, error: tokenError } =
        await supabase.functions.invoke(
          'generar-token-jaas',
          {
            body: {
              sesion_id: sesionId
            }
          }
        )

      if (desmontado) return

     if (tokenError || !data?.token) {
  let detalle = data || {}

  if (tokenError?.context) {
    try {
      detalle = await tokenError.context.json()
    } catch {
      detalle = {}
    }
  }

  console.error(
    'Error obteniendo acceso JaaS:',
    tokenError,
    detalle
  )

  setError(
    detalle?.error ||
    tokenError?.message ||
    'No fue posible autorizar el acceso a esta clase.'
  )

  setCargando(false)
  return
}

      const nombreSala = `${data.appId}/${data.room}`

      setEnlaceExterno(
        `https://8x8.vc/${nombreSala}?jwt=${encodeURIComponent(
          data.token
        )}`
      )

      function iniciarJitsi() {
        if (
          desmontado ||
          !contenedor.current ||
          !window.JitsiMeetExternalAPI
        ) {
          return
        }

        try {
          api.current = new window.JitsiMeetExternalAPI(
            '8x8.vc',
            {
              roomName: nombreSala,
              jwt: data.token,
              parentNode: contenedor.current,
              width: '100%',
              height: '100%',
              lang: 'es',

              userInfo: {
                email: usuario?.email || '',
                displayName:
                  usuario?.user_metadata?.nombre ||
                  usuario?.user_metadata?.full_name ||
                  usuario?.email?.split('@')[0] ||
                  (isAdmin ? 'Entrenador' : 'Alumno')
              },

              configOverwrite: {
                prejoinPageEnabled: true,
                startWithAudioMuted: !isAdmin,
                startWithVideoMuted: !isAdmin,
                disableDeepLinking: true
              },

              interfaceConfigOverwrite: {
                MOBILE_APP_PROMO: false,
                TOOLBAR_ALWAYS_VISIBLE: true
              }
            }
          )

          api.current.addListener(
            'readyToClose',
            onCerrar
          )

          setCargando(false)
        } catch (problema) {
          console.error(problema)
          setError(
            'No se pudo iniciar la videoclase profesional.'
          )
          setCargando(false)
        }
      }

      if (window.JitsiMeetExternalAPI) {
        iniciarJitsi()
        return
      }

      let script = document.querySelector(
        'script[data-jaas-external-api]'
      )

      if (!script) {
        script = document.createElement('script')
        script.src = 'https://8x8.vc/external_api.js'
        script.async = true
        script.dataset.jaasExternalApi = 'true'
        document.body.appendChild(script)
      }

      script.addEventListener(
        'load',
        iniciarJitsi,
        { once: true }
      )

      script.addEventListener(
        'error',
        () => {
          if (desmontado) return

          setError(
            'No se pudo cargar el servicio de videollamada.'
          )
          setCargando(false)
        },
        { once: true }
      )
    }

    prepararSala()

    return () => {
      desmontado = true
      api.current?.dispose()
      api.current = null
    }
  }, [
    sesionId,
    sala,
    usuario,
    isAdmin,
    onCerrar
  ])

  return (
    <div className="sala-vivo-fondo">
      <section className="sala-vivo">
        <header className="sala-vivo-header">
          <div>
            <small>
              <i></i> CLASE EN VIVO
            </small>

            <h2>{titulo}</h2>
          </div>

          <div className="sala-vivo-acciones">
            {enlaceExterno && (
              <a
                href={enlaceExterno}
                target="_blank"
                rel="noreferrer"
              >
                Abrir externamente
              </a>
            )}

            <button
              type="button"
              onClick={onCerrar}
            >
              Salir
            </button>
          </div>
        </header>

        <div className="sala-vivo-contenedor">
          {cargando && !error && (
            <div className="sala-vivo-error">
              <strong>
                Conectando con la clase en vivo…
              </strong>
            </div>
          )}

          {error && (
            <div className="sala-vivo-error">
              <strong>{error}</strong>
            </div>
          )}

          <div
            ref={contenedor}
            className="sala-vivo-jitsi"
          />
        </div>
      </section>
    </div>
  )
}