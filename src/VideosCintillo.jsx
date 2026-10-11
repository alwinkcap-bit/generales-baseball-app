import AjustePortadaSubida from './AjustePortadaSubida'
import EditorPortada, { estiloPortada } from './EditorPortada'
import VideoCintilloVisor from './VideoCintilloVisor'
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './VideosCintillo.css'

const BUCKET = 'videos-cintillo'
const esImagenCintillo = ruta =>
  /\.(jpg|jpeg|png|webp)$/i.test(ruta || '')

function medirDuracion(archivo) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(archivo)
    let terminado = false
    const finalizar = (error) => {
      if (terminado) return
      terminado = true
      const duracion = video.duration
      clearTimeout(timer)
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
      if (error) reject(error)
      else resolve(duracion)
    }
    const timer = setTimeout(
      () => finalizar(new Error('No se pudo leer la duración.')),
      15000
    )
    video.preload = 'metadata'
    video.onloadedmetadata = () => finalizar()
    video.onerror = () => finalizar(new Error('Prueba con un video MP4.'))
    video.src = url
  })
}

export default function VideosCintillo({ isAdmin }) {
  const [videos, setVideos] = useState([])
  const [titulo, setTitulo] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [portada, setPortada] = useState({
    modo: 'cover', x: 50, y: 50, zoom: 1, tiempo: 0
  })
  const [editor, setEditor] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const entrada = useRef(null)

  async function cargar() {
    const { data, error } = await supabase
      .from('videos_cintillo')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    setVideos(data || [])
  }

  useEffect(() => {
    cargar().catch(error => setMensaje(error.message))
  }, [])

  async function publicar(evento) {
    evento.preventDefault()
    if (ocupado) return
    if (!isAdmin) {
      setMensaje('Inicia sesión como administrador para publicar.')
      return
    }
    if (!archivo) {
      setMensaje('Selecciona una imagen o un video antes de publicar.')
      return
    }
    setOcupado(true)
    setMensaje('Comprobando archivo…')
    let rutaSubida = null
    try {
      const nombre = titulo.trim()
      if (!nombre) throw new Error('Escribe el título.')
      const extensiones = {
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp'
      }
      const extension = extensiones[archivo.type]
      if (!extension) {
        throw new Error('Selecciona MP4, WebM, JPG, PNG o WebP.')
      }

      const esImagen = archivo.type.startsWith('image/')
      const limite = (esImagen ? 10 : 50) * 1024 * 1024
      if (archivo.size > limite) {
        throw new Error(
          esImagen ? 'La imagen no puede superar 10 MB.'
                   : 'El video no puede superar 50 MB.'
        )
      }

      let duracion = 0
      if (esImagen) {
        const urlTemporal = URL.createObjectURL(archivo)
        try {
          await new Promise((resolve, reject) => {
            const imagen = new Image()
            const timer = setTimeout(
              () => reject(new Error('No se pudo leer la imagen.')),
              15000
            )
            imagen.onload = () => {
              clearTimeout(timer)
              resolve()
            }
            imagen.onerror = () => {
              clearTimeout(timer)
              reject(new Error('La imagen no se pudo abrir.'))
            }
            imagen.src = urlTemporal
          })
        } finally {
          URL.revokeObjectURL(urlTemporal)
        }
      } else {
        duracion = await medirDuracion(archivo)
        if (!Number.isFinite(duracion) || duracion <= 0 || duracion > 20) {
          throw new Error('El video debe durar entre 0 y 20 segundos, sin incluir 0.')
        }
      }
      const ruta = `${crypto.randomUUID()}.${extension}`
      setMensaje('Publicando…')
      const { error: subida } = await supabase.storage
        .from(BUCKET)
        .upload(ruta, archivo, { contentType: archivo.type, upsert: false })
      if (subida) throw subida
      rutaSubida = ruta
      const { error } = await supabase.from('videos_cintillo').insert({
        titulo: nombre,
        archivo_path: ruta,
        duracion,
        ajuste_portada: esImagen
          ? { modo: 'contain', x: 50, y: 50, zoom: 1, tiempo: 0 }
          : portada
      })
      if (error) throw error
      rutaSubida = null
      setTitulo('')
      setArchivo(null)
      setPortada({ modo: 'cover', x: 50, y: 50, zoom: 1, tiempo: 0 })
      if (entrada.current) entrada.current.value = ''
      setEditor(false)
      setMensaje('✅ Archivo publicado.')
      window.alert('Archivo publicado correctamente.')
      await cargar()
    } catch (error) {
      let aviso = ''
      if (rutaSubida) {
        const { error: limpieza } = await supabase.storage
          .from(BUCKET).remove([rutaSubida])
        if (limpieza) aviso = ' El archivo quedó pendiente de limpieza.'
      }
      console.error('Error publicando archivo:', error)
      window.alert(`No se pudo publicar: ${error.message || String(error)}${aviso}`)
      setMensaje(`${error.message || String(error)}${aviso}`)
    } finally {
      setOcupado(false)
    }
  }

  async function eliminar(video) {
    if (!isAdmin || ocupado) return
    if (!window.confirm(`¿Eliminar "${video.titulo}"?`)) return
    setOcupado(true)
    try {
      const { data, error } = await supabase.from('videos_cintillo')
        .delete().eq('id', video.id).select('id')
      if (error) throw error
      if (!data?.length) throw new Error('No se confirmó la eliminación.')
      setVideos(actuales => actuales.filter(item => item.id !== video.id))
      const { error: borrado } = await supabase.storage
        .from(BUCKET).remove([video.archivo_path])
      setMensaje(borrado
        ? `Retirado del cintillo. Falta borrar el archivo: ${borrado.message}`
        : 'Archivo eliminado.')
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <section className="videos-cintillo" aria-label="Imágenes y videos de béisbol">
      <header className="videos-cintillo-header">
        <div>
          <small>GENERALES EN ACCIÓN</small>
          <h3>Mejores momentos</h3>
          <p>Imágenes y videos para vivir el béisbol.</p>
        </div>
        {isAdmin && (
          <button type="button" disabled={ocupado}
            onClick={() => setEditor(actual => !actual)}>
            {editor ? 'Cerrar' : '＋ Publicar imagen o video'}
          </button>
        )}
      </header>

      {isAdmin && editor && (
        <form className="videos-cintillo-form" onSubmit={publicar} noValidate>
          <label>
            Título
            <input value={titulo} maxLength={120} required disabled={ocupado}
              onChange={evento => setTitulo(evento.target.value)} />
          </label>
          <label>
            Videos: MP4 o WebM, hasta 20 s y 50 MB. Imágenes: JPG, PNG o WebP, hasta 10 MB.
            <input ref={entrada} type="file" accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
              required disabled={ocupado}
              onChange={evento => {
                setArchivo(evento.target.files?.[0] || null)
                setPortada({
                  modo: 'cover', x: 50, y: 50, zoom: 1, tiempo: 0
                })
              }} />
          </label>
          {archivo && archivo.type.startsWith('video/') && (
            <AjustePortadaSubida
              key={`${archivo.name}-${archivo.lastModified}`}
              archivo={archivo}
              tipo="video"
              valor={portada}
              onChange={setPortada}
              disabled={ocupado}
              proporcion="270 / 155"
            />
          )}
          <button type="submit" disabled={ocupado}>
            {ocupado ? 'Publicando…' : 'Publicar'}
          </button>
        </form>
      )}

      {mensaje && <p className="videos-cintillo-mensaje" role="status">{mensaje}</p>}
      {videos.length === 0 ? (
        <p className="videos-cintillo-vacio">Pronto compartiremos imágenes y videos.</p>
      ) : (
        <>
          <p className="videos-cintillo-ayuda">Desliza para ver imágenes y videos →</p>
          <div className="videos-cintillo-lista">
            {videos.map(video => {
              const { data } = supabase.storage
                .from(BUCKET).getPublicUrl(video.archivo_path)
              const esImagen = esImagenCintillo(video.archivo_path)
              return (
                <article className="videos-cintillo-tarjeta" key={video.id}>
                  {esImagen ? (
                    <a
                      href={data.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir imagen: ${video.titulo}`}
                      style={{
                        display: 'block',
                        width: '100%',
                        aspectRatio: '270 / 155',
                        background: '#081b30',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={data.publicUrl}
                        alt={video.titulo}
                        loading="lazy"
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </a>
                  ) : (
                    <VideoCintilloVisor
                      src={data.publicUrl}
                      titulo={video.titulo}
                      ajuste={video.ajuste_portada}
                    />
                  )}
                  {isAdmin && !esImagen && (
                    <EditorPortada
                      src={data.publicUrl}
                      tipo="video"
                      titulo={video.titulo}
                      tabla="videos_cintillo"
                      id={video.id}
                      valor={video.ajuste_portada}
                      onGuardado={cargar}
                    />
                  )}
                  <div className="videos-cintillo-pie">
                    <strong>{video.titulo}</strong>
                    <small className="videos-cintillo-fecha">
                      {new Date(video.created_at).toLocaleDateString('es-PA', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </small>
                    <span>
                      {esImagen ? 'Imagen' : `${Math.ceil(Number(video.duracion))} s`}
                    </span>
                  </div>
                  {isAdmin && (
                    <button className="videos-cintillo-eliminar" type="button"
                      disabled={ocupado} onClick={() => eliminar(video)}>
                      Eliminar archivo
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}
