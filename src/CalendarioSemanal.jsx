import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase'
import CentroPartidos from './CentroPartidos'
import './CalendarioSemanal.css'

function fechaPanama() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Panama',
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date())
  const campo = tipo => partes.find(p => p.type === tipo).value
  return `${campo('year')}-${campo('month')}-${campo('day')}`
}

function sumarDias(fecha, cantidad) {
  const d = new Date(`${fecha}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + cantidad)
  return d.toISOString().slice(0, 10)
}

function lunesActual() {
  const hoy = fechaPanama()
  const dia = new Date(`${hoy}T12:00:00Z`).getUTCDay()
  return sumarDias(hoy, -((dia + 6) % 7))
}

function etiqueta(fecha, opciones) {
  return new Intl.DateTimeFormat('es-PA', {
    ...opciones, timeZone: 'UTC'
  }).format(new Date(`${fecha}T12:00:00Z`))
}

function hora(valor) {
  if (!valor) return 'Hora por confirmar'
  const [h, m] = valor.split(':')
  return `${Number(h) % 12 || 12}:${m} ${Number(h) < 12 ? 'a. m.' : 'p. m.'}`
}

export default function CalendarioSemanal({ isAdmin }) {
  const franjaRef = useRef(null)
  const diaHoyRef = useRef(null)
  const [semana, setSemana] = useState(lunesActual)
  const [partidos, setPartidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [administrando, setAdministrando] = useState(false)
  const [version, setVersion] = useState(0)
  const [hoy, setHoy] = useState(fechaPanama)

  useEffect(() => {
    const intervalo = setInterval(() => setHoy(fechaPanama()), 60000)
    return () => clearInterval(intervalo)
  }, [])

  useEffect(() => {
    let activo = true
    async function cargar() {
      setCargando(true)
      setError('')
      try {
        const { data, error: fallo } = await supabase
          .from('partidos')
          .select('id,fecha,hora,equipo_visitante,equipo_local,categoria,estadio,estado,carreras_visitante,carreras_local,youtube_url')
          .gte('fecha', semana)
          .lte('fecha', sumarDias(semana, 6))
          .order('fecha', { ascending: true })
          .order('hora', { ascending: true })
        if (fallo) throw fallo
        if (activo) setPartidos(data || [])
      } catch (fallo) {
        if (activo) {
          setPartidos([])
          setError(`No se pudo cargar el calendario: ${fallo.message}`)
        }
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargar()
    return () => { activo = false }
  }, [semana, version])

  useEffect(() => {
    if (!administrando || !isAdmin) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [administrando, isAdmin])

  useEffect(() => {
    if (cargando || error) return
    const franja = franjaRef.current
    const dia = diaHoyRef.current
    if (!franja) return

    if (dia) {
      const diferencia =
        dia.getBoundingClientRect().left -
        franja.getBoundingClientRect().left

      franja.scrollLeft += diferencia
    } else {
      franja.scrollLeft = 0
    }
  }, [semana, hoy, cargando, error])

  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(semana, i))

  return (
    <section className="cal-semanal">
      <header className="cal-cabecera">
        <div>
          <small>CALENDARIO DE LA ACADEMIA</small>
          <h2>Juegos de la semana</h2>
          <p>
            {etiqueta(semana, { day: 'numeric', month: 'short' })}
            {' — '}
            {etiqueta(dias[6], { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => setAdministrando(true)}>
            ＋ Programar juegos
          </button>
        )}
      </header>

      <nav className="cal-navegacion" aria-label="Cambiar semana">
        <button type="button" onClick={() => setSemana(sumarDias(semana, -7))}>
          ← Anterior
        </button>
        <button type="button" onClick={() => {
          setSemana(lunesActual())
          setVersion(v => v + 1)
        }}>Esta semana</button>
        <button type="button" onClick={() => setSemana(sumarDias(semana, 7))}>
          Siguiente →
        </button>
      </nav>

      {cargando ? <p role="status">Cargando juegos…</p> : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setVersion(v => v + 1)}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {partidos.length === 0 && (
            <p className="cal-vacio">Todavía no hay juegos programados para esta semana.</p>
          )}
          <div className="cal-dias" ref={franjaRef}>
            {dias.map(fecha => {
              const juegos = partidos.filter(p => p.fecha === fecha)
              return (
                <section key={fecha} ref={fecha === hoy ? diaHoyRef : null}
                  className={`cal-dia ${fecha === hoy ? 'cal-hoy' : ''} ${juegos.length === 0 ? 'cal-dia-vacio' : 'cal-dia-programado'}`}>
                  <header className="cal-dia-titulo">
                    <span>{etiqueta(fecha, { weekday: 'short' })}</span>
                    <b>{etiqueta(fecha, { day: 'numeric' })}</b>
                    {fecha === hoy && <small>HOY</small>}
                  </header>

                  {juegos.length === 0 ? (
                    <p className="cal-sin-juego">Sin juegos</p>
                  ) : juegos.map(p => {
                    const estado = (p.estado || 'Programado').toLowerCase()
                    const mostrarMarcador = ['en vivo', 'finalizado'].includes(estado)
                    return (
                      <article
                        key={p.id}
                        className={`cal-partido cal-partido-${estado.replace(/\s+/g, '-')}`}
                      >
                        <div className="cal-hora">{hora(p.hora)}</div>
                        <div className="cal-equipo cal-equipo-visitante">
                          <span>{p.equipo_visitante}</span>
                          <b>{mostrarMarcador ? p.carreras_visitante ?? 0 : '—'}</b>
                        </div>
                        <div className="cal-equipo cal-equipo-local">
                          <span>{p.equipo_local}</span>
                          <b>{mostrarMarcador ? p.carreras_local ?? 0 : '—'}</b>
                        </div>
                        <p>{p.categoria || 'Categoría por confirmar'}</p>
                        <p>📍 {p.estadio || 'Estadio por confirmar'}</p>
                        <strong className={`cal-estado ${estado === 'en vivo' ? 'cal-vivo' : ''}`}>
                          {p.estado || 'Programado'}
                        </strong>
                        {p.youtube_url && /^https?:\/\//i.test(p.youtube_url) && (
                          <a href={p.youtube_url} target="_blank" rel="noopener noreferrer">
                            ▶ Transmisión
                          </a>
                        )}
                      </article>
                    )
                  })}
                </section>
              )
            })}
          </div>
          <p className="cal-ayuda">En celular, desliza para ver los siete días. Fechas según Panamá.</p>
        </>
      )}

      {administrando && isAdmin && createPortal(
        <div className="cal-admin-fondo" role="dialog"
          aria-modal="true" aria-label="Administrar juegos">
          <CentroPartidos onCerrar={() => {
            setAdministrando(false)
            setVersion(v => v + 1)
          }} />
        </div>,
        document.body
      )}
    </section>
  )
}
