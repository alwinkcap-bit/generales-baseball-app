import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './ProximoPartido.css'
import logoGenerales3D from './public/logo-generales-3d.png'


function formatoFecha(valor) {
  if (!valor) return 'FECHA POR CONFIRMAR'

  const fecha = new Date(`${valor.slice(0, 10)}T12:00:00Z`)
  if (Number.isNaN(fecha.getTime())) return valor

  return new Intl.DateTimeFormat('es-PA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  }).format(fecha).replace(/\./g, '').toUpperCase()
}

function formatoHora(valor) {
  if (!valor || !/^\d{1,2}:\d{2}/.test(valor)) {
    return valor || 'Hora por confirmar'
  }

  const [horas, minutos] = valor.split(':').map(Number)
  const periodo = horas < 12 ? 'a. m.' : 'p. m.'
  return `${horas % 12 || 12}:${String(minutos).padStart(2, '0')} ${periodo}`
}

export default function ProximoPartido() {
  const [partido, setPartido] = useState(null)

  useEffect(() => {
    let activo = true

    async function cargarPartido() {
      const hoy = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Panama',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date())

      const { data, error } = await supabase
        .from('partidos')
        .select('id,fecha,hora,equipo_visitante,equipo_local,estadio,estado,logo_rival')
        .gte('fecha', hoy)
        .order('fecha', { ascending: true })
        .order('hora', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Error al cargar próximo partido:', error)
        return
      }

      const siguiente = (data || []).find(p =>
        !['finalizado', 'cancelado', 'suspendido'].includes(
          (p.estado || '').trim().toLowerCase()
        )
      )

      if (!siguiente || !activo) return

      const rival = /generales/i.test(siguiente.equipo_local || '')
        ? siguiente.equipo_visitante
        : siguiente.equipo_local

      setPartido({
        juego_fecha: siguiente.fecha,
        juego_hora: siguiente.hora?.slice(0, 5) || 'Por confirmar',
        juego_rival: rival || 'Por confirmar',
        juego_lugar: siguiente.estadio || 'Por confirmar',
        logo_rival: siguiente.logo_rival || null
      })
    }

    cargarPartido()

    return () => { activo = false }
  }, [])

  if (!partido) return null

  return (
    <section className="proximo-partido" aria-label="Próximo partido">
      <div className="proximo-partido-encabezado">
        <span>⚾ PRÓXIMO PARTIDO</span>
        <span className="proximo-partido-fecha">
          {formatoFecha(partido.juego_fecha)}
        </span>
      </div>

      <div className="proximo-partido-equipos">
        <div className="proximo-partido-equipo">
          <img src={`${import.meta.env.BASE_URL}logo-generales-nuevo.png`} alt="Generales de Chitré" />
          <strong>GENERALES</strong>
        </div>

        <span className="proximo-partido-vs">VS</span>

        <div className="proximo-partido-equipo">
          {partido.logo_rival && (
            <img src={partido.logo_rival} alt={partido.juego_rival} />
          )}
          <strong>{partido.juego_rival}</strong>
        </div>
      </div>

      <div className="proximo-partido-detalles">
        <span>🕒 {formatoHora(partido.juego_hora)}</span>
        <span>📍 {partido.juego_lugar}</span>
      </div>
    </section>
  )
}
