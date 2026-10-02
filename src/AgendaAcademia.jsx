import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase'
import './AgendaAcademia.css'

const agendaInicial = {
  entrenamiento_dias: 'Por confirmar',
  entrenamiento_hora: 'Por confirmar',
  entrenamiento_lugar: 'Estadio Pepe Osorio',
  juego_fecha: 'Por confirmar',
  juego_hora: 'Por confirmar',
  juego_rival: 'Rival por confirmar',
  juego_lugar: 'Lugar por confirmar',
  mostrar_juego: true
}

export default function AgendaAcademia({ isAdmin }) {
  const [agenda, setAgenda] = useState(agendaInicial)
  const [formulario, setFormulario] = useState(agendaInicial)
  const [editando, setEditando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    cargarAgenda()
  }, [])

  async function cargarAgenda() {
    setCargando(true)

    const { data, error } = await supabase
      .from('agenda_academia')
      .select(`
        entrenamiento_dias,
        entrenamiento_hora,
        entrenamiento_lugar,
        juego_fecha,
        juego_hora,
        juego_rival,
        juego_lugar,
        mostrar_juego
      `)
      .eq('id', 1)
      .single()

    if (error) {
      console.error('No se pudo cargar la agenda:', error)
    } else if (data) {
      setAgenda(data)
      setFormulario(data)
    }

    setCargando(false)
  }

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target

    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function abrirEditor() {
    setFormulario(agenda)
    setMensaje('')
    setEditando(true)
  }

  async function guardarAgenda(evento) {
    evento.preventDefault()
    setGuardando(true)
    setMensaje('')

    const cambios = {
      entrenamiento_dias:
        formulario.entrenamiento_dias.trim() || 'Por confirmar',
      entrenamiento_hora:
        formulario.entrenamiento_hora.trim() || 'Por confirmar',
      entrenamiento_lugar:
        formulario.entrenamiento_lugar.trim() || 'Por confirmar',
      juego_fecha:
        formulario.juego_fecha.trim() || 'Por confirmar',
      juego_hora:
        formulario.juego_hora.trim() || 'Por confirmar',
      juego_rival:
        formulario.juego_rival.trim() || 'Rival por confirmar',
      juego_lugar:
        formulario.juego_lugar.trim() || 'Lugar por confirmar',
      mostrar_juego: formulario.mostrar_juego,
      actualizado_en: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('agenda_academia')
      .update(cambios)
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      console.error(error)
      setMensaje(`No se pudo guardar: ${error.message}`)
    } else {
      setAgenda(data)
      setFormulario(data)
      setEditando(false)
    }

    setGuardando(false)
  }

  return (
    <>
      <section className="agenda-academia">
        <header className="agenda-academia-titulo">
          <div>
            <small>AGENDA DE LA ACADEMIA</small>
            <h2>Próximas actividades</h2>
          </div>

          {isAdmin && (
            <button type="button" onClick={abrirEditor}>
              ✏️ Editar agenda
            </button>
          )}
        </header>

        {cargando ? (
          <p className="agenda-cargando">Cargando agenda…</p>
        ) : (
          <div className="agenda-academia-grid">
            <article className="agenda-card agenda-entrenamiento">
              <span className="agenda-icono">⚾</span>

              <div>
                <small>PRÓXIMO ENTRENAMIENTO</small>
                <h3>{agenda.entrenamiento_dias}</h3>
                <p>🕒 {agenda.entrenamiento_hora}</p>
                <p>📍 {agenda.entrenamiento_lugar}</p>
              </div>
            </article>

            {agenda.mostrar_juego && (
              <article className="agenda-card agenda-juego">
                <span className="agenda-icono">🏟️</span>

                <div>
                  <small>PRÓXIMO JUEGO</small>
                  <h3>Generales vs. {agenda.juego_rival}</h3>
                  <p>📅 {agenda.juego_fecha}</p>
                  <p>🕒 {agenda.juego_hora}</p>
                  <p>📍 {agenda.juego_lugar}</p>
                </div>
              </article>
            )}
          </div>
        )}
      </section>

      {editando && createPortal(
        <div
          className="agenda-editor-fondo"
          onClick={() => setEditando(false)}
        >
          <form
            className="agenda-editor"
            onSubmit={guardarAgenda}
            onClick={(evento) => evento.stopPropagation()}
          >
            <header>
              <div>
                <small>ADMINISTRACIÓN</small>
                <h2>Editar agenda</h2>
              </div>

              <button
                type="button"
                onClick={() => setEditando(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>

            <fieldset>
              <legend>⚾ Próximo entrenamiento</legend>

              <label>
                Días o fecha exacta
                <input
                  name="entrenamiento_dias"
                  value={formulario.entrenamiento_dias}
                  onChange={cambiarCampo}
                  placeholder="Ejemplo: Lunes 5 de octubre"
                />
              </label>

              <label>
                Hora
                <input
                  name="entrenamiento_hora"
                  value={formulario.entrenamiento_hora}
                  onChange={cambiarCampo}
                  placeholder="Ejemplo: 5:00 p. m."
                />
              </label>

              <label>
                Lugar
                <input
                  name="entrenamiento_lugar"
                  value={formulario.entrenamiento_lugar}
                  onChange={cambiarCampo}
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>🏟️ Próximo juego</legend>

              <label>
                Fecha
                <input
                  name="juego_fecha"
                  value={formulario.juego_fecha}
                  onChange={cambiarCampo}
                  placeholder="Ejemplo: Sábado 10 de octubre"
                />
              </label>

              <label>
                Hora
                <input
                  name="juego_hora"
                  value={formulario.juego_hora}
                  onChange={cambiarCampo}
                  placeholder="Ejemplo: 8:30 a. m."
                />
              </label>

              <label>
                Rival
                <input
                  name="juego_rival"
                  value={formulario.juego_rival}
                  onChange={cambiarCampo}
                />
              </label>

              <label>
                Lugar
                <input
                  name="juego_lugar"
                  value={formulario.juego_lugar}
                  onChange={cambiarCampo}
                />
              </label>

              <label className="agenda-editor-check">
                <input
                  type="checkbox"
                  name="mostrar_juego"
                  checked={formulario.mostrar_juego}
                  onChange={cambiarCampo}
                />
                Mostrar próximo juego al público
              </label>
            </fieldset>

            {mensaje && <p className="agenda-editor-mensaje">{mensaje}</p>}

            <button
              type="submit"
              className="agenda-editor-guardar"
              disabled={guardando}
            >
              {guardando ? 'Guardando…' : 'Guardar agenda'}
            </button>
          </form>
        </div>,
        document.body
      )}
    </>
  )
}
