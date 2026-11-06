import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './CintilloPracticas.css'

export default function CintilloPracticas() {
  const [practicas, setPracticas] = useState(null)

  useEffect(() => {
    let activo = true

    async function cargarPracticas() {
      const { data, error } = await supabase
        .from('agenda_academia')
        .select('entrenamiento_dias,entrenamiento_hora,entrenamiento_lugar')
        .eq('id', 1)
        .maybeSingle()

      if (error) {
        console.error('Error al cargar prácticas:', error)
        return
      }

      if (activo && data) setPracticas(data)
    }

    cargarPracticas()
    return () => { activo = false }
  }, [])

  if (!practicas || !practicas.entrenamiento_dias) return null

  return (
    <section className="cintillo-practicas" aria-label="Horarios de prácticas">
      <span className="cintillo-practicas-icono">⚾</span>

      <div className="cintillo-practicas-info">
        <strong>PRÓXIMAS PRÁCTICAS</strong>
        <span>
          {practicas.entrenamiento_dias}
          {practicas.entrenamiento_hora && ` · ${practicas.entrenamiento_hora}`}
        </span>
        {practicas.entrenamiento_lugar && (
          <small>📍 {practicas.entrenamiento_lugar}</small>
        )}
      </div>
    </section>
  )
}
