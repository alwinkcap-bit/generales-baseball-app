import AjustePortadaSubida from './AjustePortadaSubida'
import EditorPortada, { estiloPortada } from './EditorPortada'
import VideoCintilloVisor from './VideoCintilloVisor'
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './VideosCintillo.css'

const BUCKET = 'videos-cintillo'

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
      setMensaje('Selecciona un video antes de publicar.')
      return
    }
    setOcupado(true)
    setMensaje('Comprobando video…')
    let rutaSubida = null
    try {
      const nombre = titulo.trim()
      if (!nombre) throw new Error('Escribe el título.')
      if (!['video/mp4', 'video/webm'].includes(archivo.type)) {
        throw new Error('Selecciona un MP4 o WebM.')
      }
      if (archivo.size > 50 * 1024 * 1024) {
        throw new Error('El máximo es 50 MB.')
      }
      const duracion = await medirDuracion(archivo)
      if (!Number.isFinite(duracion) || duracion <= 0 || duracion > 20) {
        throw new Error(
          Number.isFinite(duracion)
            ? `El video dura ${duracion.toFixed(2)} segundos. El máximo es 20.`
            : 'No se pudo determinar la duración. Prueba exportándolo como MP4.'
        )
      }
      const extension = archivo.type === 'video/webm' ? 'webm' : 'mp4'
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
        ajuste_portada: portada
      })
      if (error) throw error
      rutaSubida = null
      setTitulo('')
      setArchivo(null)
      setPortada({ modo: 'cover', x: 50, y: 50, zoom: 1, tiempo: 0 })
      if (entrada.current) entrada.current.value = ''
      setEditor(false)
      setMensaje('✅ Video publicado.')
      window.alert('Video publicado correctamente.')
      await cargar()
    } catch (error) {
      let aviso = ''
      if (rutaSubida) {
        const { error: limpieza } = await supabase.storage
          .from(BUCKET).remove([rutaSubida])
        if (limpieza) aviso = ' El archivo quedó pendiente de limpieza.'
      }
      console.error('Error publicando video:', error)
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
        : 'Video eliminado.')
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <section className="videos-cintillo" aria-label="Videos de la academia">
      <header className="videos-cintillo-header">
        <div>
          <small>GENERALES EN ACCIÓN</small>
          <h3>Mejores momentos</h3>
          <p>Entrenamientos y jugadas en 20 segundos.</p>
        </div>
        {isAdmin && (
          <button type="button" disabled={ocupado}
            onClick={() => setEditor(actual => !actual)}>
            {editor ? 'Cerrar' : '＋ Publicar video'}
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
            MP4 o WebM · máximo 20 segundos y 50 MB
            <input ref={entrada} type="file" accept="video/mp4,video/webm"
              required disabled={ocupado}
              onChange={evento => {
                setArchivo(evento.target.files?.[0] || null)
                setPortada({
                  modo: 'cover', x: 50, y: 50, zoom: 1, tiempo: 0
                })
              }} />
          </label>
          {archivo && (
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
          <button type="button" onClick={publicar} disabled={ocupado}>
            {ocupado ? 'Publicando…' : 'Publicar'}
          </button>
        </form>
      )}

      {mensaje && <p className="videos-cintillo-mensaje" role="status">{mensaje}</p>}
      {videos.length === 0 ? (
        <p className="videos-cintillo-vacio">Pronto compartiremos nuevos videos.</p>
      ) : (
        <>
          <p className="videos-cintillo-ayuda">Desliza para ver más videos →</p>
          <div className="videos-cintillo-lista">
            {videos.map(video => {
              const { data } = supabase.storage
                .from(BUCKET).getPublicUrl(video.archivo_path)
              return (
                <article className="videos-cintillo-tarjeta" key={video.id}>
                  <VideoCintilloVisor
                    src={data.publicUrl}
                    titulo={video.titulo}
                    ajuste={video.ajuste_portada}
                  />
                  {isAdmin && (
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
                    <span>{Math.ceil(Number(video.duracion))} s</span>
                  </div>
                  {isAdmin && (
                    <button className="videos-cintillo-eliminar" type="button"
                      disabled={ocupado} onClick={() => eliminar(video)}>
                      Eliminar video
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
