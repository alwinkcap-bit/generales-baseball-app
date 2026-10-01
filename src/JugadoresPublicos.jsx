import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './JugadoresPublicos.css'

export default function JugadoresPublicos() {
  const [jugadores, setJugadores] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarPerfiles() {
      setCargando(true)
      setError('')

      const { data, error: consultaError } = await supabase
        .from('jugadores')
        .select(
          'id,nombre,apellido,categoria,posicion,numero,batea,lanza,foto_url,estado'
        )
        .order('nombre')

      if (!activo) return

      if (consultaError) {
        console.error(consultaError)
        setError('No se pudieron cargar los perfiles.')
        setJugadores([])
      } else {
        setJugadores(data || [])
        setSeleccionado(data?.[0] || null)
      }

      setCargando(false)
    }

    cargarPerfiles()

    return () => {
      activo = false
    }
  }, [])

  return (
    <section className="jugadores-publicos">
      <header className="jugadores-publicos-encabezado">
        <span>NUESTRO EQUIPO</span>
        <h2>Jugadores Generales</h2>
        <p>
          Conoce los perfiles deportivos autorizados de nuestra academia.
        </p>
      </header>

      {cargando ? (
        <div className="jugadores-publicos-estado">
          Cargando jugadores…
        </div>
      ) : error ? (
        <div className="jugadores-publicos-estado jugadores-publicos-error">
          {error}
        </div>
      ) : jugadores.length === 0 ? (
        <div className="jugadores-publicos-estado">
          Próximamente publicaremos los perfiles autorizados.
        </div>
      ) : (
        <>
          <div className="jugadores-publicos-grid">
            {jugadores.map((jugador) => (
              <button
                type="button"
                key={jugador.id}
                className={
                  seleccionado?.id === jugador.id ? 'activo' : ''
                }
                onClick={() => setSeleccionado(jugador)}
              >
                <div className="jugador-publico-foto">
                  {jugador.foto_url ? (
                    <img
                      src={jugador.foto_url}
                      alt={`${jugador.nombre} ${jugador.apellido || ''}`}
                    />
                  ) : (
                    <span>
                      {jugador.nombre?.[0] || 'G'}
                      {jugador.apellido?.[0] || ''}
                    </span>
                  )}

                  <b>#{jugador.numero || '—'}</b>
                </div>

                <strong>
                  {jugador.nombre} {jugador.apellido}
                </strong>

                <small>
                  {jugador.posicion || 'Jugador'}
                  {' · '}
                  {jugador.categoria || 'Generales'}
                </small>
              </button>
            ))}
          </div>

          {seleccionado && (
            <article className="jugador-publico-detalle">
              <div className="jugador-publico-detalle-foto">
                {seleccionado.foto_url ? (
                  <img
                    src={seleccionado.foto_url}
                    alt={`${seleccionado.nombre} ${
                      seleccionado.apellido || ''
                    }`}
                  />
                ) : (
                  <span>⚾</span>
                )}
              </div>

              <div className="jugador-publico-detalle-info">
                <small>PERFIL DEPORTIVO</small>
                <h3>
                  {seleccionado.nombre} {seleccionado.apellido}
                </h3>

                <div>
                  <span>
                    <b>#{seleccionado.numero || '—'}</b>
                    Número
                  </span>

                  <span>
                    <b>{seleccionado.posicion || '—'}</b>
                    Posición
                  </span>

                  <span>
                    <b>{seleccionado.categoria || '—'}</b>
                    Categoría
                  </span>

                  <span>
                    <b>
                      {seleccionado.batea || '—'}/
                      {seleccionado.lanza || '—'}
                    </b>
                    Batea / Lanza
                  </span>
                </div>
              </div>
            </article>
          )}
        </>
      )}
    </section>
  )
}
