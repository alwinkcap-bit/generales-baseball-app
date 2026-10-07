import EditorPortada, { estiloPortada } from './EditorPortada'
import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import './Patrocinadores.css'

const formularioInicial = {
  id: null,
  nombre: '',
  mensaje: '',
  enlace: '',
  orden: 0,
  activo: true,
  destacado: false,
  logo_url: '',
  logo_path: '',
  banner_url: '',
  banner_path: ''
}

export default function Patrocinadores({ isAdmin }) {
  const [patrocinadores, setPatrocinadores] = useState([])
  const [indice, setIndice] = useState(0)
  const [administrando, setAdministrando] = useState(false)
  const [formulario, setFormulario] = useState(formularioInicial)
  const [logoArchivo, setLogoArchivo] = useState(null)
  const [bannerArchivo, setBannerArchivo] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function cargarPatrocinadores() {
    const { data, error } = await supabase
      .from('patrocinadores')
      .select('*')
      .order('orden', { ascending: true })
      .order('creado_en', { ascending: false })

    if (error) {
      console.error('Error cargando patrocinadores:', error)
      return
    }

    setPatrocinadores(data || [])
  }

  useEffect(() => {
    cargarPatrocinadores()
  }, [])

  const visibles = useMemo(
    () => patrocinadores.filter((item) => item.activo),
    [patrocinadores]
  )

  const destacados = useMemo(
    () => visibles.filter((item) => item.destacado && item.banner_url),
    [visibles]
  )

  useEffect(() => {
    if (destacados.length <= 1) return

    const temporizador = window.setInterval(() => {
      setIndice((actual) => (actual + 1) % destacados.length)
    }, 6000)

    return () => window.clearInterval(temporizador)
  }, [destacados.length])

  useEffect(() => {
    if (indice >= destacados.length) setIndice(0)
  }, [destacados.length, indice])

  async function subirImagen(archivo, carpeta) {
    if (!archivo) return null

    const extension =
      archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ruta = `${carpeta}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from('patrocinadores')
      .upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: false,
        contentType: archivo.type
      })

    if (error) throw error

    const { data } = supabase.storage
      .from('patrocinadores')
      .getPublicUrl(ruta)

    return {
      url: data.publicUrl,
      path: ruta
    }
  }

  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target

    setFormulario((actual) => ({
      ...actual,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function nuevoPatrocinador() {
    setFormulario(formularioInicial)
    setLogoArchivo(null)
    setBannerArchivo(null)
    setMensaje('')
  }

  function editarPatrocinador(item) {
    setFormulario({ ...formularioInicial, ...item })
    setLogoArchivo(null)
    setBannerArchivo(null)
    setMensaje('')
  }

  async function guardarPatrocinador(evento) {
    evento.preventDefault()

    if (!formulario.nombre.trim()) {
      setMensaje('Escribe el nombre del patrocinador.')
      return
    }

    setGuardando(true)
    setMensaje('Guardando publicidad…')

    try {
      const nuevoLogo = await subirImagen(
        logoArchivo,
        'logos'
      )

      const nuevoBanner = await subirImagen(
        bannerArchivo,
        'banners'
      )

      const datos = {
        nombre: formulario.nombre.trim(),
        mensaje: formulario.mensaje.trim() || null,
        enlace: formulario.enlace.trim() || null,
        orden: Number(formulario.orden) || 0,
        activo: formulario.activo,
        destacado: formulario.destacado,
        logo_url: nuevoLogo?.url || formulario.logo_url || null,
        logo_path: nuevoLogo?.path || formulario.logo_path || null,
        banner_url:
          nuevoBanner?.url || formulario.banner_url || null,
        banner_path:
          nuevoBanner?.path || formulario.banner_path || null,
        actualizado_en: new Date().toISOString()
      }

      const resultado = formulario.id
        ? await supabase
            .from('patrocinadores')
            .update(datos)
            .eq('id', formulario.id)
        : await supabase
            .from('patrocinadores')
            .insert(datos)

      if (resultado.error) throw resultado.error

      setMensaje(
        formulario.id
          ? 'Publicidad actualizada correctamente.'
          : 'Patrocinador agregado correctamente.'
      )

      nuevoPatrocinador()
      await cargarPatrocinadores()
    } catch (error) {
      console.error(error)
      setMensaje(`Error: ${error.message}`)
    } finally {
      setGuardando(false)
    }
  }

  async function eliminarPatrocinador(item) {
    const confirmar = window.confirm(
      `¿Eliminar la publicidad de ${item.nombre}?`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('patrocinadores')
      .delete()
      .eq('id', item.id)

    if (error) {
      window.alert(`No se pudo eliminar: ${error.message}`)
      return
    }

    const archivos = [item.logo_path, item.banner_path].filter(Boolean)

    if (archivos.length) {
      await supabase.storage
        .from('patrocinadores')
        .remove(archivos)
    }

    if (formulario.id === item.id) nuevoPatrocinador()
    await cargarPatrocinadores()
  }

  const destacadoActual = destacados[indice]

  if (
    visibles.length === 0 &&
    !isAdmin
  ) {
    return null
  }

  return (
    <section className="patrocinadores">
      {destacadoActual && (
        <div className="patrocinadores-banner">
          <a
            href={destacadoActual.enlace || undefined}
            target={destacadoActual.enlace ? '_blank' : undefined}
            rel="noreferrer"
          >
            <div
              className="patrocinadores-banner-fondo"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${destacadoActual.banner_url})`
              }}
            ></div>

            <img
                            src={destacadoActual.banner_url}
              alt={`Publicidad de ${destacadoActual.nombre}`}
              className="patrocinadores-banner-imagen portada-ajustable"
              style={estiloPortada(destacadoActual.ajuste_banner)}
            />

            <div className="patrocinadores-banner-sombra"></div>

            <div className="patrocinadores-banner-contenido">
              <small>PATROCINADOR DESTACADO</small>
              <h2>{destacadoActual.nombre}</h2>

              {destacadoActual.mensaje && (
                <p>{destacadoActual.mensaje}</p>
              )}

              {destacadoActual.enlace && (
                <span>Conocer más →</span>
              )}
            </div>
          </a>

          {destacados.length > 1 && (
            <>
              <button
                type="button"
                className="patrocinadores-anterior"
                onClick={() =>
                  setIndice((indice - 1 + destacados.length) % destacados.length)
                }
                aria-label="Publicidad anterior"
              >
                ‹
              </button>

              <button
                type="button"
                className="patrocinadores-siguiente"
                onClick={() =>
                  setIndice((indice + 1) % destacados.length)
                }
                aria-label="Publicidad siguiente"
              >
                ›
              </button>

              <div className="patrocinadores-puntos">
                {destacados.map((item, posicion) => (
                  <button
                    type="button"
                    key={item.id}
                    className={posicion === indice ? 'activo' : ''}
                    onClick={() => setIndice(posicion)}
                    aria-label={`Ver publicidad ${posicion + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {visibles.length > 0 && (
        <div className="patrocinadores-cintillo">
          <div className="patrocinadores-cintillo-titulo">
            <span>★</span>
            PATROCINADORES OFICIALES
          </div>

          <div className="patrocinadores-cintillo-ventana">
            <div className="patrocinadores-cintillo-pista">
              {[...visibles, ...visibles].map((item, posicion) => (
                <a
                  href={item.enlace || undefined}
                  target={item.enlace ? '_blank' : undefined}
                  rel="noreferrer"
                  key={`${item.id}-${posicion}`}
                  className="patrocinadores-cintillo-item"
                >
                  {item.logo_url ? (
                    <span className="portada-logo-marco">
      <img src={item.logo_url} alt={item.nombre}
        className="portada-ajustable"
        style={estiloPortada(item.ajuste_logo)} />
    </span>
                  ) : (
                    <span className="patrocinadores-logo-vacio">★</span>
                  )}

                  <div>
                    <strong>{item.nombre}</strong>
                    {item.mensaje && <small>{item.mensaje}</small>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <button
          type="button"
          className="patrocinadores-administrar"
          onClick={() => setAdministrando(true)}
        >
          ⚙ Administrar publicidad
        </button>
      )}

      {administrando && isAdmin && (
        <div
          className="patrocinadores-modal-fondo"
          onClick={() => setAdministrando(false)}
        >
          <div
            className="patrocinadores-modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <button
              type="button"
              className="patrocinadores-modal-cerrar"
              onClick={() => setAdministrando(false)}
            >
              ×
            </button>

            <header>
              <small>ADMINISTRACIÓN</small>
              <h2>Publicidad y patrocinadores</h2>
              <p>
                Agrega logos para el cintillo y banners para la publicidad destacada.
              </p>
            </header>

            <form onSubmit={guardarPatrocinador}>
              <label>
                Nombre del patrocinador
                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={cambiarCampo}
                  required
                />
              </label>

              <label>
                Mensaje breve
                <input
                  name="mensaje"
                  value={formulario.mensaje}
                  onChange={cambiarCampo}
                  placeholder="Apoyando el talento chitreano"
                />
              </label>

              <label>
                Enlace
                <input
                  name="enlace"
                  type="url"
                  value={formulario.enlace}
                  onChange={cambiarCampo}
                  placeholder="https://..."
                />
              </label>

              <label>
                Orden
                <input
                  name="orden"
                  type="number"
                  value={formulario.orden}
                  onChange={cambiarCampo}
                />
              </label>

              <label className="patrocinadores-archivo">
                Logo para el cintillo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={(evento) =>
                    setLogoArchivo(evento.target.files?.[0] || null)
                  }
                />
              </label>

              <label className="patrocinadores-archivo">
                Imagen horizontal del banner
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={(evento) =>
                    setBannerArchivo(evento.target.files?.[0] || null)
                  }
                />
              </label>

              <div className="patrocinadores-opciones">
                <label>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formulario.activo}
                    onChange={cambiarCampo}
                  />
                  Visible al público
                </label>

                <label>
                  <input
                    type="checkbox"
                    name="destacado"
                    checked={formulario.destacado}
                    onChange={cambiarCampo}
                  />
                  Mostrar en banner grande
                </label>
              </div>

              {mensaje && (
                <p className="patrocinadores-mensaje">{mensaje}</p>
              )}

              <div className="patrocinadores-form-acciones">
                <button type="submit" disabled={guardando}>
                  {guardando
                    ? 'Guardando…'
                    : formulario.id
                      ? 'Guardar cambios'
                      : 'Agregar patrocinador'}
                </button>

                {formulario.id && (
                  <button type="button" onClick={nuevoPatrocinador}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>

            <section className="patrocinadores-listado">
              <h3>Patrocinadores registrados</h3>

              {patrocinadores.length === 0 ? (
                <p>Todavía no hay patrocinadores.</p>
              ) : (
                patrocinadores.map((item) => (
                  <article key={item.id}>
                    {item.logo_url ? (
                      <img src={item.logo_url} alt="" />
                    ) : (
                      <span>★</span>
                    )}

                    <div>
                      <strong>{item.nombre}</strong>
                      <small>
                        {item.activo ? 'Visible' : 'Oculto'}
                        {item.destacado ? ' · Banner destacado' : ''}
                      </small>
                    </div>

                    <div className="patrocinadores-ajustes">
                      {item.logo_url && (
                        <EditorPortada
                          src={item.logo_url}
                          titulo={`Logo: ${item.nombre}`}
                          tabla="patrocinadores"
                          columna="ajuste_logo"
                          id={item.id}
                          valor={item.ajuste_logo}
                          proporcion="1 / 1"
                          etiqueta="Ajustar logo"
                          onGuardado={cargarPatrocinadores}
                        />
                      )}
                      {item.banner_url && (
                        <EditorPortada
                          src={item.banner_url}
                          titulo={`Banner: ${item.nombre}`}
                          tabla="patrocinadores"
                          columna="ajuste_banner"
                          id={item.id}
                          valor={item.ajuste_banner}
                          proporcion="1120 / 430"
                          etiqueta="Ajustar banner"
                          onGuardado={cargarPatrocinadores}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => editarPatrocinador(item)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="eliminar"
                      onClick={() => eliminarPatrocinador(item)}
                    >
                      Eliminar
                    </button>
                  </article>
                ))
              )}
            </section>
          </div>
        </div>
      )}
    </section>
  )
}
