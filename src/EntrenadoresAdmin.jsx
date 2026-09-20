import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './EntrenadoresAdmin.css'

export default function EntrenadoresAdmin({ onVolver }) {
  const [entrenadores, setEntrenadores] = useState([])
  const [formulario, setFormulario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarEntrenadores()
  }, [])

  async function cargarEntrenadores() {
    setCargando(true)
    setMensaje('')
const {
  data: { user },
} = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('perfiles_entrenadores')
      .select('*')
      .order('orden', { ascending: true })

    if (error) {
      setMensaje(`No se pudieron cargar los perfiles: ${error.message}`)
    } else {
      setEntrenadores(data || [])
    }

    setCargando(false)
  }

 function editarEntrenador(entrenador) {
  setMensaje('')
  setFormulario({ ...entrenador })
}

function nuevoEntrenador() {
  setMensaje('')

  setFormulario({
    id: null,
    nombre: '',
    cargo: '',
    especialidad: '',
    experiencia: '',
    biografia: '',
    foto_url: '',
    telefono: '',
    activo: true,
    orden: entrenadores.length + 1,
  })

  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    document
      .querySelector('.entrenadores-admin')
      ?.scrollTo({ top: 0, behavior: 'smooth' })
  }, 0)
}
  function cambiarCampo(e) {
    const { name, value, type, checked } = e.target

    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }
async function subirFoto(e) {
  const archivo = e.target.files?.[0]

  if (!archivo) return

  if (!archivo.type.startsWith('image/')) {
    setMensaje('Selecciona un archivo de imagen.')
    return
  }

  setSubiendoFoto(true)
  setMensaje('Subiendo foto...')

  const extension = archivo.name.split('.').pop()
  const nombreArchivo = `entrenadores/${formulario.id}-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('fotos-jugadores')
    .upload(nombreArchivo, archivo, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    setMensaje(`No se pudo subir la foto: ${error.message}`)
    setSubiendoFoto(false)
    return
  }

  const { data } = supabase.storage
    .from('fotos-jugadores')
    .getPublicUrl(nombreArchivo)

  setFormulario((actual) => ({
    ...actual,
    foto_url: data.publicUrl,
  }))

  setMensaje('Foto subida. Pulsa Guardar cambios para terminar.')
  setSubiendoFoto(false)
}
  async function guardarEntrenador(e) {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')

    const cambios = {
      nombre: formulario.nombre,
      cargo: formulario.cargo,
      especialidad: formulario.especialidad,
      experiencia: formulario.experiencia,
      biografia: formulario.biografia,
      foto_url: formulario.foto_url || null,
      telefono: formulario.telefono || null,
      activo: formulario.activo,
      orden: Number(formulario.orden) || 1,
    }

   let resultado

if (formulario.id) {
  resultado = await supabase
    .from('perfiles_entrenadores')
    .update(cambios)
    .eq('id', formulario.id)
    .select()
    .single()
} else {
  resultado = await supabase
    .from('perfiles_entrenadores')
    .insert(cambios)
    .select()
    .single()
}

const { data, error } = resultado

    if (error) {
  setMensaje(`No se pudo guardar: ${error.message}`)
} else if (!data) {
  setMensaje('No se guardó el perfil. Verifica los permisos de administrador.')
} else {
      setMensaje('Perfil actualizado correctamente.')
      setFormulario(null)
      await cargarEntrenadores()
    }

    setGuardando(false)
  }

  return (
    <div className="app-shell entrenadores-admin">
      <header className="topbar">
        <button type="button" className="ghost" onClick={onVolver}>
          ← Volver
        </button>

        <div>
          <div className="eyebrow">Administración</div>
          <h1>Perfiles de entrenadores</h1>
        </div>
      </header>

      <main>
        {mensaje && <p>{mensaje}</p>}

        {formulario ? (
          <form className="panel" onSubmit={guardarEntrenador}>
            <h2>Editar perfil</h2>
<label>
  Nombre
  <input
    name="nombre"
    value={formulario.nombre || ''}
    onChange={cambiarCampo}
    required
  />
</label>
           <label>
  Foto del entrenador
  <input
    type="file"
    accept="image/*"
    onChange={subirFoto}
    disabled={subiendoFoto}
  />
</label>

{subiendoFoto && <p>Subiendo foto...</p>}

{formulario.foto_url && (
  <img
    className="entrenador-foto-preview"
    src={formulario.foto_url}
    alt={`Vista previa de ${formulario.nombre}`}
  />
)}

            <label>
              Cargo
              <input
                name="cargo"
                value={formulario.cargo || ''}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              Especialidad
              <input
                name="especialidad"
                value={formulario.especialidad || ''}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              Experiencia
              <textarea
                name="experiencia"
                value={formulario.experiencia || ''}
                onChange={cambiarCampo}
                rows="3"
              />
            </label>

            <label>
              Biografía
              <textarea
                name="biografia"
                value={formulario.biografia || ''}
                onChange={cambiarCampo}
                rows="6"
              />
            </label>

            <label>
              Enlace de la foto
              <input
                name="foto_url"
                value={formulario.foto_url || ''}
                onChange={cambiarCampo}
                placeholder="https://..."
              />
            </label>

            <label>
              Teléfono
              <input
                name="telefono"
                value={formulario.telefono || ''}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              Orden
              <input
                name="orden"
                type="number"
                min="1"
                value={formulario.orden || 1}
                onChange={cambiarCampo}
              />
            </label>

            <label>
              <input
                name="activo"
                type="checkbox"
                checked={Boolean(formulario.activo)}
                onChange={cambiarCampo}
              />
              Perfil visible públicamente
            </label>

            <div>
              <button
                type="button"
                className="ghost"
                onClick={() => setFormulario(null)}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primary"
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : cargando ? (
          <p>Cargando entrenadores...</p>
        ) : (
          <section className="panel">
            <button
  type="button"
  className="primary"
  onClick={nuevoEntrenador}
>
  + Agregar entrenador
</button>
            {entrenadores.length === 0 ? (
              <p>No hay perfiles registrados.</p>
            ) : (
              entrenadores.map((entrenador) => (
                <article key={entrenador.id} className="card">
                  <h2>{entrenador.nombre}</h2>
                  <p>{entrenador.cargo}</p>
                  <p>{entrenador.especialidad}</p>

                  <button
                    type="button"
                    className="primary"
                    onClick={() => editarEntrenador(entrenador)}
                  >
                    Editar perfil
                  </button>
                </article>
              ))
            )}
          </section>
        )}
      </main>
    </div>
  )
}