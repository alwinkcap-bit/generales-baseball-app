import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './supabase'
import './ClasesVirtuales.css'
import SesionesClasesVivo from './SesionesClasesVivo'
import fildeoSecuencia from './public/clases/fildeo-secuencia.png'
import bateoSecuencia from './public/clases/bateo-secuencia.png'
import pequenosGigantes from './public/clases/pequenos-gigantes.png'

const clases = [
  {
    id: 1,
    icono: '⚾',
    titulo: 'Fundamentos del béisbol',
    descripcion: 'Terreno, bases y objetivo del juego.',
    disponible: true
  },
  {
    id: 2,
    icono: '🧤',
    titulo: 'Fildeo',
    descripcion: 'Posición básica, rodados y recepción.',
    disponible: true
  },
  {
    id: 3,
    icono: '🏏',
    titulo: 'Bateo',
    descripcion: 'Agarre, postura, balance y coordinación.',
    disponible: true
  },
  {
    id: 4,
    icono: '🌟',
    titulo: 'Pequeños Gigantes',
    descripcion: 'Clase especial de béisbol para niños de 4 a 6 años.',
    disponible: true
  },
  {
    id: 5,
    icono: '🧠',
    titulo: 'Estrategia y lectura del juego',
    descripcion: 'Decisiones, coberturas y situaciones reales de juego.',
    disponible: false,
    premium: true,
    precio: 5
  },
  {
    id: 6,
    icono: '🏏',
    titulo: 'Bateo avanzado',
    descripcion:
      'Lectura del lanzamiento, enfoque, ajustes y producción ofensiva.',
    disponible: false,
    premium: true,
    precio: 10
  },
  {
    id: 7,
    icono: '🧤',
    titulo: 'Defensa personalizada',
    descripcion:
      'Sesión individual para mejorar fildeo, desplazamientos, recepción y tiros.',
    disponible: false,
    premium: true,
    personalizada: true,
    precio: 15,
    duracion: 60
  },
  {
    id: 8,
    icono: '🏏',
    titulo: 'Bateo personalizado',
    descripcion:
      'Evaluación individual del swing, postura, carga, contacto y terminación.',
    disponible: false,
    premium: true,
    personalizada: true,
    precio: 15,
    duracion: 60
  },
  {
    id: 9,
    icono: '🧠',
    titulo: 'Paquete completo de béisbol',
    descripcion:
      'Programa integral personalizado de defensa, bateo, fundamentos y lectura del juego.',
    disponible: false,
    premium: true,
    personalizada: true,
    precio: 25,
    duracion: 60
  }
]

const preguntasClase1 = [
  {
    pregunta: '¿Cuál es el objetivo principal del equipo ofensivo?',
    opciones: [
      'Anotar carreras',
      'Esconder la pelota',
      'Evitar usar el bate'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Cuántas bases forman el recorrido completo?',
    opciones: ['Dos', 'Tres', 'Cuatro'],
    correcta: 2
  },
  {
    pregunta: '¿Qué equipo intenta realizar los outs?',
    opciones: [
      'El equipo defensivo',
      'El público',
      'El equipo que descansa'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Dónde se completa una carrera?',
    opciones: [
      'En segunda base',
      'En el plato de home',
      'En el jardín central'
    ],
    correcta: 1
  },
  {
    pregunta: '¿Cuántos outs terminan el turno ofensivo?',
    opciones: ['Uno', 'Dos', 'Tres'],
    correcta: 2
  }
]

const preguntasClase2 = [
  {
    pregunta: '¿Cuál es la posición correcta para esperar un roletazo?',
    opciones: [
      'Rodillas flexionadas y peso hacia adelante',
      'Piernas juntas y cuerpo erguido',
      'Sentado sobre los talones'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Qué representa el triángulo de fildeo?',
    opciones: [
      'La ubicación del lanzador',
      'Los dos pies y el guante colocado al frente',
      'Las tres bases del cuadro'
    ],
    correcta: 1
  },
  {
    pregunta: '¿Cómo debe trabajar el guante al recibir el roletazo?',
    opciones: [
      'De arriba hacia abajo',
      'De un lado hacia otro',
      'De abajo hacia arriba'
    ],
    correcta: 2
  },
  {
    pregunta: '¿Para qué se coloca la mano libre sobre el guante?',
    opciones: [
      'Para asegurar la pelota',
      'Para esconder la pelota',
      'Para cerrar los ojos'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Qué debe hacerse antes de lanzar a primera base?',
    opciones: [
      'Cruzar las piernas',
      'Llevar la pelota al pecho y hacer el paso lateral',
      'Lanzar desde el suelo'
    ],
    correcta: 1
  }
]


const preguntasClase3 = [
  {
    pregunta: '¿Cómo deben mantenerse las manos al agarrar el bate?',
    opciones: [
      'Relajadas pero firmes',
      'Totalmente sueltas',
      'Apretadas con toda la fuerza'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Cómo debe ser la postura inicial del bateador?',
    opciones: [
      'Piernas juntas y rodillas rectas',
      'Pies separados, rodillas flexionadas y equilibrio',
      'Todo el peso sobre el pie delantero'
    ],
    correcta: 1
  },
  {
    pregunta: '¿Cómo debe realizarse el paso hacia el lanzador?',
    opciones: [
      'Largo y con mucho peso',
      'Saltando hacia adelante',
      'Corto, suave y controlado'
    ],
    correcta: 2
  },
  {
    pregunta: '¿Dónde debe producirse el contacto con la pelota?',
    opciones: [
      'Frente al plato',
      'Detrás del cuerpo',
      'Sobre la cabeza'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Qué debe hacer la cabeza durante el contacto?',
    opciones: [
      'Girar hacia el jardín',
      'Mantenerse observando el punto de contacto',
      'Mirar hacia el suelo'
    ],
    correcta: 1
  }
]


const preguntasClase4 = [
  {
    pregunta: '¿Cómo colocamos las piernas en la posición de gorila?',
    opciones: [
      'Juntas y rectas',
      'Separadas y con las rodillas flexionadas',
      'Sentados en el suelo'
    ],
    correcta: 1
  },
  {
    pregunta: '¿Cuántas manos usamos para hacer la boca del caimán?',
    opciones: ['Dos manos', 'Una mano', 'Ninguna mano'],
    correcta: 0
  },
  {
    pregunta: '¿Dónde debemos mirar cuando bateamos?',
    opciones: [
      'A la cámara',
      'Al techo',
      'A la pelota'
    ],
    correcta: 2
  },
  {
    pregunta: '¿Qué hacemos con el bate antes de correr?',
    opciones: [
      'Lo dejamos con cuidado en el suelo',
      'Lo lanzamos',
      'Corremos con el bate'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Qué objeto puede representar la primera base?',
    opciones: [
      'Un vaso de vidrio',
      'Un peluche o almohada',
      'Una lámpara'
    ],
    correcta: 1
  }
]

const preguntasPorClase = {
  1: preguntasClase1,
  2: preguntasClase2,
  3: preguntasClase3,
  4: preguntasClase4
}

function obtenerCompletadas() {
  try {
    return JSON.parse(
      window.localStorage.getItem(
        'generales-clases-completadas'
      ) || '[]'
    )
  } catch {
    return []
  }
}

export default function ClasesVirtuales({
  onCerrar,
  usuario,
  isAdmin,
  onLogin
}) {
  const [claseActiva, setClaseActiva] = useState(null)
  const [accesosAutorizados, setAccesosAutorizados] = useState([])
  const [solicitudesUsuario, setSolicitudesUsuario] = useState([])
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([])
  const [mensajeAcceso, setMensajeAcceso] = useState('')
  const [procesandoAcceso, setProcesandoAcceso] = useState(false)
  const [respuestas, setRespuestas] = useState({})
  const [resultado, setResultado] = useState(null)
  const [
    premiumSeleccionada,
    setPremiumSeleccionada
  ] = useState(null)
  const [completadas, setCompletadas] = useState(
    obtenerCompletadas
  )

  const preguntas =
    preguntasPorClase[claseActiva?.id] || []

  function nombreClase(claseId) {
    return (
      clases.find(
        (clase) => clase.id === Number(claseId)
      )?.titulo || `Clase ${claseId}`
    )
  }

  function tieneAcceso(claseId) {
    if (isAdmin) return true

    const ahora = new Date()

    return accesosAutorizados.some((acceso) => {
      const vigente =
        !acceso.fecha_expiracion ||
        new Date(acceso.fecha_expiracion) > ahora

      return (
        Number(acceso.clase_id) === Number(claseId) &&
        acceso.activo &&
        vigente
      )
    })
  }

  function solicitudPendiente(claseId) {
    return solicitudesUsuario.some(
      (solicitud) =>
        Number(solicitud.clase_id) === Number(claseId) &&
        solicitud.estado === 'pendiente'
    )
  }

  async function cargarControlAccesos() {
    if (!usuario?.id) {
      setAccesosAutorizados([])
      setSolicitudesUsuario([])
      setSolicitudesPendientes([])
      return
    }

    const { data: accesos, error: accesosError } =
      await supabase
        .from('accesos_clases_premium')
        .select(
          'id, clase_id, activo, fecha_inicio, fecha_expiracion'
        )
        .eq('user_id', usuario.id)
        .eq('activo', true)

    if (accesosError) {
      console.error(
        'Error cargando accesos:',
        accesosError
      )
    } else {
      setAccesosAutorizados(accesos || [])
    }

    if (isAdmin) {
      const { data, error } = await supabase
        .from('solicitudes_clases_premium')
        .select('*')
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true })

      if (error) {
        console.error(
          'Error cargando solicitudes:',
          error
        )
      } else {
        setSolicitudesPendientes(data || [])
      }

      return
    }

    const { data, error } = await supabase
      .from('solicitudes_clases_premium')
      .select('id, clase_id, estado, created_at')
      .eq('user_id', usuario.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(
        'Error cargando solicitudes del usuario:',
        error
      )
    } else {
      setSolicitudesUsuario(data || [])
    }
  }

  useEffect(() => {
    cargarControlAccesos()

    if (!usuario?.id) return undefined

    const intervalo = window.setInterval(
      cargarControlAccesos,
      5000
    )

    return () => window.clearInterval(intervalo)
  }, [usuario?.id, isAdmin])

  async function solicitarAcceso(clase) {
    let usuarioSolicitud = usuario
    let nombreSolicitante =
      usuario?.user_metadata?.nombre ||
      usuario?.user_metadata?.full_name ||
      ''

    if (!usuarioSolicitud?.id) {
      nombreSolicitante = window.prompt(
        'Escribe tu nombre para solicitar acceso:'
      )?.trim()

      if (!nombreSolicitante) return

      setProcesandoAcceso(true)
      setMensajeAcceso(
        'Preparando tu solicitud de acceso…'
      )

      const { data, error } =
        await supabase.auth.signInAnonymously({
          options: {
            data: {
              nombre: nombreSolicitante
            }
          }
        })

      if (error || !data?.user) {
        setProcesandoAcceso(false)
        console.error(error)

        setMensajeAcceso(
          error?.message ||
          'No se pudo preparar la solicitud.'
        )
        return
      }

      usuarioSolicitud = data.user
    }

    if (solicitudPendiente(clase.id)) {
      setMensajeAcceso(
        '⏳ Ya estás esperando la autorización del administrador.'
      )
      setPremiumSeleccionada(null)
      setProcesandoAcceso(false)
      return
    }

    setProcesandoAcceso(true)
    setMensajeAcceso('Enviando solicitud…')

    const nombre =
      nombreSolicitante ||
      usuarioSolicitud.user_metadata?.nombre ||
      usuarioSolicitud.user_metadata?.full_name ||
      usuarioSolicitud.email?.split('@')[0] ||
      'Visitante'

    const { error } = await supabase
      .from('solicitudes_clases_premium')
      .insert({
        user_id: usuarioSolicitud.id,
        modalidad: 'clase_individual',
        clase_id: clase.id,
        monto: Number(clase.precio || 0),
        estado: 'pendiente',
        solicitante_nombre: nombre,
        solicitante_email:
          usuarioSolicitud.email || ''
      })

    setProcesandoAcceso(false)

    if (error) {
      console.error(error)

      setMensajeAcceso(
        `No se pudo enviar la solicitud: ${error.message}`
      )
      return
    }

    setPremiumSeleccionada(null)

    setSolicitudesUsuario((actuales) => [
      ...actuales,
      {
        clase_id: clase.id,
        estado: 'pendiente'
      }
    ])

    setMensajeAcceso(
      '⏳ Solicitud enviada. Espera la autorización del administrador.'
    )

    await cargarControlAccesos()
  }

  async function autorizarSolicitud(solicitud) {
    if (!isAdmin || procesandoAcceso) return

    setProcesandoAcceso(true)
    setMensajeAcceso('')

    const { data: accesoExistente } = await supabase
      .from('accesos_clases_premium')
      .select('id')
      .eq('user_id', solicitud.user_id)
      .eq('clase_id', solicitud.clase_id)
      .limit(1)
      .maybeSingle()

    let errorAcceso

    if (accesoExistente?.id) {
      const resultado = await supabase
        .from('accesos_clases_premium')
        .update({
          activo: true,
          modalidad: solicitud.modalidad,
          fecha_inicio: new Date().toISOString(),
          fecha_expiracion: null,
          solicitud_id: solicitud.id
        })
        .eq('id', accesoExistente.id)

      errorAcceso = resultado.error
    } else {
      const resultado = await supabase
        .from('accesos_clases_premium')
        .insert({
          user_id: solicitud.user_id,
          modalidad: solicitud.modalidad,
          clase_id: solicitud.clase_id,
          activo: true,
          fecha_inicio: new Date().toISOString(),
          fecha_expiracion: null,
          solicitud_id: solicitud.id
        })

      errorAcceso = resultado.error
    }

    if (errorAcceso) {
      setProcesandoAcceso(false)
      setMensajeAcceso(
        `No se pudo autorizar: ${errorAcceso.message}`
      )
      return
    }

    const { error } = await supabase
      .from('solicitudes_clases_premium')
      .update({
        estado: 'aprobado',
        notas_admin: 'Acceso autorizado desde la aplicación.',
        updated_at: new Date().toISOString()
      })
      .eq('id', solicitud.id)

    setProcesandoAcceso(false)

    if (error) {
      setMensajeAcceso(
        `El acceso se creó, pero no se actualizó la solicitud: ${error.message}`
      )
      return
    }

    setMensajeAcceso(
      `✅ Acceso autorizado para ${solicitud.solicitante_nombre || solicitud.solicitante_email || 'el usuario'}.`
    )

    await cargarControlAccesos()
  }

  async function rechazarSolicitud(solicitud) {
    if (!isAdmin || procesandoAcceso) return

    setProcesandoAcceso(true)

    const { error } = await supabase
      .from('solicitudes_clases_premium')
      .update({
        estado: 'rechazado',
        notas_admin: 'Solicitud rechazada desde la aplicación.',
        updated_at: new Date().toISOString()
      })
      .eq('id', solicitud.id)

    setProcesandoAcceso(false)

    if (error) {
      setMensajeAcceso(
        `No se pudo rechazar: ${error.message}`
      )
      return
    }

    setMensajeAcceso('Solicitud rechazada.')
    await cargarControlAccesos()
  }

  function abrirClase(clase) {
    if (!tieneAcceso(clase.id)) {
      if (clase.premium) {
        setPremiumSeleccionada(clase)
      } else if (solicitudPendiente(clase.id)) {
        setMensajeAcceso(
          'Tu solicitud está pendiente de autorización.'
        )
      } else {
        const confirmar = window.confirm(
          `Esta clase requiere autorización del administrador.\n\n¿Deseas solicitar acceso a "${clase.titulo}"?`
        )

        if (confirmar) {
          solicitarAcceso(clase)
        }
      }

      return
    }

    if (clase.personalizada) {
      setPremiumSeleccionada(clase)
      setMensajeAcceso(
        '✅ Tienes acceso autorizado. El administrador coordinará tu sesión.'
      )
      return
    }

    if (!clase.disponible && !isAdmin) {
      setMensajeAcceso(
        'Tu acceso está autorizado. El contenido será habilitado por el administrador.'
      )
      return
    }

    setClaseActiva(clase)
    setRespuestas({})
    setResultado(null)
  }

  function solicitarClasePersonalizada() {
    if (!premiumSeleccionada) return

    const nombreUsuario =
      usuario?.user_metadata?.nombre ||
      usuario?.user_metadata?.full_name ||
      usuario?.email ||
      'Usuario interesado'

    const mensaje = [
      'Hola, Generales de Chitré.',
      '',
      `Deseo solicitar la clase premium: ${premiumSeleccionada.titulo}.`,
      `Valor: $${premiumSeleccionada.precio} por sesión.`,
      `Duración: ${premiumSeleccionada.duracion || 60} minutos.`,
      `Solicitante: ${nombreUsuario}.`,
      '',
      'Deseo coordinar la fecha, el pago y el enlace de Google Meet.'
    ].join('\n')

    const enlace =
      'https://wa.me/50763776387?text=' +
      encodeURIComponent(mensaje)

    window.open(
      enlace,
      '_blank',
      'noopener,noreferrer'
    )
  }

  function volverAClases() {
    setClaseActiva(null)
    setRespuestas({})
    setResultado(null)
  }

  function seleccionarRespuesta(preguntaIndice, opcionIndice) {
    if (resultado) return

    setRespuestas((actuales) => ({
      ...actuales,
      [preguntaIndice]: opcionIndice
    }))
  }

  function evaluarClase() {
    if (Object.keys(respuestas).length < preguntas.length) {
      window.alert('Debes responder las cinco preguntas.')
      return
    }

    const aciertos = preguntas.reduce(
      (total, pregunta, indice) =>
        total +
        (respuestas[indice] === pregunta.correcta ? 1 : 0),
      0
    )

    const aprobada = aciertos >= 4

    setResultado({
      aciertos,
      aprobada
    })

    if (aprobada && !completadas.includes(claseActiva.id)) {
      const nuevasCompletadas = [...completadas, claseActiva.id]

      setCompletadas(nuevasCompletadas)

      window.localStorage.setItem(
        'generales-clases-completadas',
        JSON.stringify(nuevasCompletadas)
      )
    }
  }

  function repetirEvaluacion() {
    setRespuestas({})
    setResultado(null)
  }

  return createPortal(
    <div className="clases-fondo" onClick={onCerrar}>
      <section
        className="clases-ventana"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="clases-header">
          <div>
            <small>ACADEMIA DIGITAL</small>
            <h2>Clases virtuales de béisbol</h2>
            <p>
              Aprende fundamentos, reglas y valores deportivos.
            </p>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar clases virtuales"
          >
            ×
          </button>
        </header>

        {premiumSeleccionada && (
          <div
            className="clase-premium-fondo"
            onClick={() => setPremiumSeleccionada(null)}
          >
            <section
              className="clase-premium-modal"
              onClick={(evento) => evento.stopPropagation()}
            >
              <button
                type="button"
                className="clase-premium-cerrar"
                onClick={() => setPremiumSeleccionada(null)}
                aria-label="Cerrar información"
              >
                ×
              </button>

              <span className="clase-premium-icono">
                {premiumSeleccionada.icono}
              </span>

              <small>ENTRENAMIENTO PERSONALIZADO</small>
              <h3>{premiumSeleccionada.titulo}</h3>
              <p>{premiumSeleccionada.descripcion}</p>

              <div className="clase-premium-detalles">
                <article>
                  <span>💵</span>
                  <div>
                    <small>INVERSIÓN</small>
                    <strong>
                      ${premiumSeleccionada.precio}
                    </strong>
                  </div>
                </article>

                <article>
                  <span>⏱️</span>
                  <div>
                    <small>DURACIÓN</small>
                    <strong>
                      {premiumSeleccionada.duracion || 60} minutos
                    </strong>
                  </div>
                </article>

                <article>
                  <span>🎥</span>
                  <div>
                    <small>MODALIDAD</small>
                    <strong>Google Meet</strong>
                  </div>
                </article>
              </div>

              <ul>
                <li>Evaluación individual del jugador.</li>
                <li>Correcciones técnicas personalizadas.</li>
                <li>Ejercicios adaptados a su nivel.</li>
                <li>Recomendaciones para continuar practicando.</li>
              </ul>

              <button
                type="button"
                className="clase-premium-solicitar"
                onClick={() => solicitarAcceso(premiumSeleccionada)}
              >
                {procesandoAcceso
                  ? 'Enviando solicitud…'
                  : solicitudPendiente(premiumSeleccionada.id)
                    ? 'Solicitud pendiente ⏳'
                    : 'Solicitar autorización →'}
              </button>

              <span className="clase-premium-nota">
                El administrador confirmará el pago, la fecha y
                el enlace privado de Google Meet.
              </span>
            </section>
          </div>
        )}

        {mensajeAcceso && (
          <p className="clases-acceso-mensaje">
            {mensajeAcceso}
          </p>
        )}

        {!claseActiva ? (
          <>
            <SesionesClasesVivo
              usuario={usuario}
              isAdmin={isAdmin}
            />

            {isAdmin && (
              <section className="clases-solicitudes-admin">
                <header>
                  <div>
                    <small>🔔 CONTROL DE ACCESOS</small>
                    <h3>
                      Solicitudes pendientes
                      <span>{solicitudesPendientes.length}</span>
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={cargarControlAccesos}
                  >
                    ↻ Actualizar
                  </button>
                </header>

                {solicitudesPendientes.length === 0 ? (
                  <p>No hay solicitudes pendientes.</p>
                ) : (
                  <div className="clases-solicitudes-lista">
                    {solicitudesPendientes.map((solicitud) => (
                      <article key={solicitud.id}>
                        <div>
                          <small>
                            {solicitud.modalidad?.toUpperCase()}
                          </small>

                          <strong>
                            {solicitud.solicitante_nombre ||
                              'Usuario registrado'}
                          </strong>

                          <span>
                            {solicitud.solicitante_email ||
                              solicitud.user_id}
                          </span>

                          <b>
                            {nombreClase(solicitud.clase_id)}
                            {Number(solicitud.monto) > 0
                              ? ` · $${solicitud.monto}`
                              : ''}
                          </b>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              autorizarSolicitud(solicitud)
                            }
                            disabled={procesandoAcceso}
                          >
                            ✓ Autorizar
                          </button>

                          <button
                            type="button"
                            className="solicitud-rechazar"
                            onClick={() =>
                              rechazarSolicitud(solicitud)
                            }
                            disabled={procesandoAcceso}
                          >
                            Rechazar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            <section className="clases-progreso">
              <div>
                <small>PROGRESO DE APRENDIZAJE</small>
                <strong>
                  {completadas.length} de {clases.length} clases
                </strong>
              </div>

              <div className="clases-progreso-barra">
                <i
                  style={{
                    width:
                      `${(completadas.length / clases.length) * 100}%`
                  }}
                />
              </div>
            </section>

            <div className="clases-grid">
              {clases.map((clase) => {
                const completada = completadas.includes(clase.id)
                const autorizada = tieneAcceso(clase.id)
                const pendiente = solicitudPendiente(clase.id)

                return (
                  <article
                    key={clase.id}
                    className={[
                      completada ? 'completada' : '',
                      clase.premium ? 'clase-premium' : '',
                      autorizada
                        ? 'clase-autorizada'
                        : 'clase-bloqueada'
                    ].filter(Boolean).join(' ')}
                  >
                    <small>
                      {autorizada
                        ? '✓ ACCESO AUTORIZADO'
                        : clase.premium
                          ? '🔒 CLASE PREMIUM'
                          : `🔒 CLASE ${String(clase.id).padStart(2, '0')}`}
                    </small>

                    <span>{clase.icono}</span>
                    <h3>{clase.titulo}</h3>
                    <p>{clase.descripcion}</p>

                    {completada && (
                      <strong className="clase-completada-marca">
                        ✓ CLASE COMPLETADA
                      </strong>
                    )}

                    <button
                      type="button"
                      onClick={() => abrirClase(clase)}
                    >
                      {autorizada
                        ? clase.personalizada
                          ? 'Acceso autorizado ✓'
                          : completada
                            ? 'Repasar clase →'
                            : 'Abrir clase →'
                        : pendiente
                          ? 'Solicitud pendiente ⏳'
                          : clase.precio
                            ? `Solicitar acceso · $${clase.precio} 🔒`
                            : 'Solicitar acceso 🔒'}
                    </button>
                  </article>
                )
              })}
            </div>
          </>
        ) : (
          <main className="clase-contenido">
            <button
              type="button"
              className="clase-volver"
              onClick={volverAClases}
            >
              ← Volver a todas las clases
            </button>

            {claseActiva.id === 2 ? (
              <>
                <section className="clase-portada clase-portada-fildeo">
                  <span>🧤</span>
                  <div>
                    <small>CLASE 02 · TÉCNICA DEFENSIVA</small>
                    <h3>Fildeo de roletazos</h3>
                    <p>
                      Aprende la posición correcta, la recepción
                      segura y la transición para realizar el tiro.
                    </p>
                  </div>
                </section>

                <section className="clase-bloque clase-objetivo">
                  <h4>🎯 Objetivo de la clase</h4>
                  <p>
                    Al finalizar, el jugador podrá adoptar una
                    posición de listo, atacar el roletazo, recibir
                    la pelota con ambas manos y prepararse para
                    realizar un tiro preciso.
                  </p>
                </section>

                <section className="clase-bloque">
                  <h4>⏱️ Plan de entrenamiento · 60 minutos</h4>

                  <div className="clase-cronograma">
                    <article>
                      <strong>10 min</strong>
                      <span>Calentamiento y movilidad</span>
                    </article>
                    <article>
                      <strong>20 min</strong>
                      <span>Explicación de la técnica</span>
                    </article>
                    <article>
                      <strong>25 min</strong>
                      <span>Ejercicios prácticos</span>
                    </article>
                    <article>
                      <strong>5 min</strong>
                      <span>Cierre y retroalimentación</span>
                    </article>
                  </div>
                </section>

                <section className="clase-bloque">
                  <h4>1. Calentamiento y movilidad</h4>
                  <ul>
                    <li>
                      Trote suave para activar el cuerpo.
                    </li>
                    <li>
                      Movilidad de hombros, cadera, rodillas
                      y tobillos.
                    </li>
                    <li>
                      Desplazamientos laterales cortos manteniendo
                      las rodillas flexionadas.
                    </li>
                  </ul>
                </section>

                <section className="clase-bloque">
                  <h4>2. Los cuatro pasos del fildeo correcto</h4>

                  <figure className="clase-imagen-fildeo">
                    <img
                      src={fildeoSecuencia}
                      alt="Secuencia de cuatro pasos para fildear un roletazo"
                    />
                    <figcaption>
                      Observa la secuencia completa antes de practicar.
                    </figcaption>
                  </figure>

                  <div className="clase-pasos-fildeo">
                    <article>
                      <b>1</b>
                      <div>
                        <strong>Posición de listo</strong>
                        <p>
                          Separa los pies más que los hombros,
                          flexiona las rodillas, inclina el cuerpo
                          y mantén el peso sobre la parte delantera
                          de los pies.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>2</b>
                      <div>
                        <strong>Ataque y triángulo de fildeo</strong>
                        <p>
                          Avanza con pasos cortos hacia la pelota.
                          Los dos pies forman la base del triángulo
                          y el guante es el vértice delantero.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>3</b>
                      <div>
                        <strong>Recepción con ambas manos</strong>
                        <p>
                          Coloca el guante en el suelo y recibe de
                          abajo hacia arriba. La mano de lanzar se
                          ubica encima como una tapa.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>4</b>
                      <div>
                        <strong>Transición y paso lateral</strong>
                        <p>
                          Lleva la pelota al centro del pecho y
                          realiza un paso lateral hacia el objetivo
                          antes de lanzar.
                        </p>
                      </div>
                    </article>
                  </div>

                  <p className="clase-dato">
                    💡 La pelota se fildea de abajo hacia arriba,
                    nunca de arriba hacia abajo.
                  </p>
                </section>

                <section className="clase-bloque">
                  <h4>3. Ejercicios prácticos</h4>

                  <div className="clase-drills">
                    <article>
                      <span>🤲</span>
                      <div>
                        <strong>Fildeo sin guante</strong>
                        <p>
                          Usa pelotas de tenis o goma y recibe
                          roletazos suaves con ambas manos.
                        </p>
                        <small>
                          OBJETIVO: suavidad y amortiguación.
                        </small>
                      </div>
                    </article>

                    <article>
                      <span>🕒</span>
                      <div>
                        <strong>Reloj de fildeo</strong>
                        <p>
                          Desde las rodillas, recibe pelotas a la
                          izquierda, al centro y a la derecha.
                        </p>
                        <small>
                          OBJETIVO: manos correctas y guante abajo.
                        </small>
                      </div>
                    </article>

                    <article>
                      <span>🔺</span>
                      <div>
                        <strong>Triángulo y embudo</strong>
                        <p>
                          Marca un triángulo con conos, recibe en
                          la punta y lleva la pelota al pecho.
                        </p>
                        <small>
                          OBJETIVO: punto exacto de recepción.
                        </small>
                      </div>
                    </article>
                  </div>
                </section>

                <section className="clase-bloque clase-seguridad">
                  <h4>⚠️ Errores comunes</h4>
                  <ul>
                    <li>
                      Esperar la pelota completamente erguido.
                    </li>
                    <li>
                      Juntar demasiado los pies.
                    </li>
                    <li>
                      Bajar el guante cuando la pelota ya está cerca.
                    </li>
                    <li>
                      Recibir la pelota debajo del cuerpo.
                    </li>
                    <li>
                      Lanzar sin orientar primero los pies.
                    </li>
                  </ul>
                </section>

                <section className="clase-bloque clase-actividad">
                  <h4>✅ Cierre y retroalimentación</h4>
                  <p>
                    Cada jugador realiza cinco repeticiones. El
                    entrenador corrige primero la postura, después
                    la recepción y finalmente la transición al tiro.
                  </p>
                  <p>
                    Termina preguntando: “¿El guante trabaja de
                    abajo hacia arriba o de arriba hacia abajo?”
                  </p>
                </section>
              </>
            ) : claseActiva.id === 3 ? (
              <>
                <section className="clase-portada clase-portada-bateo">
                  <span>🏏</span>
                  <div>
                    <small>CLASE 03 · TÉCNICA OFENSIVA</small>
                    <h3>Fundamentos del bateo</h3>
                    <p>
                      Aprende el agarre, la postura, la carga,
                      el contacto y la terminación del swing.
                    </p>
                  </div>
                </section>

                <section className="clase-bloque clase-objetivo">
                  <h4>🎯 Objetivo de la clase</h4>
                  <p>
                    Al finalizar, el jugador podrá ejecutar una
                    secuencia básica de bateo con equilibrio,
                    coordinación, una ruta corta de manos y una
                    terminación controlada.
                  </p>
                </section>

                <section className="clase-bloque">
                  <h4>⏱️ Organización de la clase</h4>

                  <div className="clase-cronograma">
                    <article>
                      <strong>10 min</strong>
                      <span>Activación y movilidad</span>
                    </article>
                    <article>
                      <strong>15 min</strong>
                      <span>Teoría y análisis visual</span>
                    </article>
                    <article>
                      <strong>20 min</strong>
                      <span>Ejercicios prácticos</span>
                    </article>
                    <article>
                      <strong>10 min</strong>
                      <span>Dinámica y tarea virtual</span>
                    </article>
                    <article>
                      <strong>5 min</strong>
                      <span>Cierre y correcciones</span>
                    </article>
                  </div>
                </section>

                <section className="clase-bloque">
                  <h4>1. Las cinco fases del bateo</h4>

                  <figure className="clase-imagen-fildeo clase-imagen-bateo">
                    <img
                      src={bateoSecuencia}
                      alt="Secuencia de cinco pasos para realizar el swing"
                    />
                    <figcaption>
                      Observa la secuencia completa: agarre,
                      postura, carga, contacto y terminación.
                    </figcaption>
                  </figure>

                  <div className="clase-pasos-fildeo clase-pasos-bateo">
                    <article>
                      <b>1</b>
                      <div>
                        <strong>Agarre del bate</strong>
                        <p>
                          Alinea los nudillos medios. Mantén las
                          manos relajadas, pero con suficiente
                          firmeza para controlar el bate.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>2</b>
                      <div>
                        <strong>Postura de preparación</strong>
                        <p>
                          Separa los pies un poco más que los
                          hombros, flexiona las rodillas y mantén
                          ambos ojos dirigidos al lanzador.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>3</b>
                      <div>
                        <strong>Carga y paso</strong>
                        <p>
                          Transfiere suavemente el peso hacia la
                          pierna trasera y realiza un paso corto
                          y ligero con el pie delantero.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>4</b>
                      <div>
                        <strong>Contacto y extensión</strong>
                        <p>
                          Lleva las manos por una ruta corta hacia
                          la pelota. Realiza el contacto delante
                          del plato mientras rota la cadera.
                        </p>
                      </div>
                    </article>

                    <article>
                      <b>5</b>
                      <div>
                        <strong>Terminación</strong>
                        <p>
                          Mantén la cabeza cerca del punto de
                          contacto y termina el movimiento de
                          forma fluida, equilibrada y controlada.
                        </p>
                      </div>
                    </article>
                  </div>

                  <p className="clase-dato">
                    💡 Un buen swing comienza con equilibrio y
                    termina con control.
                  </p>
                </section>

                <section className="clase-bloque">
                  <h4>2. Ejercicios para espacios reducidos</h4>

                  <div className="clase-drills">
                    <article>
                      <span>🪞</span>
                      <div>
                        <strong>Trabajo de espejo o cámara</strong>
                        <p>
                          Realiza la carga y el paso. Detente
                          durante tres segundos para revisar la
                          alineación de hombros y caderas.
                        </p>
                        <small>
                          OBJETIVO: corregir postura y equilibrio.
                        </small>
                      </div>
                    </article>

                    <article>
                      <span>🧱</span>
                      <div>
                        <strong>Ruta de manos junto a la pared</strong>
                        <p>
                          Practica lentamente cerca de una pared
                          sin permitir que el extremo del bate
                          toque la superficie.
                        </p>
                        <small>
                          OBJETIVO: desarrollar una ruta corta.
                        </small>
                      </div>
                    </article>

                    <article>
                      <span>🔄</span>
                      <div>
                        <strong>Rotación con palo en los hombros</strong>
                        <p>
                          Coloca un palo sobre los hombros y gira
                          la cadera manteniendo la cabeza estable
                          y el cuerpo equilibrado.
                        </p>
                        <small>
                          OBJETIVO: coordinación de cadera y torso.
                        </small>
                      </div>
                    </article>
                  </div>
                </section>

                <section className="clase-bloque clase-actividad">
                  <h4>🎥 Dinámica interactiva</h4>
                  <ol>
                    <li>
                      Observa un swing presentado en cámara lenta.
                    </li>
                    <li>
                      Identifica el momento de la carga y el paso.
                    </li>
                    <li>
                      Señala dónde ocurre el contacto con la pelota.
                    </li>
                    <li>
                      Explica si el bateador terminó equilibrado.
                    </li>
                  </ol>
                </section>

                <section className="clase-bloque clase-tarea-bateo">
                  <h4>📱 Tarea virtual</h4>
                  <p>
                    Graba un video de 15 a 30 segundos realizando
                    tres swings secos con un bate de plástico,
                    tubo de PVC o escobillón.
                  </p>
                  <p>
                    Antes de comenzar, explica brevemente cómo
                    colocaste las manos y los pies.
                  </p>
                </section>

                <section className="clase-bloque clase-seguridad">
                  <h4>🛡️ Seguridad y errores comunes</h4>
                  <ul>
                    <li>
                      Revisa que no haya personas u objetos cerca.
                    </li>
                    <li>
                      No practiques con un bate pesado dentro de casa.
                    </li>
                    <li>
                      Evita apretar excesivamente las manos.
                    </li>
                    <li>
                      No realices un paso demasiado largo.
                    </li>
                    <li>
                      Mantén la cabeza estable durante el contacto.
                    </li>
                    <li>
                      Finaliza siempre con equilibrio.
                    </li>
                  </ul>
                </section>
              </>
            ) : claseActiva.id === 4 ? (
              <>
                <section className="clase-portada clase-portada-pequenos">
                  <span>🌟</span>
                  <div>
                    <small>CLASE 04 · EDADES DE 4 A 6 AÑOS</small>
                    <h3>Pequeños Gigantes del Béisbol</h3>
                    <p>
                      Aprende jugando con historias, sonidos,
                      movimientos y objetos seguros de casa.
                    </p>
                  </div>
                </section>

                <section className="clase-bloque clase-objetivo">
                  <h4>🎯 Objetivo de la clase</h4>
                  <p>
                    Desarrollar coordinación, equilibrio, atrape,
                    bateo y corrido de bases mediante juegos
                    divertidos apropiados para niños de 4 a 6 años.
                  </p>
                </section>

                <section className="clase-bloque clase-aviso-adulto">
                  <h4>👨‍👩‍👧 Acompañamiento de un adulto</h4>
                  <p>
                    Un adulto debe acompañar al niño, despejar el
                    área de práctica y ayudar a sostener el vaso o
                    lanzar suavemente la pelota.
                  </p>
                </section>

                <section className="clase-bloque">
                  <h4>🎒 Materiales seguros</h4>

                  <div className="clase-materiales">
                    <article>
                      <span>🧦</span>
                      <strong>Pelota blanda</strong>
                      <small>
                        Pelota de esponja, tenis o medias enrolladas.
                      </small>
                    </article>

                    <article>
                      <span>🏏</span>
                      <strong>Bate liviano</strong>
                      <small>
                        Bate plástico, tubo de cartón o escobillón.
                      </small>
                    </article>

                    <article>
                      <span>🥤</span>
                      <strong>Soporte</strong>
                      <small>
                        Vaso plástico resistente o cono pequeño.
                      </small>
                    </article>

                    <article>
                      <span>🧸</span>
                      <strong>Primera base</strong>
                      <small>
                        Peluche o almohada colocada a tres pasos.
                      </small>
                    </article>
                  </div>
                </section>

                <section className="clase-bloque">
                  <h4>⏱️ Clase divertida de 35 minutos</h4>

                  <div className="clase-cronograma clase-cronograma-infantil">
                    <article>
                      <strong>7 min</strong>
                      <span>Estatuas y superhéroes</span>
                    </article>
                    <article>
                      <strong>10 min</strong>
                      <span>La boca del caimán</span>
                    </article>
                    <article>
                      <strong>10 min</strong>
                      <span>El cohete al espacio</span>
                    </article>
                    <article>
                      <strong>8 min</strong>
                      <span>El corredor relámpago</span>
                    </article>
                  </div>
                </section>

                <section className="clase-bloque">
                  <h4>Las cuatro estaciones de juego</h4>

                  <figure className="clase-imagen-fildeo clase-imagen-pequenos">
                    <img
                      src={pequenosGigantes}
                      alt="Cuatro juegos de béisbol para niños de 4 a 6 años"
                    />
                    <figcaption>
                      Posición de gorila, boca del caimán,
                      cohete al espacio y corredor relámpago.
                    </figcaption>
                  </figure>
                </section>

                <section className="clase-bloque clase-juego-infantil">
                  <h4>🦸 1. Estatuas y superhéroes</h4>
                  <p>
                    Corre suavemente en el mismo lugar. Cuando el
                    entrenador diga “¡Tiburón!”, detente como una
                    estatua en posición de gorila:
                  </p>
                  <ul>
                    <li>Pies abiertos.</li>
                    <li>Rodillas flexionadas.</li>
                    <li>Manos preparadas al frente.</li>
                  </ul>
                  <strong className="clase-sonido">
                    ¡TIBURÓN! 🦈
                  </strong>
                </section>

                <section className="clase-bloque clase-juego-infantil">
                  <h4>🐊 2. La boca del caimán</h4>
                  <p>
                    El guante y la otra mano forman la boca de un
                    caimán. Cuando llega la pelota, ambas manos se
                    cierran cerca del pecho.
                  </p>
                  <ol>
                    <li>Lanza suavemente la bola de medias.</li>
                    <li>Sigue la pelota con los ojos.</li>
                    <li>Atrápala con ambas manos.</li>
                    <li>Intenta conseguir cinco atrapadas seguidas.</li>
                  </ol>
                  <strong className="clase-sonido">
                    ¡CHOMP! 🐊
                  </strong>
                </section>

                <section className="clase-bloque clase-juego-infantil">
                  <h4>🚀 3. El cohete al espacio</h4>
                  <p>
                    Coloca una pelota blanda sobre un vaso plástico
                    o cono. Separa los pies como un elefante y
                    alinea los nudillos que tocan la puerta.
                  </p>
                  <ol>
                    <li>Mira fijamente la pelota.</li>
                    <li>Realiza un swing suave y controlado.</li>
                    <li>Termina equilibrado.</li>
                    <li>Celebra el lanzamiento del cohete.</li>
                  </ol>
                  <strong className="clase-sonido">
                    ¡SWOOSH! ¡A LA LUNA! 🌙
                  </strong>
                </section>

                <section className="clase-bloque clase-juego-infantil">
                  <h4>⚡ 4. El corredor relámpago</h4>
                  <p>
                    Coloca un peluche a tres pasos. Realiza un
                    swing imaginario, deja el bate cuidadosamente
                    en el suelo y corre a tocar la primera base.
                  </p>
                  <strong className="clase-sonido">
                    ¡RÁPIDO COMO UN RAYO! ⚡
                  </strong>
                </section>

                <section className="clase-bloque clase-seguridad">
                  <h4>🛡️ Reglas de seguridad</h4>
                  <ul>
                    <li>Practica siempre acompañado por un adulto.</li>
                    <li>Usa únicamente pelotas y bates blandos.</li>
                    <li>Retira muebles y objetos frágiles del área.</li>
                    <li>No lances el bate después del swing.</li>
                    <li>Espera la señal antes de comenzar.</li>
                    <li>Detente inmediatamente si alguien se acerca.</li>
                  </ul>
                </section>

                <section className="clase-bloque clase-actividad clase-estrella">
                  <h4>⭐ Estrellita de la clase</h4>
                  <p>
                    Completa una posición de gorila, cinco atrapadas,
                    tres swings suaves y una carrera a primera base.
                  </p>
                  <p>
                    Finaliza con una porra:
                    <strong>
                      “¡Un equipo, una familia, un legado!”
                    </strong>
                  </p>
                </section>

                <section className="clase-bloque clase-consejos-instructor">
                  <h4>📣 Consejos para el instructor</h4>
                  <ul>
                    <li>
                      Habla con energía y utiliza sonidos divertidos.
                    </li>
                    <li>
                      Felicita a cada niño por su nombre.
                    </li>
                    <li>
                      Realiza pausas cortas para tomar agua.
                    </li>
                    <li>
                      Prioriza la diversión sobre la perfección.
                    </li>
                  </ul>
                </section>
              </>
            ) : (
              <>
            <section className="clase-portada">
              <span>⚾</span>
              <div>
                <small>CLASE 01 · NIVEL INICIAL</small>
                <h3>Fundamentos del béisbol</h3>
                <p>
                  Conoce el objetivo del juego, el terreno,
                  las bases y las funciones de cada equipo.
                </p>
              </div>
            </section>

            <section className="clase-bloque clase-objetivo">
              <h4>🎯 Objetivo de la clase</h4>
              <p>
                Al finalizar, el jugador podrá reconocer las
                partes básicas del terreno, explicar cómo se
                anota una carrera y diferenciar entre ofensiva
                y defensa.
              </p>
            </section>

            <section className="clase-bloque">
              <h4>1. ¿Qué es el béisbol?</h4>
              <p>
                El béisbol es un deporte de equipo donde dos
                conjuntos se alternan para batear y defender.
                El equipo que consigue más carreras gana el juego.
              </p>

              <div className="clase-conceptos">
                <article>
                  <span>🏏</span>
                  <strong>Ofensiva</strong>
                  <p>
                    Batea la pelota y corre por las bases para
                    intentar anotar carreras.
                  </p>
                </article>

                <article>
                  <span>🧤</span>
                  <strong>Defensa</strong>
                  <p>
                    Atrapa la pelota y busca realizar tres outs
                    para terminar el turno ofensivo.
                  </p>
                </article>
              </div>
            </section>

            <section className="clase-bloque">
              <h4>2. El terreno y las bases</h4>
              <p>
                El recorrido comienza en home, continúa por
                primera, segunda y tercera base, y termina
                nuevamente en home.
              </p>

              <div className="clase-diamante">
                <div className="clase-base base-segunda">2</div>
                <div className="clase-base base-tercera">3</div>
                <div className="clase-base base-primera">1</div>
                <div className="clase-home">HOME</div>
                <span className="linea linea-uno"></span>
                <span className="linea linea-dos"></span>
                <span className="linea linea-tres"></span>
                <span className="linea linea-cuatro"></span>
              </div>

              <p className="clase-dato">
                💡 Cuando un corredor toca las cuatro bases
                correctamente, anota una carrera.
              </p>
            </section>

            <section className="clase-bloque">
              <h4>3. ¿Cómo termina un turno?</h4>
              <p>
                El equipo a la ofensiva continúa bateando hasta
                que la defensa consigue tres outs. Después, los
                equipos intercambian sus funciones.
              </p>

              <div className="clase-outs">
                <span>OUT 1</span>
                <span>OUT 2</span>
                <span>OUT 3</span>
              </div>
            </section>

            <section className="clase-bloque clase-actividad">
              <h4>🏃 Actividad práctica</h4>
              <ol>
                <li>
                  Coloca cuatro objetos formando un diamante.
                </li>
                <li>
                  Identifica home, primera, segunda y tercera.
                </li>
                <li>
                  Corre y toca las bases en el orden correcto.
                </li>
                <li>
                  Al llegar a home, di en voz alta:
                  “¡Carrera!”
                </li>
              </ol>
            </section>

            <section className="clase-bloque clase-seguridad">
              <h4>🛡️ Seguridad</h4>
              <ul>
                <li>
                  Utiliza casco cuando realices prácticas de bateo.
                </li>
                <li>
                  Mantén distancia de quien está usando el bate.
                </li>
                <li>
                  Escucha siempre las indicaciones del entrenador.
                </li>
                <li>
                  No lances el bate después de golpear la pelota.
                </li>
              </ul>
            </section>

              </>
            )}

            <section className="clase-evaluacion">
              <header>
                <small>EVALUACIÓN FINAL</small>
                <h4>Demuestra lo aprendido</h4>
                <p>
                  Necesitas cuatro respuestas correctas para
                  completar la clase.
                </p>
              </header>

              {preguntas.map((pregunta, preguntaIndice) => (
                <article
                  className="clase-pregunta"
                  key={pregunta.pregunta}
                >
                  <strong>
                    {preguntaIndice + 1}. {pregunta.pregunta}
                  </strong>

                  <div>
                    {pregunta.opciones.map(
                      (opcion, opcionIndice) => {
                        const seleccionada =
                          respuestas[preguntaIndice] ===
                          opcionIndice

                        let claseOpcion =
                          seleccionada ? 'seleccionada' : ''

                        if (resultado) {
                          if (
                            opcionIndice === pregunta.correcta
                          ) {
                            claseOpcion = 'correcta'
                          } else if (seleccionada) {
                            claseOpcion = 'incorrecta'
                          }
                        }

                        return (
                          <button
                            type="button"
                            key={opcion}
                            className={claseOpcion}
                            onClick={() =>
                              seleccionarRespuesta(
                                preguntaIndice,
                                opcionIndice
                              )
                            }
                          >
                            {opcion}
                          </button>
                        )
                      }
                    )}
                  </div>
                </article>
              ))}

              {!resultado ? (
                <button
                  type="button"
                  className="clase-evaluar"
                  onClick={evaluarClase}
                >
                  Evaluar mis respuestas
                </button>
              ) : (
                <div
                  className={
                    resultado.aprobada
                      ? 'clase-resultado aprobada'
                      : 'clase-resultado pendiente'
                  }
                >
                  <span>
                    {resultado.aprobada ? '🏆' : '💪'}
                  </span>

                  <h4>
                    {resultado.aprobada
                      ? '¡Clase completada!'
                      : 'Continúa practicando'}
                  </h4>

                  <strong>
                    {resultado.aciertos} de 5 respuestas correctas
                  </strong>

                  <p>
                    {resultado.aprobada
                      ? 'Tu progreso quedó guardado en este dispositivo.'
                      : 'Necesitas cuatro aciertos para completar la clase.'}
                  </p>

                  <button
                    type="button"
                    onClick={
                      resultado.aprobada
                        ? volverAClases
                        : repetirEvaluacion
                    }
                  >
                    {resultado.aprobada
                      ? 'Ver todas las clases'
                      : 'Intentar nuevamente'}
                  </button>
                </div>
              )}
            </section>
          </main>
        )}
      </section>
    </div>,
    document.body
  )
}
