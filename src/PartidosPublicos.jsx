import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase'
import './PartidosPublicos.css'

export default function PartidosPublicos({
  onCerrar,
  isAdmin,
  onAdministrar
}) {
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarPartidos()
  }, [])

  async function cargarPartidos() {
    setCargando(true)
    setError('')

    const { data, error: consultaError } = await supabase
      .from('partidos')
      .select(
        'id,fecha,hora,equipo_visitante,equipo_local,categoria,estadio,estado,carreras_visitante,carreras_local,youtube_url'
      )
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })

    if (consultaError) {
      console.error(consultaError)
      setError('No se pudieron cargar los partidos.')
      setPartidos([])
    } else {
      setPartidos(data || [])
    }

    setCargando(false)
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'Fecha por confirmar'

    return new Intl.DateTimeFormat('es-PA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(`${fecha}T00:00:00`))
  }

  return createPortal(
    <div
      className="partidos-publicos-fondo"
      onClick={onCerrar}
    >
      <section
        className="partidos-publicos"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="partidos-publicos-encabezado">
          <div>
            <small>GENERALES DE CHITRÉ</small>
            <h2>Partidos registrados</h2>
            <p>Calendario, resultados y transmisiones de la Academia.</p>
          </div>

          <button
            type="button"
            className="partidos-publicos-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        {isAdmin && (
          <button
            type="button"
            className="partidos-publicos-administrar"
            onClick={onAdministrar}
          >
            ⚙️ Administrar partidos
          </button>
        )}

        {cargando ? (
          <div className="partidos-publicos-estado">
            Cargando partidos…
          </div>
        ) : error ? (
          <div className="partidos-publicos-estado partidos-publicos-error">
            {error}
          </div>
        ) : partidos.length === 0 ? (
          <div className="partidos-publicos-estado">
            Todavía no hay partidos programados.
          </div>
        ) : (
          <div className="partidos-publicos-lista">
            {partidos.map((partido) => (
              <article
                className="partido-publico-card"
                key={partido.id}
              >
                <div className="partido-publico-fecha">
                  <strong>{formatearFecha(partido.fecha)}</strong>
                  <span>
                    {partido.hora
                      ? partido.hora.slice(0, 5)
                      : 'Hora por confirmar'}
                  </span>
                </div>

                <div className="partido-publico-equipos">
                  <div>
                    <span>{partido.equipo_visitante}</span>
                    <b>{partido.carreras_visitante ?? 0}</b>
                  </div>

                  <small>VS</small>

                  <div>
                    <span>{partido.equipo_local}</span>
                    <b>{partido.carreras_local ?? 0}</b>
                  </div>
                </div>

                <div className="partido-publico-informacion">
                  <span>{partido.categoria || 'Categoría por confirmar'}</span>
                  <span>{partido.estadio || 'Estadio por confirmar'}</span>
                </div>

                <div className="partido-publico-pie">
                  <strong
                    className={`partido-estado partido-estado-${String(
                      partido.estado || 'programado'
                    )
                      .toLowerCase()
                      .replace(/\s+/g, '-')}`}
                  >
                    {partido.estado || 'Programado'}
                  </strong>

                  {partido.youtube_url && (
                    <a
                      href={partido.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ▶ Ver transmisión
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>,
    document.body
  )
}
