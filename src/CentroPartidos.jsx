import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import './CentroPartidos.css'

const formularioInicial = {
  fecha: '',
  hora: '',
  equipo_visitante: '',
  equipo_local: 'Generales',
  categoria: '',
  estadio: 'Estadio Pepe Osorio',
  estado: 'Programado',
  carreras_visitante: 0,
  carreras_local: 0,
  youtube_url: '',
  notas: ''
}

export default function CentroPartidos({ onCerrar }) {
  const [partidos, setPartidos] = useState([])
  const [formulario, setFormulario] = useState(formularioInicial)
  const [editandoId, setEditandoId] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function cargarPartidos() {
    setCargando(true)

    const { data, error } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })

    if (error) {
      console.error(error)
      setMensaje('No se pudieron cargar los partidos.')
    } else {
      setPartidos(data || [])
    }

    setCargando(false)
  }

  useEffect(() => {
    cargarPartidos()
  }, [])

  function actualizarCampo(evento) {
    const { name, value } = evento.target

    setFormulario((actual) => ({
      ...actual,
      [name]: value
    }))
  }

  function limpiarFormulario() {
    setFormulario(formularioInicial)
    setEditandoId(null)
    setMensaje('')
  }

  async function guardarPartido(evento) {
    evento.preventDefault()
    setMensaje('')

    if (
      !formulario.fecha ||
      !formulario.hora ||
      !formulario.equipo_visitante.trim() ||
      !formulario.equipo_local.trim()
    ) {
      setMensaje('Completa fecha, hora y nombres de los equipos.')
      return
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setMensaje('Debes iniciar sesión como administrador.')
      return
    }

    setGuardando(true)

    const datos = {
      ...formulario,
      equipo_visitante: formulario.equipo_visitante.trim(),
      equipo_local: formulario.equipo_local.trim(),
      categoria: formulario.categoria.trim() || null,
      estadio: formulario.estadio.trim() || null,
      youtube_url: formulario.youtube_url.trim() || null,
      notas: formulario.notas.trim() || null,
      carreras_visitante: Number(formulario.carreras_visitante) || 0,
      carreras_local: Number(formulario.carreras_local) || 0,
      actualizado_en: new Date().toISOString()
    }

    let resultado

    if (editandoId) {
      resultado = await supabase
        .from('partidos')
        .update(datos)
        .eq('id', editandoId)
        .eq('creado_por', user.id)
    } else {
      resultado = await supabase
        .from('partidos')
        .insert({
          ...datos,
          creado_por: user.id
        })
    }

    if (resultado.error) {
      console.error(resultado.error)
      setMensaje(`Error: ${resultado.error.message}`)
    } else {
      setMensaje(
        editandoId
          ? 'Partido actualizado correctamente.'
          : 'Partido programado correctamente.'
      )
      setFormulario(formularioInicial)
      setEditandoId(null)
      await cargarPartidos()
    }

    setGuardando(false)
  }

  function editarPartido(partido) {
    setFormulario({
      fecha: partido.fecha || '',
      hora: partido.hora?.slice(0, 5) || '',
      equipo_visitante: partido.equipo_visitante || '',
      equipo_local: partido.equipo_local || 'Generales',
      categoria: partido.categoria || '',
      estadio: partido.estadio || '',
      estado: partido.estado || 'Programado',
      carreras_visitante: partido.carreras_visitante ?? 0,
      carreras_local: partido.carreras_local ?? 0,
      youtube_url: partido.youtube_url || '',
      notas: partido.notas || ''
    })

    setEditandoId(partido.id)
    setMensaje('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function eliminarPartido(partido) {
    const confirmar = window.confirm(
      `¿Eliminar el partido contra ${partido.equipo_visitante}?`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('partidos')
      .delete()
      .eq('id', partido.id)

    if (error) {
      setMensaje(`Error: ${error.message}`)
    } else {
      setMensaje('Partido eliminado.')
      await cargarPartidos()
    }
  }

  return (
    <main className="centro-partidos">
      <header className="centro-partidos-cabecera">
        <div>
          <small>GENERALES DE CHITRÉ</small>
          <h1>Centro de Partidos</h1>
          <p>Programa juegos, registra resultados y organiza transmisiones.</p>
        </div>

        <button type="button" onClick={onCerrar}>
          ×
        </button>
      </header>

      <form
        className="centro-partidos-formulario"
        onSubmit={guardarPartido}
      >
        <h2>{editandoId ? 'Editar partido' : 'Programar partido'}</h2>

        <div className="centro-partidos-campos">
          <label>
            Fecha
            <input
              type="date"
              name="fecha"
              value={formulario.fecha}
              onChange={actualizarCampo}
              required
            />
          </label>

          <label>
            Hora
            <input
              type="time"
              name="hora"
              value={formulario.hora}
              onChange={actualizarCampo}
              required
            />
          </label>

          <label>
            Equipo visitante
            <input
              name="equipo_visitante"
              value={formulario.equipo_visitante}
              onChange={actualizarCampo}
              placeholder="Nombre del rival"
              required
            />
          </label>

          <label>
            Equipo local
            <input
              name="equipo_local"
              value={formulario.equipo_local}
              onChange={actualizarCampo}
              required
            />
          </label>

          <label>
            Categoría
            <input
              name="categoria"
              value={formulario.categoria}
              onChange={actualizarCampo}
              placeholder="Ejemplo: Bim-bim"
            />
          </label>

          <label>
            Estadio
            <input
              name="estadio"
              value={formulario.estadio}
              onChange={actualizarCampo}
            />
          </label>

          <label>
            Estado
            <select
              name="estado"
              value={formulario.estado}
              onChange={actualizarCampo}
            >
              <option>Programado</option>
              <option>En vivo</option>
              <option>Finalizado</option>
              <option>Cancelado</option>
            </select>
          </label>

          <label>
            Carreras visitante
            <input
              type="number"
              min="0"
              name="carreras_visitante"
              value={formulario.carreras_visitante}
              onChange={actualizarCampo}
            />
          </label>

          <label>
            Carreras local
            <input
              type="number"
              min="0"
              name="carreras_local"
              value={formulario.carreras_local}
              onChange={actualizarCampo}
            />
          </label>

          <label className="centro-partidos-ancho">
            Enlace de YouTube
            <input
              type="url"
              name="youtube_url"
              value={formulario.youtube_url}
              onChange={actualizarCampo}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>

          <label className="centro-partidos-ancho">
            Notas
            <textarea
              name="notas"
              value={formulario.notas}
              onChange={actualizarCampo}
              rows="3"
            />
          </label>
        </div>

        {mensaje && <p className="centro-partidos-mensaje">{mensaje}</p>}

        <div className="centro-partidos-acciones">
          <button type="submit" disabled={guardando}>
            {guardando
              ? 'Guardando…'
              : editandoId
                ? 'Guardar cambios'
                : 'Programar partido'}
          </button>

          {editandoId && (
            <button type="button" onClick={limpiarFormulario}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <section className="centro-partidos-listado">
        <h2>Partidos registrados</h2>

        {cargando ? (
          <p>Cargando partidos…</p>
        ) : partidos.length === 0 ? (
          <p className="centro-partidos-vacio">
            Todavía no hay partidos programados.
          </p>
        ) : (
          <div className="centro-partidos-tarjetas">
            {partidos.map((partido) => (
              <article key={partido.id}>
                <span className={`partido-estado partido-${partido.estado
                  .toLowerCase()
                  .replace(' ', '-')}`}
                >
                  {partido.estado}
                </span>

                <small>
                  {partido.fecha} · {partido.hora?.slice(0, 5)}
                </small>

                <h3>
                  {partido.equipo_visitante}
                  <b>
                    {partido.carreras_visitante}
                    {' - '}
                    {partido.carreras_local}
                  </b>
                  {partido.equipo_local}
                </h3>

                <p>
                  {partido.categoria || 'Sin categoría'}
                  {' · '}
                  {partido.estadio || 'Estadio por confirmar'}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => editarPartido(partido)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminarPartido(partido)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
