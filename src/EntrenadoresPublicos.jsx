import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './EntrenadoresPublicos.css'

export default function EntrenadoresPublicos() {
  const [entrenadores, setEntrenadores] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarEntrenadores()
  }, [])

  async function cargarEntrenadores() {
    const { data, error } = await supabase
      .from('perfiles_entrenadores')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    if (!error) {
      setEntrenadores(data || [])
    }

    setCargando(false)
  }

  if (cargando) {
    return <p className="entrenadores-cargando">Cargando entrenadores...</p>
  }

  if (entrenadores.length === 0) {
    return null
  }

  return (
    <div className="entrenadores-publicos">
      <span className="inicio-etiqueta">NUESTRO EQUIPO</span>
      <h2>Entrenadores</h2>

      <div className="entrenadores-publicos-grid">
        {entrenadores.map((entrenador) => (
          <article
            className="entrenador-publico-card"
            key={entrenador.id}
          >
            {entrenador.foto_url && (
              <img
                src={entrenador.foto_url}
                alt={entrenador.nombre}
                className="entrenador-publico-foto"
              />
            )}

            <div className="entrenador-publico-contenido">
              <h3>{entrenador.nombre}</h3>

              {entrenador.cargo && (
                <strong>{entrenador.cargo}</strong>
              )}

              {entrenador.especialidad && (
                <p>{entrenador.especialidad}</p>
              )}

              {entrenador.experiencia && (
                <p>{entrenador.experiencia}</p>
              )}

              {entrenador.biografia && (
                <p className="entrenador-publico-biografia">
                  {entrenador.biografia}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}