import { estiloPortada } from './EditorPortada'
import AnalisisTecnico from './AnalisisTecnico'
import VideosCintillo from './VideosCintillo'


import './inicio.css';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'
import { supabase } from './supabase';
import SopaLetras from './SopaLetras'
import MemoriaBeisbol from './MemoriaBeisbol'
import BateoRetro from './BateoRetro'
import RetoDigital from './RetoDigital'
import preguntasReto from './PreguntasReto'
import logoGenerales from './public/logo-generales.webp';
import equipoGenerales from './public/equipo-generales.webp';
import ScoreboardGenerales from './ScoreboardGenerales'
import CentroPartidos from './CentroPartidos'
import PartidosPublicos from './PartidosPublicos'
import AgendaAcademia from './AgendaAcademia'
import EstadisticasVisitas from './EstadisticasVisitas'
import ClasesVirtuales from './ClasesVirtuales'
import InstalarApp from './InstalarApp'

import Patrocinadores from './Patrocinadores'

export default function Inicio({
  onAdmin,
  onEntrenadores,
  onJugadoresPublicos,
  onEditarGaleria,
  isAdmin,
  usuario,
  onLogin,
  onRegistro,
}) {
  const [tiendaOpen, setTiendaOpen] = useState(false)
  const [programasOpen, setProgramasOpen] = useState(false)
  const [galeriaOpen, setGaleriaOpen] = useState(false)
  const [noticiasOpen, setNoticiasOpen] = useState(false)
  const [notificacionesOpen, setNotificacionesOpen] = useState(false)
  const [masOpen, setMasOpen] = useState(false)
  const [sopaLetrasOpen, setSopaLetrasOpen] = useState(false)
  const [memoriaOpen, setMemoriaOpen] = useState(false)
  const [bateoRetroOpen, setBateoRetroOpen] = useState(false)
  const [retoDigitalOpen, setRetoDigitalOpen] = useState(false)
  const [juegosOpen, setJuegosOpen] = useState(false)
  const [clasesVirtualesOpen, setClasesVirtualesOpen] = useState(false)
  const [scoreboardOpen, setScoreboardOpen] = useState(false)
  const [centroPartidosOpen, setCentroPartidosOpen] = useState(false)
  const [partidosPublicosOpen, setPartidosPublicosOpen] = useState(false)

  const mostrarBarraPrincipal = !(
    tiendaOpen ||
    programasOpen ||
    galeriaOpen ||
    noticiasOpen ||
    notificacionesOpen ||
    masOpen ||
    sopaLetrasOpen ||
    memoriaOpen ||
    bateoRetroOpen ||
    retoDigitalOpen ||
    juegosOpen ||
    clasesVirtualesOpen ||
    scoreboardOpen ||
    centroPartidosOpen ||
    partidosPublicosOpen
  )
 const [imagenesGaleriaPublica, setImagenesGaleriaPublica] = useState([])

useEffect(() => {
  let activo = true

  async function cargarGaleriaPublica() {
    const { data, error } = await supabase
      .from('galeria_publica')
      .select('id, titulo, imagen_url, created_at, ajuste_portada')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })

    if (!error && activo) {
      setImagenesGaleriaPublica(data || [])
    }
  }

  cargarGaleriaPublica()
  window.addEventListener('portadas-actualizadas', cargarGaleriaPublica)

  return () => {
    window.removeEventListener('portadas-actualizadas', cargarGaleriaPublica)
    activo = false
  }
}, []) 
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const whatsapp = 'https://wa.me/50763776387';
  const [categoriaActiva, setCategoriaActiva] = useState('4-5');
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(0);
const [respuestasCorrectas, setRespuestasCorrectas] = useState(0);
const [retoTerminado, setRetoTerminado] = useState(false);
const [productos, setProductos] = useState([])
const [loadingTienda, setLoadingTienda] = useState(true)
const [productoFormOpen, setProductoFormOpen] = useState(false)
const [productoEditando, setProductoEditando] = useState(null)
const [guardandoProducto, setGuardandoProducto] = useState(false)
const [productoForm, setProductoForm] = useState({
  nombre: '',
  descripcion: '',
  precio: '',
  disponible: true,
  imagen: null
})
async function loadProductos() {
  setLoadingTienda(true)

  const { data, error } = await supabase
    .from('productos_tienda')
    .select('id, nombre, descripcion, precio, imagen_path, disponible, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('No se pudo cargar la tienda:', error)
    setProductos([])
    setLoadingTienda(false)
    return
  }

  const productosConImagen = (data || []).map((producto) => {
    if (!producto.imagen_path) return producto

    const { data: imagenData } = supabase.storage
      .from('productos-tienda')
      .getPublicUrl(producto.imagen_path)

    return {
      ...producto,
      imagen_url: imagenData.publicUrl
    }
  })

  setProductos(productosConImagen)
  setLoadingTienda(false)
}
async function guardarProducto(e) {
  e.preventDefault()

  const nombre = productoForm.nombre.trim()
  const precio = Number(productoForm.precio)

  if (!nombre) {
    window.alert('Escribe el nombre del producto.')
    return
  }

  if (!Number.isFinite(precio) || precio < 0) {
    window.alert('Escribe un precio válido.')
    return
  }

  setGuardandoProducto(true)

  let imagenPath = productoEditando?.imagen_path || null
  let nuevaImagenPath = null

  if (productoForm.imagen) {
    const archivo = productoForm.imagen

    if (!archivo.type.startsWith('image/')) {
      window.alert('Selecciona un archivo de imagen.')
      setGuardandoProducto(false)
      return
    }

    if (archivo.size > 10 * 1024 * 1024) {
      window.alert('La imagen no puede superar los 10 MB.')
      setGuardandoProducto(false)
      return
    }

    const extension =
      archivo.name.split('.').pop()?.toLowerCase() || 'jpg'

    nuevaImagenPath =
      `${crypto.randomUUID()}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from('productos-tienda')
      .upload(nuevaImagenPath, archivo, {
        cacheControl: '3600',
        upsert: false,
        contentType: archivo.type
      })

    if (uploadError) {
      window.alert(
        `No se pudo subir la imagen: ${uploadError.message}`
      )
      setGuardandoProducto(false)
      return
    }

    imagenPath = nuevaImagenPath
  }

  const datosProducto = {
    nombre,
    descripcion: productoForm.descripcion.trim() || null,
    precio,
    disponible: productoForm.disponible,
    imagen_path: imagenPath
  }

  const resultado = productoEditando
    ? await supabase
        .from('productos_tienda')
        .update(datosProducto)
        .eq('id', productoEditando.id)
    : await supabase
        .from('productos_tienda')
        .insert(datosProducto)

  if (resultado.error) {
    if (nuevaImagenPath) {
      await supabase.storage
        .from('productos-tienda')
        .remove([nuevaImagenPath])
    }

    window.alert(
      `No se pudo guardar el producto: ${resultado.error.message}`
    )
    setGuardandoProducto(false)
    return
  }

  if (
    productoEditando?.imagen_path &&
    nuevaImagenPath &&
    productoEditando.imagen_path !== nuevaImagenPath
  ) {
    await supabase.storage
      .from('productos-tienda')
      .remove([productoEditando.imagen_path])
  }

  await loadProductos()
  setProductoFormOpen(false)
  setProductoEditando(null)
  setGuardandoProducto(false)
}
async function eliminarProducto(producto) {
  const confirmar = window.confirm(
    `¿Deseas eliminar el producto ${producto.nombre}?`
  )

  if (!confirmar) return

  const { error } = await supabase
    .from('productos_tienda')
    .delete()
    .eq('id', producto.id)

  if (error) {
    window.alert(
      `No se pudo eliminar el producto: ${error.message}`
    )
    return
  }

  if (producto.imagen_path) {
    await supabase.storage
      .from('productos-tienda')
      .remove([producto.imagen_path])
  }

  await loadProductos()
}
useEffect(() => {
  loadProductos()
}, [])
async function compartirApp() {
  const enlace =
    'https://alwinkcap-bit.github.io/generales-baseball-app/'

  const datos = {
    title: 'Generales de Chitré Baseball Academy',
    text:
      '⚾ Conoce la app oficial de Generales de Chitré. ' +
      'Un equipo, una familia, un legado.\n\n' +
      enlace,
    url: enlace
  }

  const canalCompartido = navigator.share
    ? 'menu_dispositivo'
    : 'copiar_enlace'

  try {
    const claveVisitante = 'generales_visitante_id'
    let visitanteId = localStorage.getItem(claveVisitante)

    if (!visitanteId) {
      visitanteId = crypto.randomUUID()
      localStorage.setItem(claveVisitante, visitanteId)
    }

    const { error } = await supabase
      .from('interacciones_publicas')
      .insert({
        tipo: 'compartir',
        canal: canalCompartido,
        visitante_id: visitanteId
      })

    if (error) {
      console.error(
        'No se pudo registrar el contenido compartido:',
        error
      )
    }
  } catch (error) {
    console.error('Error registrando el contenido compartido:', error)
  }

  if (navigator.share) {
    try {
      await navigator.share(datos)
      return
    } catch (error) {
      if (error.name === 'AbortError') return
    }
  }

  try {
    await navigator.clipboard.writeText(enlace)
    window.alert('Enlace copiado correctamente.')
  } catch {
    window.prompt('Copia el enlace:', enlace)
  }
}

const responderReto = (opcionElegida) => {
  if (opcionElegida === preguntasReto[preguntaActual].correcta) {
    setRespuestasCorrectas((total) => total + 1);
  }

  if (preguntaActual === preguntasReto.length - 1) {
    setRetoTerminado(true);
  } else {
    setPreguntaActual((actual) => actual + 1);
  }
};
  return (
  <div id="inicio" className="inicio-app"> 
      <header className="inicio-header">
        <div className="inicio-marca">
          <img
            src={logoGenerales}
            alt="Logo Generales de Chitré"
            className="inicio-marca-logo"
          />
          <div>
            <span>GENERALES</span>
            <b className="inicio-marca-chitre">DE CHITRÉ</b>
            <strong>BASEBALL ACADEMY</strong>
          </div>
        </div>
        <div className="inicio-avisos-contenedor">
          <InstalarApp />
          <button
            type="button"
            className="inicio-compartir"
            onClick={compartirApp}
            aria-label="Compartir la aplicación"
            title="Compartir la app"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="inicio-compartir-icono"
            >
              <path
                d="M18 16.1c-.76 0-1.44.3-1.96.77L8.91 12.7a3.2 3.2 0 0 0 0-1.4l7.05-4.13A3 3 0 1 0 15 5c0 .23.03.46.08.67L8.03 9.8a3 3 0 1 0 0 4.4l7.12 4.17A3 3 0 1 0 18 16.1Z"
                fill="currentColor"
              />
            </svg>
            <strong>Compartir</strong>
          </button>
          <button
            type="button"
            className={`inicio-notificacion ${
              notificacionesOpen ? 'activo' : ''
            }`}
            aria-label="Abrir avisos"
            onClick={() =>
              setNotificacionesOpen((actual) => !actual)
            }
          >
            <span className="inicio-campana-icono">🔔</span>
            <b className="inicio-campana-contador">3</b>
          </button>

          {notificacionesOpen && (
            <section className="inicio-avisos-panel">
              <header>
                <div>
                  <small>CENTRO DE AVISOS</small>
                  <h3>Academia Generales</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setNotificacionesOpen(false)}
                >
                  ×
                </button>
              </header>

              <div className="inicio-aviso">
                <span>⚾</span>
                <div>
                  <small>ENTRENAMIENTOS</small>
                  <strong>Consulta días y horarios</strong>
                  <p>Información actualizada de la Academia.</p>
                </div>
              </div>

              <div className="inicio-aviso">
                <span>📅</span>
                <div>
                  <small>PARTIDOS</small>
                  <strong>Próximos juegos</strong>
                  <p>Revisa rival, fecha, hora y estadio.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotificacionesOpen(false)
                    setPartidosPublicosOpen(true)
                  }}
                >
                  Ver
                </button>
              </div>

              <div className="inicio-aviso">
                <span>⭐</span>
                <div>
                  <small>INSCRIPCIONES</small>
                  <strong>Forma parte de Generales</strong>
                  <p>Completa el registro del jugador.</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setNotificacionesOpen(false)
                    onRegistro()
                  }}
                >
                  Abrir
                </button>
              </div>

              <button
                type="button"
                className="inicio-avisos-noticias"
                onClick={() => {
                  setNotificacionesOpen(false)
                  setNoticiasOpen(true)
                }}
              >
                Ver todas las noticias →
              </button>
            </section>
          )}
        </div>
        
      </header>

      <main>
        <section className="inicio-hero">
<div className="inicio-hero-contenido">
            <span className="inicio-etiqueta">FORMANDO FUTUROS CAMPEONES</span>
            <h1>
              GENERALES DE CHITRÉ<br />
              <span>BASEBALL</span><br />
              ACADEMY
            </h1>
            <p>UN EQUIPO,<br />UNA FAMILIA,<br />UN LEGADO</p>
            <div className="inicio-acciones">
 <button
  type="button"
  className="inicio-boton dorado"
  onClick={onRegistro}
>
  ⚾ INSCRÍBETE AHORA
</button>

</div>
          </div>
          <div className="inicio-hero-imagen">
  <img
    src={equipoGenerales}
    alt="Equipo Generales de Chitré"
    className="inicio-foto-equipo"
  />
  <img
    src={logoGenerales}
    alt="Logo Generales de Chitré"
    className="inicio-logo-portada"
  />
</div>
        </section>

        <Patrocinadores isAdmin={isAdmin} />


        <section className="inicio-inscripcion-destacada" aria-label="Inscripciones">
          <button
            type="button"
            className="inicio-boton dorado inicio-inscripcion-compacta"
            onClick={onRegistro}
          >
            <span aria-hidden="true">⚾</span>
            <span className="inicio-inscripcion-texto">
              <small>INSCRIPCIONES ABIERTAS</small>
              <strong>Forma parte de los Generales</strong>
            </span>
            <span className="inicio-inscripcion-simbolo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3" />
                <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
                <path d="M19 8v6M16 11h6" />
              </svg>
            </span>
          </button>
        </section>

        <section
          className="inicio-instagram-destacado"
          aria-label="Instagram de Generales de Chitré"
        >
  <a
  href="https://www.instagram.com/generales_baseball_chitre/"
  target="_blank"
  rel="noopener noreferrer"
  className="inicio-boton contorno inicio-instagram-boton"
>
  <svg
  width="22"
  height="22"
  viewBox="0 0 24 24"
  fill="none"
  aria-hidden="true"
  style={{ verticalAlign: 'middle', marginRight: 8 }}
>
  <rect x="2" y="2" width="20" height="20" rx="6"
    stroke="#F3B83B" strokeWidth="2" />
  <circle cx="12" cy="12" r="4"
    stroke="white" strokeWidth="2" />
  <circle cx="18" cy="6" r="1.2" fill="#F3B83B" />
</svg>
<span className="inicio-instagram-texto">
  <small>SÍGUENOS EN INSTAGRAM</small>
  <strong>@generales_baseball_chitre</strong>
</span>
</a>
        </section>

        {(imagenesGaleriaPublica.length > 0 || isAdmin) && (
          <section
            className="inicio-cintillo-galeria"
            aria-label="Momentos de Generales de Chitré"
          >
            <header
              className="inicio-cintillo-encabezado inicio-cintillo-acceso"
              onClick={() => setGaleriaOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter' || evento.key === ' ') {
                  setGaleriaOpen(true)
                }
              }}
              title="Abrir galería completa"
            >
              <div>
                <small>GALERÍA GENERALES</small>
                <h2>Nuestros mejores momentos</h2>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={onEditarGaleria}
                >
                  ✏️ Editar cintillo
                </button>
              )}
            </header>

            {imagenesGaleriaPublica.length > 0 ? (
              <div className="inicio-cintillo-ventana">
                <div className="inicio-cintillo-pista">
                  {imagenesGaleriaPublica.map((imagen, indice) => (
                    <button
                      type="button"
                      className="inicio-cintillo-foto"
                      key={`${imagen.id}-${indice}`}
                      onClick={() => setImagenAmpliada(imagen.imagen_url)}
                      aria-label={`Ampliar ${imagen.titulo || 'imagen de la academia'}`}
                    >
                      <img
                        src={imagen.imagen_url}
                        className="portada-ajustable"
                        style={estiloPortada(imagen.ajuste_portada)}
                        alt={imagen.titulo || 'Generales de Chitré'}
                        loading="lazy"
                      />

                      {imagen.titulo && (
                        <span>{imagen.titulo}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="inicio-cintillo-vacio"
                onClick={onEditarGaleria}
              >
                ＋ Agregar las primeras fotos al cintillo
              </button>
            )}
          </section>
        )}

        <VideosCintillo isAdmin={isAdmin} />

        <AnalisisTecnico />

        <section className="inicio-panel-rapido" aria-label="Accesos principales">
          <button
            type="button"
            className="inicio-clases-publicas"
            onClick={() => setClasesVirtualesOpen(true)}
          >
            <span className="inicio-panel-icono">▶</span>
            <strong>Clases virtuales</strong>
            <b>›</b>
          </button>

          <button type="button" onClick={() => setProgramasOpen(true)}>
            <span className="inicio-panel-icono">⚾</span>
            <strong>Programas</strong>
            <b>›</b>
          </button>

          <button type="button" onClick={onJugadoresPublicos}>
            <span className="inicio-panel-icono">👥</span>
            <strong>Jugadores</strong>
            <b>›</b>
          </button>

          <button
            type="button"
            onClick={() => setPartidosPublicosOpen(true)}
          >
            <span className="inicio-panel-icono">📅</span>
            <strong>Partidos</strong>
            <b>›</b>
          </button>

          <button type="button" onClick={() => setNoticiasOpen(true)}>
            <span className="inicio-panel-icono">▤</span>
            <strong>Noticias</strong>
            <b>›</b>
          </button>

          <button type="button" onClick={() => setTiendaOpen(true)}>
            <span className="inicio-panel-icono">🛍️</span>
            <strong>Tienda</strong>
            <b>›</b>
          </button>

          <button
            type="button"
            onClick={() => setJuegosOpen(true)}
          >
            <span className="inicio-panel-icono">★</span>
            <strong>Juegos</strong>
            <b>›</b>
          </button>
        </section>

        {clasesVirtualesOpen && (
          <ClasesVirtuales
            usuario={usuario}
            isAdmin={isAdmin}
            onLogin={onLogin}
            onCerrar={() => setClasesVirtualesOpen(false)}
          />
        )}

        <AgendaAcademia isAdmin={isAdmin} />
        <EstadisticasVisitas isAdmin={isAdmin} />

        

        <section id="programas" className="inicio-valores">
          {juegosOpen && createPortal(
  <div
    className="juegos-pantalla-fondo"
    onClick={() => setJuegosOpen(false)}
  >
    <section
      className="juegos-pantalla"
      onClick={(evento) => evento.stopPropagation()}
    >
      <header className="juegos-pantalla-encabezado">
        <div>
          <small>GENERALES DE CHITRÉ</small>
          <h2>Zona de Juegos</h2>
          <p>Aprende y diviértete jugando béisbol.</p>
        </div>

        <button
          type="button"
          onClick={() => setJuegosOpen(false)}
          aria-label="Volver al inicio"
        >
          ×
        </button>
      </header>

<section className="juegos-acceso-seccion">

  <button
    type="button"
    className="juego-acceso"
    onClick={() => setRetoDigitalOpen(true)}
  >
    <span className="juego-acceso-icono">🏆</span>

    <span className="juego-acceso-texto">
      <strong>Reto Digital</strong>
      <small>100 niveles de conocimientos de béisbol</small>
    </span>

    <b>Jugar →</b>
  </button>

  <button
    type="button"
    className="juego-acceso"
    onClick={() => {
      setJuegosOpen(false)
      setSopaLetrasOpen(true)
    }}
  >
    <span className="juego-acceso-icono">🔎</span>

    <span className="juego-acceso-texto">
      <strong>Sopa de letras</strong>
      <small>100 niveles con palabras de béisbol</small>
    </span>

    <b>Jugar →</b>
  </button>

  <button
    type="button"
    className="juego-acceso"
    onClick={() => {
      setJuegosOpen(false)
      setMemoriaOpen(true)
    }}
  >
    <span className="juego-acceso-icono">🧠</span>

    <span className="juego-acceso-texto">
      <strong>Memoria de Béisbol</strong>
      <small>30 niveles para encontrar parejas</small>
    </span>

    <b>Jugar →</b>
  </button>

  <button
    type="button"
    className="juego-acceso"
    onClick={() => setBateoRetroOpen(true)}
  >
    <span className="juego-acceso-icono">🕹️</span>

    <span className="juego-acceso-texto">
      <strong>Bateo Retro</strong>
      <small>Batea, consigue hits y conecta jonrones</small>
    </span>

    <b>Jugar →</b>
  </button>

</section>
    </section>
  </div>,
  document.body
)}

<section id="servicios" className="inicio-servicios-panel">
  <div className="inicio-servicios-encabezado">
    <span>SERVICIOS DE LA ACADEMIA</span>
    <h2>Explora Generales</h2>
    <p>Información, productos y herramientas de nuestra Academia.</p>
  </div>

  <div className="inicio-servicios-grid">
    <button
      type="button"
      className="inicio-servicio-card servicio-entrenadores"
      onClick={onEntrenadores}
    >
      <span className="inicio-servicio-icono">⚾</span>
      <span>
        <strong>Nuestros entrenadores</strong>
        <small>Conoce al equipo técnico</small>
      </span>
      <b>›</b>
    </button>

    <button
      type="button"
      className="inicio-servicio-card servicio-informacion"
      onClick={() => setMasOpen(true)}
    >
      <span className="inicio-servicio-icono">ℹ️</span>
      <span>
        <strong>Más información</strong>
        <small>Horarios, contacto y ubicación</small>
      </span>
      <b>›</b>
    </button>

    <button
      type="button"
      className="inicio-servicio-card servicio-gestion"
      onClick={onAdmin}
    >
      <span className="inicio-servicio-icono">🔐</span>
      <span>
        <strong>Gestión de la Academia</strong>
        <small>Acceso para miembros autorizados</small>
      </span>
      <b>›</b>
    </button>

    {isAdmin && (
      <button
        type="button"
        className="inicio-servicio-card servicio-scoreboard"
        onClick={() => setScoreboardOpen(true)}
      >
        <span className="inicio-servicio-icono">📊</span>
        <span>
          <strong>Scoreboard Generales</strong>
          <small>Marcador privado para transmisiones</small>
        </span>
        <b>›</b>
      </button>
    )}
  </div>
</section>

{scoreboardOpen && isAdmin && (
  <ScoreboardGenerales
    onCerrar={() => setScoreboardOpen(false)}
  />
)}

{partidosPublicosOpen && (
  <PartidosPublicos
    isAdmin={isAdmin}
    onCerrar={() => setPartidosPublicosOpen(false)}
    onAdministrar={() => {
      setPartidosPublicosOpen(false)
      setCentroPartidosOpen(true)
    }}
  />
)}

{centroPartidosOpen && isAdmin && (
  <CentroPartidos
    onCerrar={() => setCentroPartidosOpen(false)}
  />
)}



{retoDigitalOpen && (
  <RetoDigital onCerrar={() => setRetoDigitalOpen(false)} />
)}

{bateoRetroOpen && (
  <BateoRetro onCerrar={() => setBateoRetroOpen(false)} />
)}

{sopaLetrasOpen && (
  <SopaLetras
    onCerrar={() => setSopaLetrasOpen(false)}
  />
)}
{memoriaOpen && (
  <MemoriaBeisbol
    onCerrar={() => setMemoriaOpen(false)}
  />
)}
{programasOpen && (
  <div
    className="tienda-ventana-fondo"
    onClick={() => setProgramasOpen(false)}
  >
    <div
      className="tienda-ventana"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="tienda-ventana-cerrar"
        onClick={() => setProgramasOpen(false)}
        aria-label="Cerrar programas"
      >
        ×
      </button>
        <h2>PROGRAMAS DE FORMACIÓN</h2> 
          <div className="programas-valores-resumen">
            <div><span>🏅</span><strong>DISCIPLINA</strong><small>En el terreno y en la vida</small></div>
            <div><span>⚾</span><strong>FORMACIÓN</strong><small>Desarrollo integral</small></div>
            <div><span>🏃</span><strong>DESARROLLO</strong><small>Talento y aprendizaje</small></div>
            <div><span>🏆</span><strong>VALORES</strong><small>Respeto y compañerismo</small></div>
          </div>
          <div className="programas-categorias">
  <div
  className={`categoria-card ${categoriaActiva === '4-5' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('4-5')}
>
  <strong>4–5 AÑOS</strong>
  <small>INICIACIÓN</small>
</div>
<div
  className={`categoria-card ${categoriaActiva === '6' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('6')}
>  
  <strong>6 AÑOS</strong>
  <small>FUNDAMENTOS</small>
</div>
<div
  className={`categoria-card ${categoriaActiva === '7' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('7')}
>

  <strong>7 AÑOS</strong>
  <small>DESARROLLO</small>
</div>
  <div
  className={`categoria-card ${categoriaActiva === '8' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('8')}
>
  <strong>8 AÑOS</strong>
  <small>PREPARACIÓN</small>
</div>
</div>
<div className="programa-detalle">
  <h3>
  {categoriaActiva === '4-5' && 'Programa 4–5 años'}
  {categoriaActiva === '6' && 'Programa 6 años'}
  {categoriaActiva === '7' && 'Programa 7 años'}
  {categoriaActiva === '8' && 'Programa 8 años'}
</h3>
{categoriaActiva === '4-5' && (
  <ul className="programa-objetivos">
    <li>Mejorar coordinación y motricidad.</li>
    <li>Aprender los fundamentos básicos del béisbol.</li>
    <li>Desarrollar disciplina y diversión mediante el juego.</li>
  </ul>
)}{categoriaActiva === '6' && (
  <ul className="programa-objetivos">
    <li>Fortalecer los fundamentos de bateo y fildeo.</li>
    <li>Mejorar lanzamiento, recepción y coordinación.</li>
    <li>Aprender posiciones básicas y trabajo en equipo.</li>
  </ul>
)}{categoriaActiva === '6' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      Aprenderá fundamentos de bateo, fildeo y lanzamiento, además de mejorar
      su coordinación, recepción y trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '6' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos con ejercicios técnicos de bateo, fildeo, lanzamiento y
      recepción, combinados con juegos que fortalecen la coordinación y el trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '7' && (
  <ul className="programa-objetivos">
    <li>Perfeccionar bateo, fildeo y lanzamiento.</li>
    <li>Desarrollar coordinación avanzada y reacción.</li>
    <li>Comprender situaciones básicas de juego y toma de decisiones.</li>
  </ul>
)}{categoriaActiva === '8' && (
  <ul className="programa-objetivos">
    <li>Consolidar la técnica de bateo, fildeo y lanzamiento.</li>
    <li>Mejorar la comprensión de posiciones y situaciones de juego.</li>
    <li>Prepararse para competir aplicando disciplina, estrategia y trabajo en equipo.</li>
  </ul>
)}{categoriaActiva === '8' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      Consolidará su técnica de bateo, fildeo y lanzamiento, comprenderá mejor
      las situaciones de juego y se preparará para competir con disciplina,
      estrategia y trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '8' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos enfocados en perfeccionar la técnica ofensiva y defensiva,
      practicar situaciones reales de juego y fortalecer la disciplina,
      estrategia y trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '7' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      Desarrollará mejor su técnica de bateo, fildeo y lanzamiento, aprenderá
      situaciones básicas de juego y mejorará la toma de decisiones en el terreno.
    </p>
  </div>
)}
{categoriaActiva === '7' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos técnicos con ejercicios de bateo, fildeo y lanzamiento,
      combinados con situaciones de juego para desarrollar coordinación,
      reacción y toma de decisiones.
    </p>
  </div>
)}
{categoriaActiva === '4-5' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      A través de juegos y ejercicios sencillos, aprenderá coordinación,
      control corporal, trabajo en equipo y los primeros fundamentos del béisbol.
    </p>
  </div>
)}
{categoriaActiva === '4-5' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos basados en juegos, ejercicios de coordinación y actividades
      sencillas que permiten aprender béisbol de forma divertida y progresiva.
    </p>
  </div>
)}
<p>
  {categoriaActiva === '4-5' && 'Coordinación, juego, motricidad y primeros fundamentos del béisbol.'}
  {categoriaActiva === '6' && 'Fundamentos básicos de bateo, fildeo, lanzamiento y trabajo en equipo.'}
  {categoriaActiva === '7' && 'Desarrollo técnico, coordinación avanzada y situaciones básicas de juego.'}
  {categoriaActiva === '8' && 'Preparación más completa para competir, mejorar técnica y comprender mejor el juego.'}
</p>
</div>
    </div>
  </div>
)}        </section>
    <section id="academia" className="inicio-bienvenida">
          <span className="inicio-etiqueta">NUESTRA ACADEMIA</span>
          <h2>Más que béisbol,<br />una familia.</h2>
          <p>
            En Generales de Chitré formamos niños a través del deporte,
            promoviendo la disciplina, el compañerismo y el desarrollo
            de sus habilidades dentro y fuera del terreno.
          </p>
          <div className="inicio-datos">
            <div><strong>⚾</strong><span>Entrenamiento<br />formativo</span></div>
            <div><strong>🤝</strong><span>Trabajo en<br />equipo</span></div>
            <div><strong>⭐</strong><span>Valores para<br />la vida</span></div>
          </div>
        </section>

      <section id="historia" className="inicio-ubicacion">
  <span className="inicio-etiqueta">NUESTRA HISTORIA</span>
  <h2>Un equipo, una familia, un legado</h2>
  <p>
    Generales de Chitré Baseball Academy nació el 30 de enero de 2025
    de una convicción: el béisbol también enseña valores para la vida.
    Su fundador, Alwin Pérez, junto a los entrenadores Rubén Almanza,
    Esteban Córdoba y Jesús Muñoz, comparte con cada niño lo aprendido
    a lo largo de sus trayectorias en este deporte.
  </p>
</section>


        <section className="programas-acceso-seccion inicio-noticias">
{noticiasOpen && (
  <div
    className="tienda-ventana-fondo"
    onClick={() => setNoticiasOpen(false)}
  >
    <div
      className="tienda-ventana"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="tienda-ventana-cerrar"
        onClick={() => setNoticiasOpen(false)}
        aria-label="Cerrar noticias"
      >
        ×
      </button>
  <span className="inicio-etiqueta">ACTUALIDAD</span>
  <h2>NOTICIAS</h2>
  <p>
    Mantente informado sobre juegos, actividades y novedades de Generales de Chitré.
  </p>
 <div className="noticia-card">
  <span>ACADEMIA</span>
  <h3>Generales de Chitré sigue formando nuevos talentos</h3>
  <p>
    Continuamos trabajando en la formación deportiva, disciplina,
    compañerismo y desarrollo de nuestros niños.
  </p>
</div> 
<div className="noticia-card">
  <span>INSCRIPCIONES ABIERTAS</span>
  <h3>Forma parte de Generales de Chitré Baseball Academy</h3>
<p>
  Recibimos niños de 4 a 8 años que deseen aprender a jugar béisbol o
  desarrollar, de manera sencilla y divertida, los fundamentos básicos
  del juego. ¡No dudes en contactarnos!
</p>
 <a
  className="noticia-boton"
  href="https://wa.me/50763776387"
  target="_blank"
  rel="noreferrer"
>
  SOLICITAR INFORMACIÓN
</a> 
</div>
    </div>
  </div>
)}
</section>

<section id="galeria" className="inicio-galeria">
{galeriaOpen && (
    <div
      className="tienda-ventana-fondo"
      onClick={() => setGaleriaOpen(false)}
    >
      <div
        className="tienda-ventana"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="tienda-ventana-cerrar"
          onClick={() => setGaleriaOpen(false)}
        >
          ×
        </button>

        <h2>GALERÍA</h2>

  <p>
    Momentos de entrenamientos, juegos y actividades de Generales de Chitré.
  </p>
  <div className="galeria-grid">
 
{imagenesGaleriaPublica.map((imagen) => (
  <div className="galeria-item" key={imagen.id}>
    <img
      src={imagen.imagen_url}
      alt={imagen.titulo}
      loading="lazy"
      onClick={() => setImagenAmpliada(imagen.imagen_url)}
    />

    <span className="galeria-nombre">
      🖼️ {imagen.titulo}
    </span>
  </div>
))}
</div>
      </div>
    </div>
  )}
</section>
{productoFormOpen && (
  <div className="tienda-modal-backdrop">
    <form
      className="tienda-modal"
      onSubmit={guardarProducto}
    >
      <button
        type="button"
        className="tienda-modal-cerrar"
        onClick={() => {
          setProductoFormOpen(false)
          setProductoEditando(null)
        }}
        aria-label="Cerrar"
      >
        ×
      </button>

      <h3>
        {productoEditando
          ? 'Editar producto'
          : 'Agregar producto'}
      </h3>

      <label>
        Nombre
        <input
          type="text"
          value={productoForm.nombre}
          onChange={(e) =>
            setProductoForm({
              ...productoForm,
              nombre: e.target.value
            })
          }
          required
        />
      </label>

      <label>
        Descripción
        <textarea
          value={productoForm.descripcion}
          onChange={(e) =>
            setProductoForm({
              ...productoForm,
              descripcion: e.target.value
            })
          }
          rows="3"
        />
      </label>

      <label>
        Precio
        <input
          type="number"
          min="0"
          step="0.01"
          value={productoForm.precio}
          onChange={(e) =>
            setProductoForm({
              ...productoForm,
              precio: e.target.value
            })
          }
          required
        />
      </label>

      <label>
        Imagen
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) =>
            setProductoForm({
              ...productoForm,
              imagen: e.target.files?.[0] || null
            })
          }
        />
      </label>

      <label className="tienda-disponible">
        <input
          type="checkbox"
          checked={productoForm.disponible}
          onChange={(e) =>
            setProductoForm({
              ...productoForm,
              disponible: e.target.checked
            })
          }
        />
        Producto disponible
      </label>

      <button
        type="submit"
        className="tienda-guardar"
        disabled={guardandoProducto}
      >
        {guardandoProducto
          ? 'Guardando...'
          : 'Guardar producto'}
      </button>

      {productoEditando && (
        <button
          type="button"
          className="tienda-eliminar"
          onClick={async () => {
            await eliminarProducto(productoEditando)
            setProductoFormOpen(false)
            setProductoEditando(null)
          }}
        >
          Eliminar producto
        </button>
      )}
    </form>
  </div>
)}

{imagenAmpliada && (
  <div
    className="imagen-modal"
    onClick={() => setImagenAmpliada(null)}
  >
    <button
      className="imagen-modal-cerrar"
      onClick={() => setImagenAmpliada(null)}
      aria-label="Cerrar imagen"
    >
      ×
    </button>

    <img
      src={imagenAmpliada}
      alt="Imagen ampliada de Generales de Chitré"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
<section id="tienda" className="inicio-tienda">
  

{tiendaOpen && (
  <div
    className="tienda-ventana-fondo"
    onClick={() => setTiendaOpen(false)}
  >
    <div
      className="tienda-ventana"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="tienda-ventana-cerrar"
        onClick={() => setTiendaOpen(false)}
        aria-label="Cerrar tienda"
      >
        ×
      </button>
  <div className="tienda-encabezado">
    <div>
      <span className="inicio-etiqueta">TIENDA</span>
      <h2>Accesorios de la academia</h2>
      <p>Productos disponibles de Generales de Chitré.</p>
    </div>

    {isAdmin && (
      <button
        type="button"
        className="tienda-agregar"
        onClick={() => {
          setProductoEditando(null)
          setProductoForm({
            nombre: '',
            descripcion: '',
            precio: '',
            disponible: true,
            imagen: null
          })
          setProductoFormOpen(true)
        }}
      >
        + Agregar producto
      </button>
    )}
  </div>

  {loadingTienda ? (
    <p className="tienda-vacia">Cargando productos...</p>
  ) : productos.filter(
      (producto) => isAdmin || producto.disponible
    ).length === 0 ? (
    <p className="tienda-vacia">
      No hay productos disponibles en este momento.
    </p>
  ) : (
    <div className="tienda-grid">
      {productos
        .filter((producto) => isAdmin || producto.disponible)
        .map((producto) => (
          <article className="producto-card" key={producto.id}>
            <div className="producto-imagen">
              {producto.imagen_url ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                />
              ) : (
                <span>⚾</span>
              )}
            </div>

            <div className="producto-info">
              <h3>{producto.nombre}</h3>

              {producto.descripcion && (
                <p>{producto.descripcion}</p>
              )}

              <strong>
                ${Number(producto.precio).toFixed(2)}
              </strong>

              {isAdmin && (
                <span
                  className={`producto-estado ${
                    producto.disponible
                      ? 'disponible'
                      : 'agotado'
                  }`}
                >
                  {producto.disponible
                    ? 'Disponible'
                    : 'No disponible'}
                </span>
              )}

              <a
                className="producto-whatsapp"
                href={`https://wa.me/50763776387?text=${encodeURIComponent(
                  `Hola, me interesa el producto ${producto.nombre} de Generales de Chitré.`
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Pedir por WhatsApp
              </a>

              {isAdmin && (
                <button
                  type="button"
                  className="producto-editar"
                  onClick={() => {
                    setProductoEditando(producto)
                    setProductoForm({
                      nombre: producto.nombre,
                      descripcion: producto.descripcion || '',
                      precio: producto.precio,
                      disponible: producto.disponible,
                      imagen: null
                    })
                    setProductoFormOpen(true)
                  }}
                >
                  Editar producto
                </button>
              )}
            </div>
          </article>
        ))}
    </div>
  )}
      </div>
  </div>
)}


</section>
        <section id="mas" className="inicio-mas">
          
{masOpen && (
  <div
    className="tienda-ventana-fondo"
    onClick={() => setMasOpen(false)}
  >
    <div
      className="tienda-ventana"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="tienda-ventana-cerrar"
        onClick={() => setMasOpen(false)}
        aria-label="Cerrar información"
      >
        ×
      </button>
  <span className="inicio-etiqueta">INFORMACIÓN</span>
  <h2>MÁS</h2>
  <p>
    Conoce nuestros horarios, ubicación, contacto y más información de Generales de Chitré.
    </p>
    <div className="mas-informacion-contenido">

  <article>
    <h3>🕒 Horarios de entrenamiento</h3>
    <p>Lunes, miércoles y viernes</p>
    <p>Primer grupo: 4:45 p. m.</p>
    <p>Segundo grupo: 6:00 p. m.</p>
  </article>

  <article>
    <h3>📍 Ubicación</h3>
    <p>Estadio Pepe Osorio, Calle Abajo de Chitré, Herrera.</p>

<a
  className="ubicacion-enlace"
  href="https://www.google.com/maps/search/?api=1&query=Estadio+Pepe+Osorio+Chitre+Herrera"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg
  className="boton-enlace-icono"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <path
    fill="currentColor"
    d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"
  />
</svg>

<span>Cómo llegar al estadio</span>
</a>
  </article>

  <article>
    <h3>📱 Contacto</h3>
    <p>WhatsApp: 6377-6387</p>

<a
  className="whatsapp-enlace"
  href="https://wa.me/50763776387"
  target="_blank"
  rel="noopener noreferrer"
>
  <svg
  className="boton-enlace-icono"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <path
    fill="currentColor"
    d="M12 2a9.84 9.84 0 0 0-8.45 14.87L2 22l5.27-1.5A9.94 9.94 0 1 0 12 2Zm0 17.95a8 8 0 0 1-4.08-1.11l-.29-.17-3.13.89.92-3.05-.19-.31A8 8 0 1 1 12 19.95Zm4.39-5.99c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06a6.55 6.55 0 0 1-1.93-1.19 7.23 7.23 0 0 1-1.34-1.67c-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.39 1.37.5.58.18 1.1.16 1.51.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z"
  />
</svg>

<span>Contáctanos por WhatsApp</span>
</a>
  </article>

  <article>
    <h3> Nuestro lema</h3>
    <p>“Un equipo, una familia, un legado”.</p>
  </article>
</div>
    </div>
  </div>
)}
</section>
<section className="gestion-acceso-seccion">
  
<div style={{ height: '16px' }}></div>
  
</section>
      </main>

      {mostrarBarraPrincipal && (
      <nav className="inicio-nav">
        <a
          className={seccionActiva === 'inicio' ? 'activo' : ''}
          href="#inicio"
          onClick={() => setSeccionActiva('inicio')}
        >
          <span>⌂</span>
          Inicio
        </a>

        <button
          type="button"
          className={seccionActiva === 'jugadores' ? 'activo' : ''}
          onClick={() => {
            setSeccionActiva('jugadores')
            onJugadoresPublicos()
          }}
        >
          <span>👥</span>
          Jugadores
        </button>

        <button
          type="button"
          className={seccionActiva === 'partidos' ? 'activo' : ''}
          onClick={() => {
            setSeccionActiva('partidos')
            setPartidosPublicosOpen(true)
          }}
        >
          <span>📅</span>
          Partidos
        </button>

        <button
          type="button"
          className={seccionActiva === 'juegos' ? 'activo' : ''}
          onClick={() => {
            setSeccionActiva('juegos')
            setJuegosOpen(true)
          }}
        >
          <span>🎮</span>
          Juegos
        </button>

        <button
          type="button"
          className={seccionActiva === 'tienda' ? 'activo' : ''}
          onClick={() => {
            setSeccionActiva('tienda')
            setTiendaOpen(true)
          }}
        >
          <span>🛍️</span>
          Tienda
        </button>

        <a
          className={seccionActiva === 'mas' ? 'activo' : ''}
          href="#servicios"
          onClick={() => setSeccionActiva('mas')}
        >
          <span>•••</span>
          Más
        </a>
      </nav>
      )}
    </div>
  );
}
