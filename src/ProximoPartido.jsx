import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './ProximoPartido.css'
import logoGenerales3D from './public/logo-generales-3d.png'

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
        .select('id,fecha,hora,equipo_visitante,equipo_local,estadio,estado')
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

      const { data: agenda } = await supabase
        .from('agenda_academia')
        .select('juego_rival,logo_rival')
        .eq('id', 1)
        .maybeSingle()

      if (!activo) return

      const rival = /generales/i.test(siguiente.equipo_local || '')
        ? siguiente.equipo_visitante
        : siguiente.equipo_local

      const logoRival =
        agenda?.juego_rival?.trim().toLowerCase() === rival?.trim().toLowerCase()
          ? agenda.logo_rival
          : null

      setPartido({
        juego_fecha: siguiente.fecha,
        juego_hora: siguiente.hora?.slice(0, 5) || 'Por confirmar',
        juego_rival: rival || 'Por confirmar',
        juego_lugar: siguiente.estadio || 'Por confirmar',
        logo_rival: logoRival
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
          {partido.juego_fecha}
        </span>
      </div>

      <div className="proximo-partido-equipos">
        <div className="proximo-partido-equipo">
          <img src={logoGenerales3D} alt="Generales de Chitré" />
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
        <span>🕒 {partido.juego_hora}</span>
        <span>📍 {partido.juego_lugar}</span>
      </div>
    </section>
  )
}
