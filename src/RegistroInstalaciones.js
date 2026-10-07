import { supabase } from './supabase'

const CLAVE = 'generales_instalacion_pendiente'
let pendiente = null
let enviando = false

function leer() {
  try {
    return localStorage.getItem(CLAVE) || pendiente
  } catch {
    return pendiente
  }
}

async function enviar() {
  const id = leer()
  if (!id || enviando) return
  enviando = true
  try {
    const { error } = await supabase
      .from('instalaciones_app')
      .insert({ instalacion_id: id })
    if (error && error.code !== '23505') throw error
    if (leer() === id) {
      pendiente = null
      try { localStorage.removeItem(CLAVE) } catch {}
    }
    window.dispatchEvent(new Event('instalaciones-actualizadas'))
  } catch (error) {
    console.error('Instalación pendiente de registrar:', error)
  } finally {
    enviando = false
  }
}

export function observarInstalaciones() {
  function instalada() {
    pendiente = leer() || crypto.randomUUID()
    try { localStorage.setItem(CLAVE, pendiente) } catch {}
    enviar()
  }
  window.addEventListener('appinstalled', instalada)
  window.addEventListener('online', enviar)
  enviar()
  return () => {
    window.removeEventListener('appinstalled', instalada)
    window.removeEventListener('online', enviar)
  }
}
