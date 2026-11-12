import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './ProximoPartido.css'
import logoGenerales3D from './public/logo-generales-3d.png'


function formatoFecha(valor) {
  if (!valor) return 'FECHA POR CONFIRMAR'

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) return valor.toUpperCase()

const fecha = new Date(`${valor.trim()}T12:00:00Z`)
  if (Number.isNaN(fecha.getTime())) return valor

  return new Intl.DateTimeFormat('es-PA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  }).format(fecha).replace(/\./g, '').toUpperCase()
}

function formatoHora(valor) {
  if (!valor) {
    return 'Hora por confirmar'
  }

  const hora = String(valor).trim()

  if (!/^\d{1,2}:\d{2}(?::\d{2})?$/.test(hora)) {
    return hora
  }

  const [horas, minutos] = hora.split(':').map(Number)
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
  .from('agenda_academia')
  .select(`
    juego_fecha,
    juego_hora,
    juego_rival,
    juego_lugar,
    mostrar_juego,
    logo_generales,
    logo_rival
  `)
  .eq('id', 1)
  .single()

      if (error) {
        console.error('Error al cargar próximo partido:', error)
        return
      }

    if (!activo) return

if (!data || !data.mostrar_juego) {
  setPartido(null)
  return
}

setPartido({
  juego_fecha: data.juego_fecha || 'Por confirmar',
  juego_hora: data.juego_hora || 'Por confirmar',
  juego_rival: data.juego_rival || 'Por confirmar',
  juego_lugar: data.juego_lugar || 'Por confirmar',
  logo_generales: data.logo_generales || null,
  logo_rival: data.logo_rival || null
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
          <img
  src={partido.logo_generales || `${import.meta.env.BASE_URL}logo-generales-nuevo.png?v=2`}
  alt="Generales de Chitré"
/>
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
