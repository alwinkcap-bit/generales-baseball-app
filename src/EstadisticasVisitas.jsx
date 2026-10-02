import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './EstadisticasVisitas.css'

export default function EstadisticasVisitas({ isAdmin }) {
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    registrarVisita()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      cargarEstadisticas()
    } else {
      setEstadisticas(null)
    }
  }, [isAdmin])

  async function registrarVisita() {
    try {
      const claveSesion = 'generales_visita_registrada'

      if (sessionStorage.getItem(claveSesion)) return

      const claveVisitante = 'generales_visitante_id'
      let visitanteId = localStorage.getItem(claveVisitante)

      if (!visitanteId) {
        visitanteId = crypto.randomUUID()
        localStorage.setItem(claveVisitante, visitanteId)
      }

      const { error } = await supabase.rpc(
        'registrar_visita',
        {
          p_visitante_id: visitanteId
        }
      )

      if (error) {
        console.error('No se pudo registrar la visita:', error)
        return
      }

      sessionStorage.setItem(claveSesion, '1')

      if (isAdmin) {
        cargarEstadisticas()
      }
    } catch (error) {
      console.error('Error registrando visita:', error)
    }
  }

  async function cargarEstadisticas() {
    setCargando(true)
    setError('')

    const { data, error } = await supabase.rpc(
      'obtener_estadisticas_visitas'
    )

    if (error) {
      console.error(error)
      setError('No se pudieron cargar las estadísticas.')
      setEstadisticas(null)
    } else {
      setEstadisticas(data?.[0] || null)
    }

    setCargando(false)
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Sin visitas todavía'

    return new Intl.DateTimeFormat('es-PA', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Panama'
    }).format(new Date(fecha))
  }

  if (!isAdmin) return null

  return (
    <section className="estadisticas-visitas">
      <header>
        <div>
          <small>ESTADÍSTICAS PRIVADAS</small>
          <h2>Visitas de la aplicación</h2>
          <p>Información visible únicamente para el administrador.</p>
        </div>

        <button
          type="button"
          onClick={cargarEstadisticas}
          disabled={cargando}
        >
          {cargando ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </header>

      {error ? (
        <p className="estadisticas-visitas-error">{error}</p>
      ) : (
        <div className="estadisticas-visitas-grid">
          <article>
            <span>👁️</span>
            <div>
              <small>VISITAS TOTALES</small>
              <strong>
                {estadisticas?.total_visitas ?? 0}
              </strong>
            </div>
          </article>

          <article>
            <span>📊</span>
            <div>
              <small>APERTURAS DE HOY</small>
              <strong>
                {estadisticas?.aperturas_hoy ?? 0}
              </strong>
            </div>
          </article>

          <article>
            <span>👥</span>
            <div>
              <small>VISITANTES DE HOY</small>
              <strong>
                {estadisticas?.visitantes_hoy ?? 0}
              </strong>
            </div>
          </article>

          <article className="estadisticas-ultima-visita">
            <span>🕒</span>
            <div>
              <small>ÚLTIMA VISITA</small>
              <strong>
                {formatearFecha(
                  estadisticas?.ultima_visita
                )}
              </strong>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}
