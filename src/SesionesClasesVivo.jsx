import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import SalaClaseEnVivo from './SalaClaseEnVivo'
import './SesionesClasesVivo.css'

export default function SesionesClasesVivo({
  usuario,
  isAdmin
}) {
  const [sesiones, setSesiones] = useState([])
  const [salaActiva, setSalaActiva] = useState(null)
  const [formularioOpen, setFormularioOpen] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [formulario, setFormulario] = useState({
    clase_id: '5',
    titulo: 'Estrategia y lectura del juego',
    fecha_inicio: '',
    duracion_minutos: '60'
  })

  useEffect(() => {
    cargarSesiones()
  }, [usuario?.id])

  async function cargarSesiones() {
    if (!usuario?.id) return

    const { data, error } = await supabase
      .from('sesiones_clases_vivo')
      .select('*')
      .eq('finalizada', false)
      .order('fecha_inicio', { ascending: true })

    if (error) {
      setMensaje(error.message)
      return
    }

    setSesiones(data || [])
  }

  function seleccionarClase(evento) {
    const claseId = evento.target.value

    setFormulario((actual) => ({
      ...actual,
      clase_id: claseId,
      titulo:
        claseId === '6'
          ? 'Bateo avanzado'
          : 'Estrategia y lectura del juego'
    }))
  }

  async function crearSesion(evento) {
    evento.preventDefault()
    setMensaje('')

    const sala =
      `Generales-${formulario.clase_id}-` +
      crypto.randomUUID().replaceAll('-', '')

    const { error } = await supabase
      .from('sesiones_clases_vivo')
      .insert({
        clase_id: Number(formulario.clase_id),
        titulo: formulario.titulo.trim(),
        sala,
        fecha_inicio:
          new Date(formulario.fecha_inicio).toISOString(),
        duracion_minutos:
          Number(formulario.duracion_minutos)
      })

    if (error) {
      setMensaje(error.message)
      return
    }

    setFormularioOpen(false)
    setFormulario((actual) => ({
      ...actual,
      fecha_inicio: ''
    }))
    setMensaje('Sesión programada correctamente.')
    await cargarSesiones()
  }

  async function iniciarSesion(sesion) {
    const { error } = await supabase
      .from('sesiones_clases_vivo')
      .update({
        activa: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', sesion.id)

    if (error) {
      setMensaje(error.message)
      return
    }

    setSalaActiva({ ...sesion, activa: true })
    await cargarSesiones()
  }

  async function finalizarSesion(sesion) {
    if (!window.confirm('¿Finalizar esta clase en vivo?')) {
      return
    }

    const { error } = await supabase
      .from('sesiones_clases_vivo')
      .update({
        activa: false,
        finalizada: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', sesion.id)

    if (error) {
      setMensaje(error.message)
      return
    }

    setSalaActiva(null)
    setMensaje('Clase finalizada.')
    await cargarSesiones()
  }

  function formatearFecha(fecha) {
    return new Intl.DateTimeFormat('es-PA', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Panama'
    }).format(new Date(fecha))
  }

  if (!usuario?.id) return null

  return (
    <>
      <section className="sesiones-vivo-panel">
        <header>
          <div>
            <small>ACADEMIA EN VIVO</small>
            <h3>Clases programadas</h3>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                setFormularioOpen((actual) => !actual)
              }
            >
              {formularioOpen
                ? 'Cancelar'
                : '＋ Programar clase'}
            </button>
          )}
        </header>

        {formularioOpen && isAdmin && (
          <form
            className="sesiones-vivo-formulario"
            onSubmit={crearSesion}
          >
            <label>
              Clase
              <select
                value={formulario.clase_id}
                onChange={seleccionarClase}
              >
                <option value="5">
                  Estrategia y lectura del juego
                </option>
                <option value="6">
                  Bateo avanzado
                </option>
              </select>
            </label>

            <label>
              Título
              <input
                value={formulario.titulo}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    titulo: evento.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Fecha y hora
              <input
                type="datetime-local"
                value={formulario.fecha_inicio}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    fecha_inicio: evento.target.value
                  }))
                }
                required
              />
            </label>

            <label>
              Duración
              <select
                value={formulario.duracion_minutos}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    duracion_minutos: evento.target.value
                  }))
                }
              >
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
              </select>
            </label>

            <button type="submit">
              Guardar sesión
            </button>
          </form>
        )}

        {mensaje && (
          <p className="sesiones-vivo-mensaje">{mensaje}</p>
        )}

        {sesiones.length === 0 ? (
          <p className="sesiones-vivo-vacio">
            No hay clases programadas.
          </p>
        ) : (
          <div className="sesiones-vivo-lista">
            {sesiones.map((sesion) => (
              <article key={sesion.id}>
                <span className={sesion.activa ? 'en-vivo' : ''}>
                  {sesion.activa ? '● EN VIVO' : 'PROGRAMADA'}
                </span>

                <h4>{sesion.titulo}</h4>

                <p>
                  {formatearFecha(sesion.fecha_inicio)}
                  {' · '}
                  {sesion.duracion_minutos} minutos
                </p>

                <div>
                  {sesion.activa ? (
                    <button
                      type="button"
                      onClick={() => setSalaActiva(sesion)}
                    >
                      Entrar a la clase →
                    </button>
                  ) : isAdmin ? (
                    <button
                      type="button"
                      onClick={() => iniciarSesion(sesion)}
                    >
                      Iniciar transmisión
                    </button>
                  ) : (
                    <strong>
                      Disponible en el horario indicado
                    </strong>
                  )}

                  {isAdmin && sesion.activa && (
                    <button
                      type="button"
                      className="sesion-finalizar"
                      onClick={() => finalizarSesion(sesion)}
                    >
                      Finalizar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {salaActiva && (
        <SalaClaseEnVivo
        sesionId={salaActiva.id}
          sala={salaActiva.sala}
          titulo={salaActiva.titulo}
          usuario={usuario}
          isAdmin={isAdmin}
          onCerrar={() => setSalaActiva(null)}
        />
      )}
    </>
  )
}
