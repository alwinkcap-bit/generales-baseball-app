import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './EstadisticasInstalaciones.css'

export default function EstadisticasInstalaciones({ isAdmin }) {
  const [abierto, setAbierto] = useState(false)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [actualizacion, setActualizacion] = useState(0)

  useEffect(() => {
    if (!isAdmin || !abierto) return
    let activo = true

    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const partes = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Panama',
          year: 'numeric',
          month: '2-digit'
        }).formatToParts(new Date())
        const valor = tipo => partes.find(p => p.type === tipo).value
        const inicio = new Date(
          `${valor('year')}-${valor('month')}-01T00:00:00-05:00`
        ).toISOString()

        const [total, mes] = await Promise.all([
          supabase.from('instalaciones_app')
            .select('instalacion_id', { count: 'exact', head: true }),
          supabase.from('instalaciones_app')
            .select('instalacion_id', { count: 'exact', head: true })
            .gte('created_at', inicio)
        ])
        if (total.error) throw total.error
        if (mes.error) throw mes.error
        if (activo) setDatos({
          total: total.count ?? 0,
          mes: mes.count ?? 0
        })
      } catch (fallo) {
        if (activo) setError(`No se pudo consultar: ${fallo.message}`)
      } finally {
        if (activo) setCargando(false)
      }
    }

    const refrescar = () => setActualizacion(n => n + 1)
    cargar()
    window.addEventListener('instalaciones-actualizadas', refrescar)
    return () => {
      activo = false
      window.removeEventListener('instalaciones-actualizadas', refrescar)
    }
  }, [isAdmin, abierto, actualizacion])

  if (!isAdmin) return null

  return (
    <div className="instalaciones-panel">
      <button type="button" className="instalaciones-boton"
        aria-expanded={abierto}
        aria-controls="instalaciones-detalle"
        onClick={() => setAbierto(n => !n)}>
        Instalaciones de la app
        <span aria-hidden="true">{abierto ? '−' : '+'}</span>
      </button>

      {abierto && (
        <div id="instalaciones-detalle" className="instalaciones-detalle">
          <header>
            <h3>Instalaciones detectadas</h3>
            <button type="button" disabled={cargando}
              onClick={() => setActualizacion(n => n + 1)}>
              {cargando ? 'Consultando…' : 'Actualizar'}
            </button>
          </header>
          {error ? <p role="alert">{error}</p> : datos ? (
            <div className="instalaciones-cifras">
              <article>
                <small>TOTAL REGISTRADO</small>
                <strong>{datos.total}</strong>
              </article>
              <article>
                <small>ESTE MES</small>
                <strong>{datos.mes}</strong>
              </article>
            </div>
          ) : <p role="status">Consultando instalaciones…</p>}
          <p className="instalaciones-nota">
            Desde la activación del contador. Solo instalaciones
            confirmadas por navegadores compatibles; no incluye
            todas las instalaciones de iPhone ni las anteriores.
          </p>
        </div>
      )}
    </div>
  )
}
