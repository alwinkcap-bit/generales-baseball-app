import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import './styles.css'
import Inicio from './Inicio'
import Registro from './Registro';
import EntrenadoresAdmin from './EntrenadoresAdmin'
const blankPlayer = {
  nombre: '', apellido: '', fecha_nacimiento: '', categoria: '', posicion: '', numero: '',
  batea: 'R', lanza: 'R', estatura_cm: '', estatura_pulgadas: '', peso_kg: '', foto_url: '', estado: 'Activo', notas: ''
}

function edad(fecha) {
  if (!fecha) return ''
  const n = new Date(fecha + 'T00:00:00')
  const h = new Date()
  let e = h.getFullYear() - n.getFullYear()
  const m = h.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--
  return e
}

function App() {
  const [tabActiva, setTabActiva] = useState('resumen');
  const [vista, setVista] = useState('inicio')
  const [players, setPlayers] = useState([])
  const [inscripciones, setInscripciones] = useState([])
const [loadingInscripciones, setLoadingInscripciones] = useState(false)
const [inscripcionesOpen, setInscripcionesOpen] = useState(false)
const [jugadoresOpen, setJugadoresOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [session, setSession] = useState(null)
  const adminIds = [
  '8b718847-f2ad-43a4-a26f-4a695138dcb8',
  '57a0147a-6c4b-4dcb-99d6-a4989fa8f731',
]
const isAdmin = adminIds.includes(session?.user?.id)
  const [loginOpen, setLoginOpen] = useState(false)
  const [registroOpen, setRegistroOpen] = useState(false)
  const [acudientesOpen, setAcudientesOpen] = useState(false)
  const [cuentaOpen, setCuentaOpen] = useState(false)
  const [recuperarOpen, setRecuperarOpen] = useState(false)
const [nuevaClaveOpen, setNuevaClaveOpen] = useState(false)
const [acudientes, setAcudientes] = useState([])
const [vinculaciones, setVinculaciones] = useState([])
const [fotoAmpliada, setFotoAmpliada] = useState(null)
const [galeria, setGaleria] = useState([])
const [loadingGaleria, setLoadingGaleria] = useState(false)
const [subiendoGaleria, setSubiendoGaleria] = useState(false)
const [galeriaPublicaOpen, setGaleriaPublicaOpen] = useState(false)
const [galeriaPublica, setGaleriaPublica] = useState([])
const [loadingGaleriaPublica, setLoadingGaleriaPublica] = useState(false)
const [subiendoGaleriaPublica, setSubiendoGaleriaPublica] = useState(false)
const [archivoGaleriaPublica, setArchivoGaleriaPublica] = useState(null)
const [tituloGaleriaPublica, setTituloGaleriaPublica] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [form, setForm] = useState(blankPlayer)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
const [historial, setHistorial] = useState([]);
const [loadingHistorial, setLoadingHistorial] = useState(false);
const [historialFormOpen, setHistorialFormOpen] = useState(false);
const [historialForm, setHistorialForm] = useState({
  fecha: '',
  tipo: '',
  titulo: '',
  observacion: ''
});
const [savingHistorial, setSavingHistorial] = useState(false);
const [editingHistorialId, setEditingHistorialId] = useState(null);
const [premios, setPremios] = useState([]);
const [loadingPremios, setLoadingPremios] = useState(false);
const [premioFormOpen, setPremioFormOpen] = useState(false);
const [premioForm, setPremioForm] = useState({
  premio: '',
  fecha: '',
  descripcion: ''
});
const [savingPremio, setSavingPremio] = useState(false);
async function loadPlayers() {
  setLoading(true)

  const { data, error } = await supabase
    .from('jugadores')
    .select('*')
    .order('nombre')

  if (error) setMessage(error.message)

  setPlayers(data || [])

  if (!selected && data?.length) {
    setSelected(data[0])
  }

  setLoading(false)
}
async function loadInscripciones() {
  if (!isAdmin) return

  setLoadingInscripciones(true)

  const { data, error } = await supabase
    .from('inscripciones')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    setMessage(`No se pudieron cargar las inscripciones: ${error.message}`)
    setInscripciones([])
  } else {
    setInscripciones(data || [])
  }

  setLoadingInscripciones(false)
}
async function cambiarEstadoInscripcion(id, estado) {
  if (!isAdmin) return

  const { error } = await supabase
    .from('inscripciones')
    .update({ estado })
    .eq('id', id)

  if (error) {
    setMessage(`No se pudo actualizar el estado: ${error.message}`)
    return
  }

  setInscripciones((anteriores) =>
    anteriores.map((inscripcion) =>
      inscripcion.id === id
        ? { ...inscripcion, estado }
        : inscripcion
    )
  )
}
async function loadAcudientes() {
  const [perfilesResult, vinculacionesResult] = await Promise.all([
    supabase
      .from('perfiles_acudientes')
      .select('id, nombre, email, created_at')
      .order('created_at', { ascending: false }),

    supabase
      .from('acudiente_jugadores')
      .select('id, acudiente_id, jugador_id, created_at')
  ])

  const error = perfilesResult.error || vinculacionesResult.error

  if (error) {
    setMessage(`No se pudieron cargar los acudientes: ${error.message}`)
    return
  }

  setAcudientes(perfilesResult.data || [])
  setVinculaciones(vinculacionesResult.data || [])
}

async function abrirAcudientes() {
  if (!isAdmin) {
    setMessage('Solo los administradores pueden gestionar acudientes.')
    return
  }

  await loadAcudientes()
  setAcudientesOpen(true)
} 

async function vincularAcudiente(e, acudienteId) {
  e.preventDefault()

  if (!isAdmin) {
    setMessage('Solo los administradores pueden vincular jugadores.')
    return
  }

  const formData = new FormData(e.currentTarget)
  const jugadorId = Number(formData.get('jugador_id'))

  if (!jugadorId) {
    setMessage('Selecciona un jugador.')
    return
  }

  const { error } = await supabase
    .from('acudiente_jugadores')
    .insert({
      acudiente_id: acudienteId,
      jugador_id: jugadorId
    })

  if (error) {
    setMessage(`No se pudo vincular: ${error.message}`)
    return
  }

  setMessage('Jugador vinculado correctamente.')
  await loadAcudientes()
}

async function desvincularJugador(vinculacionId) {
  if (!isAdmin) {
    setMessage('Solo los administradores pueden desvincular jugadores.')
    return
  }

  const confirmar = window.confirm(
    '¿Seguro que deseas desvincular este jugador del acudiente?'
  )

  if (!confirmar) return

  const { error } = await supabase
    .from('acudiente_jugadores')
    .delete()
    .eq('id', vinculacionId)

  if (error) {
    setMessage(`No se pudo desvincular: ${error.message}`)
    return
  }

  setMessage('Jugador desvinculado correctamente.')
  await loadAcudientes()
}

async function loadGaleriaPublica() {
  setLoadingGaleriaPublica(true)

  const { data, error } = await supabase
    .from('galeria_publica')
    .select('*')
    .order('orden', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    setMessage(`No se pudo cargar la galería pública: ${error.message}`)
    setGaleriaPublica([])
  } else {
    setGaleriaPublica(data || [])
  }

  setLoadingGaleriaPublica(false)
}
async function subirImagenGaleriaPublica(e) {
  e.preventDefault()

  if (!archivoGaleriaPublica) {
    setMessage('Selecciona una imagen.')
    return
  }

  if (!archivoGaleriaPublica.type.startsWith('image/')) {
    setMessage('El archivo seleccionado no es una imagen.')
    return
  }

  setSubiendoGaleriaPublica(true)
  setMessage('')

  const extension =
    archivoGaleriaPublica.name.split('.').pop()?.toLowerCase() || 'jpg'

  const storagePath =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('galeria-publica')
    .upload(storagePath, archivoGaleriaPublica, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    setMessage(`No se pudo subir la imagen: ${uploadError.message}`)
    setSubiendoGaleriaPublica(false)
    return
  }

  const { data: publicUrlData } = supabase.storage
    .from('galeria-publica')
    .getPublicUrl(storagePath)

  const { error: insertError } = await supabase
    .from('galeria_publica')
    .insert({
      titulo: tituloGaleriaPublica.trim() || 'Galería',
      imagen_url: publicUrlData.publicUrl,
      storage_path: storagePath
    })

  if (insertError) {
    await supabase.storage
      .from('galeria-publica')
      .remove([storagePath])

    setMessage(`No se pudo guardar la imagen: ${insertError.message}`)
    setSubiendoGaleriaPublica(false)
    return
  }

  setTituloGaleriaPublica('')
  setArchivoGaleriaPublica(null)
  setMessage('Imagen publicada correctamente.')
  await loadGaleriaPublica()
  setSubiendoGaleriaPublica(false)
}
async function eliminarImagenGaleriaPublica(imagen) {
  const confirmar = window.confirm(
    `¿Eliminar "${imagen.titulo}" de la galería pública?`
  )

  if (!confirmar) return

  setMessage('')

  const { error: deleteRowError } = await supabase
    .from('galeria_publica')
    .delete()
    .eq('id', imagen.id)

  if (deleteRowError) {
    setMessage(`No se pudo eliminar: ${deleteRowError.message}`)
    return
  }

  const { error: deleteFileError } = await supabase.storage
    .from('galeria-publica')
    .remove([imagen.storage_path])

  if (deleteFileError) {
    setMessage(
      `Se eliminó el registro, pero no el archivo: ${deleteFileError.message}`
    )
  } else {
    setMessage('Imagen eliminada correctamente.')
  }

  await loadGaleriaPublica()
}
async function loadGaleria(jugadorId) {
  if (!jugadorId) {
    setGaleria([])
    return
  }

  setLoadingGaleria(true)

  const { data, error } = await supabase
    .from('galeria_jugadores')
    .select('id, jugador_id, storage_path, titulo, created_at')
    .eq('jugador_id', jugadorId)
    .order('created_at', { ascending: false })

  if (error) {
    setMessage(`No se pudo cargar la galería: ${error.message}`)
    setGaleria([])
    setLoadingGaleria(false)
    return
  }

  const fotosConUrl = await Promise.all(
    (data || []).map(async (foto) => {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('galeria-jugadores')
        .createSignedUrl(foto.storage_path, 3600)

      if (urlError) return null

      return {
        ...foto,
        url: urlData.signedUrl
      }
    })
  )

  setGaleria(fotosConUrl.filter(Boolean))
  setLoadingGaleria(false)
}
async function eliminarFotoGaleria(foto) {
  const confirmar = window.confirm(
    '¿Deseas eliminar esta fotografía de la galería?'
  )

  if (!confirmar) return

  setLoadingGaleria(true)

  const { error: registroError } = await supabase
    .from('galeria_jugadores')
    .delete()
    .eq('id', foto.id)

  if (registroError) {
    setMessage(`No se pudo eliminar la fotografía: ${registroError.message}`)
    setLoadingGaleria(false)
    return
  }

  const { error: storageError } = await supabase.storage
    .from('galeria-jugadores')
    .remove([foto.storage_path])

  if (storageError) {
    setMessage(
      `La fotografía se retiró de la galería, pero el archivo no pudo limpiarse: ${storageError.message}`
    )
  } else {
    setMessage('Fotografía eliminada correctamente.')
  }

  await loadGaleria(selected.id)
}
async function subirFotoGaleria(e) {
  const archivo = e.target.files?.[0]

  if (!archivo || !selected) return

  if (!archivo.type.startsWith('image/')) {
    setMessage('Selecciona un archivo de imagen.')
    e.target.value = ''
    return
  }

  if (archivo.size > 10 * 1024 * 1024) {
    setMessage('La fotografía no puede superar los 10 MB.')
    e.target.value = ''
    return
  }

  setSubiendoGaleria(true)

  const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const storagePath =
    `${selected.id}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from('galeria-jugadores')
    .upload(storagePath, archivo, {
      cacheControl: '3600',
      upsert: false,
      contentType: archivo.type
    })

  if (uploadError) {
    setMessage(`No se pudo subir la fotografía: ${uploadError.message}`)
    setSubiendoGaleria(false)
    e.target.value = ''
    return
  }

  const { error: registroError } = await supabase
    .from('galeria_jugadores')
    .insert({
      jugador_id: selected.id,
      storage_path: storagePath,
      titulo: archivo.name
    })

  if (registroError) {
    await supabase.storage
      .from('galeria-jugadores')
      .remove([storagePath])

    setMessage(`No se pudo guardar la fotografía: ${registroError.message}`)
    setSubiendoGaleria(false)
    e.target.value = ''
    return
  }

  await loadGaleria(selected.id)
  setMessage('Fotografía agregada correctamente.')
  setSubiendoGaleria(false)
  e.target.value = ''
}
async function loadHistorial(jugadorId) {
  if (!jugadorId) {
    setHistorial([]);
    return;
  }


  setLoadingHistorial(true);

  const { data, error } = await supabase
    .from('historial_jugadores')
    .select('*')
    .eq('jugador_id', jugadorId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error(error);
    setHistorial([]);
  } else {
    setHistorial(data || []);
  }

  setLoadingHistorial(false);
}
async function saveHistorial(e) {
  e.preventDefault();

  if (!isAdmin || !selected?.id) {
    setMessage('Selecciona un jugador e inicia sesión como administrador.');
    return;
  }

  const fecha = historialForm.fecha;
  const tipo = historialForm.tipo.trim();
  const titulo = historialForm.titulo.trim();

  if (!fecha || !tipo || !titulo) {
    setMessage('Completa la fecha, el tipo y el título.');
    return;
  }

  setSavingHistorial(true);

  const valores = {
  fecha,
  tipo,
  titulo,
  observacion: historialForm.observacion.trim() || null
};

const { data, error } = editingHistorialId
  ? await supabase
      .from('historial_jugadores')
      .update(valores)
      .eq('id', editingHistorialId)
      .eq('jugador_id', selected.id)
      .select('id')
  : await supabase
      .from('historial_jugadores')
      .insert({ jugador_id: selected.id, ...valores })
      .select('id');

  setSavingHistorial(false);

  if (error) {
    setMessage(`No se pudo guardar el historial: ${error.message}`);
    return;
  }
if (!data?.length) {
  setMessage('No se guardó ningún registro. Comprueba el acceso.');
  return;
}
  setHistorialForm({ fecha: '', tipo: '', titulo: '', observacion: '' });
  setEditingHistorialId(null);
  setHistorialFormOpen(false);
  await loadHistorial(selected.id);
}
async function eliminarHistorial(item) {
  if (!isAdmin || !selected?.id || !item?.id) return;

  const confirmar = window.confirm(
    `¿Eliminar "${item.titulo || 'este registro'}" del historial de ${selected.nombre}?`
  );
  if (!confirmar) return;

  const { data, error } = await supabase
    .from('historial_jugadores')
    .delete()
    .eq('id', item.id)
    .eq('jugador_id', selected.id)
    .select('id');

  if (error) {
    setMessage(`No se pudo eliminar el registro: ${error.message}`);
    return;
  }

  if (!data?.length) {
    setMessage('No se eliminó ningún registro. Comprueba el acceso.');
    return;
  }

  await loadHistorial(selected.id);
}
async function loadPremios(jugadorId) {
  if (!jugadorId) {
    setPremios([]);
    return;
  }

  setLoadingPremios(true);

  const { data, error } = await supabase
    .from('premios')
    .select('id, premio, fecha, descripcion')
    .eq('jugador_id', jugadorId)
    .order('fecha', { ascending: false });

  if (error) {
    console.error('Error al cargar premios:', error);
    setPremios([]);
  } else {
    setPremios(data || []);
  }

  setLoadingPremios(false);
}
async function savePremio(e) {
  e.preventDefault();

  const nombre = premioForm.premio.trim();

  if (!isAdmin || !selected?.id || !nombre) {
    setMessage('Selecciona un jugador y escribe el nombre del premio.');
    return;
  }

  setSavingPremio(true);

  const { error } = await supabase.from('premios').insert({
    jugador_id: selected.id,
    premio: nombre,
    fecha: premioForm.fecha || null,
    descripcion: premioForm.descripcion.trim() || null
  });

  setSavingPremio(false);

  if (error) {
    setMessage(`No se pudo guardar el premio: ${error.message}`);
    return;
  }

  setPremioForm({ premio: '', fecha: '', descripcion: '' });
  setPremioFormOpen(false);
  await loadPremios(selected.id);
}
async function eliminarPremio(item) {
  if (!isAdmin || !selected?.id || !item?.id) return;

  const confirmar = window.confirm(
    `¿Eliminar el premio "${item.premio}" de ${selected.nombre}?`
  );
  if (!confirmar) return;

  const { data, error } = await supabase
    .from('premios')
    .delete()
    .eq('id', item.id)
    .eq('jugador_id', selected.id)
    .select('id');

  if (error) {
    setMessage(`No se pudo eliminar el premio: ${error.message}`);
    return;
  }

  if (!data?.length) {
    setMessage('No se eliminó ningún premio. Comprueba el acceso de administrador.');
    return;
  }

  await loadPremios(selected.id);
}
useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session)

    if (data.session) {
      loadPlayers()
    } else {
      setPlayers([])
      setSelected(null)
    }
  })

 const { data: auth } = supabase.auth.onAuthStateChange((event, s) => {
  setSession(s)

  if (event === 'PASSWORD_RECOVERY') {
    setNuevaClaveOpen(true)
  }
})

  return () => auth.subscription.unsubscribe()
}, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return players
    return players.filter(p => `${p.nombre} ${p.apellido} ${p.numero ?? ''} ${p.categoria ?? ''} ${p.posicion ?? ''}`.toLowerCase().includes(q))
  }, [players, query])
function openNew() {
    setForm(blankPlayer)
    setEditorOpen(true)
  }
function openEdit(p) {

  const pies = p.estatura_cm ? Math.floor(Number(p.estatura_cm)) : ''
  const pulgadas = p.estatura_cm
    ? Math.round((Number(p.estatura_cm) - Math.floor(Number(p.estatura_cm))) * 12)
    : ''

  const libras = p.peso_kg
    ? (Number(p.peso_kg) / 0.453592).toFixed(1)
    : ''

  setForm({
    ...blankPlayer,
    ...p,
    estatura_cm: pies,
    estatura_pulgadas: pulgadas,
    peso_kg: libras
  })

  setEditorOpen(true)
}   
  
  async function subirFoto(file) {
  if (!file) return

  const extension = file.name.split('.').pop()
  const nombreArchivo = `${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('fotos-jugadores')
    .upload(nombreArchivo, file)

  if (error) {
    alert('Error al subir la foto: ' + error.message)
    return
  }

  const { data } = supabase.storage
    .from('fotos-jugadores')
    .getPublicUrl(nombreArchivo)

  setForm(prev => ({
    ...prev,
    foto_url: data.publicUrl
  }))

  alert('Foto cargada correctamente')
}
  async function savePlayer(e) {
    e.preventDefault()
    setMessage('')
    const payload = {
      nombre: form.nombre.trim(), apellido: form.apellido.trim(), fecha_nacimiento: form.fecha_nacimiento || null,
      categoria: form.categoria || null, posicion: form.posicion || null, numero: form.numero === '' ? null : Number(form.numero),
      batea: form.batea || null, lanza: form.lanza || null, estatura_cm: form.estatura_cm === '' ? null : Number(form.estatura_cm) + (Number(form.estatura_pulgadas || 0) / 12),
      peso_kg: form.peso_kg === '' ? null : Number(form.peso_kg) * 0.453592, foto_url: form.foto_url || null,
      estado: form.estado || null,
notas: form.notas || null,
juegos: Number(form.juegos || 0),
turnos_bate: Number(form.turnos_bate || 0),
hits: Number(form.hits || 0),
carreras: Number(form.carreras || 0),
rbi: Number(form.rbi || 0),
home_runs: Number(form.home_runs || 0)
    }
    let result
    if (form.id) result = await supabase.from('jugadores').update(payload).eq('id', form.id).select().single()
    else result = await supabase.from('jugadores').insert(payload).select().single()
    if (result.error) return setMessage(result.error.message)
    setEditorOpen(false)
    await loadPlayers()
    if (result.data) setSelected(result.data)
  }

  async function deletePlayer(p) {
    if (!confirm(`¿Eliminar a ${p.nombre} ${p.apellido}?`)) return
    const { error } = await supabase.from('jugadores').delete().eq('id', p.id)
    if (error) return setMessage(error.message)
    if (selected?.id === p.id) setSelected(null)
    loadPlayers()
  }

async function login(e) {
  e.preventDefault()
  setMessage('')

  const fd = new FormData(e.currentTarget)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: fd.get('email'),
    password: fd.get('password')
  })

  if (error) {
    alert('Error al iniciar sesión: ' + error.message)
    return
  }

  setSession(data.session)
  await loadPlayers()
  setLoginOpen(false)
  alert('Sesión iniciada correctamente')
}
async function registrarAcudiente(e) {
  e.preventDefault()
  setMessage('')

  const fd = new FormData(e.currentTarget)
  const nombre = String(fd.get('nombre') || '').trim()
  const email = String(fd.get('email') || '').trim().toLowerCase()
  const password = String(fd.get('password') || '')

  if (!nombre || !email || password.length < 8) {
    setMessage('Completa tus datos y usa una contraseña de al menos 8 caracteres.')
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: 'https://alwinkcap-bit.github.io/generales-baseball-app/'
    }
  })

if (error) {
  const detalle =
    typeof error?.message === 'string'
      ? error.message
      : error?.message?.message || error?.code || JSON.stringify(error)

  console.error('Error al crear acudiente:', error)
  setMessage(`No se pudo crear la cuenta: ${detalle}`)
  return
}

  setRegistroOpen(false)

  if (data.session) {
    setSession(data.session)
    await loadPlayers()
    setMessage('Cuenta creada. Un administrador debe vincularte con tu jugador.')
  } else {
    setMessage('Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión.')
  }
}
async function enviarRecuperacion(e) {
  e.preventDefault()
  setMessage('')

  const formData = new FormData(e.currentTarget)
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()

  if (!email) {
    setMessage('Escribe tu correo electrónico.')
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      'https://alwinkcap-bit.github.io/generales-baseball-app/'
  })

  if (error) {
    setMessage(`No se pudo enviar el enlace: ${error.message}`)
    return
  }

  setRecuperarOpen(false)
  setMessage(
    'Revisa tu correo. Recibirás un enlace para cambiar tu contraseña.'
  )
}

async function actualizarClave(e) {
  e.preventDefault()
  setMessage('')

  const formData = new FormData(e.currentTarget)
  const password = String(formData.get('password') || '')
const confirmacion = String(
  formData.get('confirmacion') || ''
)
  if (password.length < 8) {
    setMessage('La nueva contraseña debe tener al menos 8 caracteres.')
    return
  }
if (password !== confirmacion) {
  setMessage('Las contraseñas no coinciden.')
  return
}
  const { error } = await supabase.auth.updateUser({
    password
  })

  if (error) {
    setMessage(`No se pudo actualizar la contraseña: ${error.message}`)
    return
  }

  setNuevaClaveOpen(false)

  await supabase.auth.signOut()

  setSession(null)
  setPlayers([])
  setSelected(null)
  setHistorial([])
  setPremios([])

  setMessage(
    'Contraseña actualizada. Ya puedes iniciar sesión con la nueva contraseña.'
  )
}
  async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    setMessage(`No se pudo cerrar sesión: ${error.message}`)
    return
  }
  setSession(null)
  setPlayers([])
  setSelected(null)
  setHistorial([])
  setPremios([])
}
if (vista === 'registro') {
  return <Registro onVolver={() => setVista('inicio')} />;
}
if (vista === 'entrenadores-admin' && isAdmin) {
  return (
    <EntrenadoresAdmin
      onVolver={() => setVista('admin')}
    />
  )
}
if (vista === 'inicio') {
  return (
    <div>
      <Inicio
  onAdmin={() => setVista('admin')}
  isAdmin={isAdmin}
  onRegistro={() => setVista('registro')}
/>
      
    </div>
  )
}
  return <div className="app-shell">
    <header className="topbar">
      <button className="ghost" onClick={() => setVista('inicio')}>Inicio público</button>
      <div>
        <div className="eyebrow">Generales de Chitré</div>
        <h1>Baseball Academy</h1>
      </div>
      {session ? <button className="ghost" onClick={logout}>Salir</button> : <button className="ghost" onClick={() => setLoginOpen(true)}>🔒 Administrador</button>}
    </header>

    <main>
      <section className="search-row">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre, número, categoría..." />
  <button
  type="button"
  className="ghost"
  onClick={() => setJugadoresOpen(!jugadoresOpen)}
>
  <span className="acceso-icono">👥</span>
<span>{jugadoresOpen ? 'Cerrar jugadores' : 'Jugadores'}</span>
</button>

{isAdmin && (
  <button
    type="button"
    className="primary"
    onClick={openNew}
  >
    + Jugador
  </button>
)} 

{isAdmin && (
  <button
    type="button"
    className="ghost"
    onClick={() => setVista('entrenadores-admin')}
  >
    <span className="acceso-icono">⚾</span>
    <span>Perfiles de entrenadores</span>
  </button>
)}
        {isAdmin && (
  <button
    type="button"
    className="ghost"
    onClick={async () => {
      const abrir = !inscripcionesOpen
      setInscripcionesOpen(abrir)

      if (abrir) {
        await loadInscripciones()
      }
    }}
  >
    <span className="acceso-icono">📝</span>
<span>Inscripciones</span>
  </button>
)}
{isAdmin && (
  <button
    type="button"
    className="ghost"
    onClick={async () => {
      setGaleriaPublicaOpen(true)
      await loadGaleriaPublica()
    }}
  >
    <span className="acceso-icono">🖼️</span>
    <span>Galería pública</span>
  </button>
)}

      </section>
{isAdmin && inscripcionesOpen && (
  <div
    className="inscripciones-modal-fondo"
    onClick={() => setInscripcionesOpen(false)}
  >
    <section
      className="inscripciones-panel"
      onClick={(e) => e.stopPropagation()}
    >
    <div className="inscripciones-titulo">
      <div>
        <span>ADMINISTRACIÓN</span>
        <h2>Inscripciones recibidas</h2>
      </div>

      <button
        type="button"
        className="ghost"
        onClick={loadInscripciones}
      >
        Actualizar
      </button>
    </div>

    {loadingInscripciones ? (
      <p>Cargando inscripciones...</p>
    ) : inscripciones.length === 0 ? (
      <p>No hay inscripciones registradas.</p>
    ) : (
      <div className="inscripciones-lista">
        {inscripciones.map((inscripcion) => (
          <article className="inscripcion-card" key={inscripcion.id}>
            <div className="inscripcion-card-cabecera">
              <div>
                <span className={`inscripcion-estado ${inscripcion.estado}`}>
                  {inscripcion.estado}
                </span>
                <h3>{inscripcion.nombre_nino}</h3>
              </div>

              <strong>
                {inscripcion.fecha_nacimiento
                  ? inscripcion.fecha_nacimiento.split('-').reverse().join('/')
                  : 'Sin fecha'}
              </strong>
            </div>

            <div className="inscripcion-datos">
              <p><b>Acudiente:</b> {inscripcion.nombre_acudiente}</p>
              <p><b>Teléfono:</b> {inscripcion.telefono}</p>
              <p><b>Correo:</b> {inscripcion.correo || 'No indicado'}</p>
              <p><b>Categoría:</b> {inscripcion.categoria || 'No indicada'}</p>
              <p><b>Posición:</b> {inscripcion.posicion || 'No indicada'}</p>
              <p><b>Escuela:</b> {inscripcion.escuela || 'No indicada'}</p>
              <p><b>Residencia:</b> {inscripcion.residencia}</p>
              <p>
                <b>Condición médica o alergia:</b>{' '}
                {inscripcion.condicion_medica || 'No indicada'}
              </p>
              <p>
                <b>Experiencia:</b>{' '}
                {inscripcion.experiencia || 'No indicada'}
              </p>
              <p>
                <b>Academia anterior:</b>{' '}
                {inscripcion.academia_anterior || 'Ninguna'}
              </p>
            </div>
            <div className="inscripcion-acciones">
  <label>
    Estado
    <select
      value={inscripcion.estado}
      onChange={(e) =>
        cambiarEstadoInscripcion(inscripcion.id, e.target.value)
      }
    >
      <option value="pendiente">Pendiente</option>
      <option value="contactado">Contactado</option>
      <option value="inscrito">Inscrito</option>
      <option value="rechazado">Rechazado</option>
    </select>
  </label>
</div>
          </article>
        ))}
      </div>
    )}
    </section>
  </div>
)}
{isAdmin && galeriaPublicaOpen && (
  <div
    className="modal-backdrop"
    onClick={() => setGaleriaPublicaOpen(false)}
  >
    <section
      className="modal galeria-publica-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="close"
        onClick={() => setGaleriaPublicaOpen(false)}
        aria-label="Cerrar"
      >
        ×
      </button>

      <h3>🖼️ Galería pública</h3>
      <p>Agrega imágenes que aparecerán en la página principal.</p>

      <form
        className="galeria-publica-form"
        onSubmit={subirImagenGaleriaPublica}
      >
        <label>
          Título de la imagen
          <input
            type="text"
            value={tituloGaleriaPublica}
            onChange={(e) => setTituloGaleriaPublica(e.target.value)}
            placeholder="Ejemplo: Cumpleañeros"
          />
        </label>

        <label>
          Seleccionar imagen
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) =>
              setArchivoGaleriaPublica(e.target.files?.[0] || null)
            }
            required
          />
        </label>

        <button
          type="submit"
          className="primary full"
          disabled={subiendoGaleriaPublica}
        >
          {subiendoGaleriaPublica ? 'Publicando...' : 'Publicar imagen'}
        </button>
      </form>

      <div className="galeria-publica-lista">
        {loadingGaleriaPublica ? (
          <p>Cargando imágenes...</p>
        ) : galeriaPublica.length === 0 ? (
          <p>Todavía no hay imágenes publicadas desde el panel.</p>
        ) : (
          galeriaPublica.map((imagen) => (
            <article
              className="galeria-publica-item"
              key={imagen.id}
            >
              <img
                src={imagen.imagen_url}
                alt={imagen.titulo}
              />

              <div>
                <strong>{imagen.titulo}</strong>
                <button
                  type="button"
                  className="danger"
                  onClick={() =>
                    eliminarImagenGaleriaPublica(imagen)
                  }
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  </div>
)}
      {message && <div className="message">{message}</div>}
{session && !isAdmin && players.length === 0 && (
  <section className="acudiente-pendiente">
    <div className="acudiente-pendiente-icono">⏳</div>

    <div>
      <h3>Cuenta pendiente de vinculación</h3>
      <p>
        Tu registro fue recibido correctamente. La academia debe
        vincular tu cuenta con tu jugador para que puedas ver su ficha.
      </p>
    </div>
  </section>
)}
      <section className="content-grid">
        {jugadoresOpen && (
  <div
    className="jugadores-modal-fondo"
    onClick={() => setJugadoresOpen(false)}
  >
    <aside
      className="roster jugadores-modal"
      onClick={(e) => e.stopPropagation()}
    >
          <div className="section-title">Jugadores <span>{filtered.length}</span></div>
          {loading ? <div className="empty">Cargando...</div> : filtered.length === 0 ? <div className="empty">No hay jugadores todavía.</div> : filtered.map(p =>
<button
  className={`player-card ${selected?.id===p.id?'active':''}`}
  key={p.id}
  onClick={() => {
    setSelected(p);
    loadHistorial(p.id);
    loadPremios(p.id);
    if (session) {
  loadGaleria(p.id);
} else {
  setGaleria([]);
}
  }}
>
              <div className="avatar">{p.foto_url ? <img src={p.foto_url} alt=""/> : `${p.nombre?.[0]||''}${p.apellido?.[0]||''}`}</div>
              <div className="player-card-info"><strong>{p.nombre} {p.apellido}</strong><span>#{p.numero ?? '—'} · {p.posicion || 'Sin posición'} · {p.categoria || 'Sin categoría'}</span></div>
            </button>)}
        </aside>
          </div>
)}

        <section className="profile">
          {!selected ? <div className="empty hero-empty">Selecciona un jugador para ver su ficha.</div> : <>
            <div className="hero">
              <div className="hero-photo">{selected.foto_url ? <button
  type="button"
  className="foto-perfil-button"
  onClick={() => setFotoAmpliada(selected.foto_url)}
  aria-label="Ampliar foto del jugador"
>
  <img
    src={selected.foto_url}
    alt={`${selected.nombre} ${selected.apellido || ''}`}
  />
</button> : <div className="photo-placeholder">FOTO</div>}</div>
              <div className="hero-info">
                <div className="number-chip">#{selected.numero ?? '—'}</div>
                <h2>{selected.nombre} {selected.apellido}</h2>
              <div className="player-meta">
  <span>{selected.posicion || '—'}</span>
  <span>B/T: {selected.batea || '—'}/{selected.lanza || '—'}</span>
  <span>Edad: {edad(selected.fecha_nacimiento) || '—'}</span>
</div>
                <div className={`status ${String(selected.estado).toLowerCase()==='activo'?'ok':''}`}>{selected.estado || 'Sin estado'}</div>
                {isAdmin && <div className="admin-actions"><button onClick={()=>openEdit(selected)}>Editar</button><button className="danger" onClick={()=>deletePlayer(selected)}>Eliminar</button></div>}
              </div>
            </div>
            <div className="tabs"><button
  type="button"
  className={tabActiva === 'resumen' ? 'tab-activa' : ''}
  onClick={() => setTabActiva('resumen')}
>
  Resumen
</button>

<button
  type="button"
  className={tabActiva === 'estadisticas' ? 'tab-activa' : ''}
  onClick={() => setTabActiva('estadisticas')}
>
  Estadísticas
</button><button
  type="button"
  className={tabActiva === 'historial' ? 'tab-activa' : ''}
  onClick={() => setTabActiva('historial')}
>
  Historial
</button><button
  type="button"
  className={tabActiva === 'premios' ? 'tab-activa' : ''}
  onClick={() => setTabActiva('premios')}
>
  Premios
</button>

{session && (
  <button
    type="button"
    className={tabActiva === 'galeria' ? 'tab-activa' : ''}
    onClick={() => setTabActiva('galeria')}
  >
    Galería
  </button>
)}
</div>
          {tabActiva === 'resumen' ? (
  <div className="summary-grid">
    <div className="bio-card">
      <h3>Información</h3>
      <dl>
        <dt>Fecha de nacimiento</dt>
        <dd>
          {selected.fecha_nacimiento
            ? selected.fecha_nacimiento.split('-').reverse().join('/')
            : '—'}
        </dd>

        <dt>Categoría</dt>
        <dd>{selected.categoria || '—'}</dd>

        <dt>Estatura</dt>
        <dd>
          {selected.estatura_cm
            ? `${Math.floor(Number(selected.estatura_cm))}' ${Math.round((Number(selected.estatura_cm) - Math.floor(Number(selected.estatura_cm))) * 12)}"`
            : '-'}
        </dd>

        <dt>Peso</dt>
        <dd>
          {selected.peso_kg
            ? `${(Number(selected.peso_kg) / 0.453592).toFixed(1)} lb`
            : '-'}
        </dd>
      </dl>
    </div>

    <div className="bio-card">
      <h3>Notas</h3>
      <p>{selected.notas || 'Sin notas registradas.'}</p>
    </div>
  </div>
) : tabActiva === 'estadisticas' ? (
  <div className="summary-grid">
    <div className="bio-card">
      <h3>Estadísticas</h3>
      <div className="stats-grid">
  <div className="stat-card">
    <strong>{selected.juegos ?? 0}</strong>
    <span>Juegos</span>
  </div>

  <div className="stat-card">
    <strong>{selected.turnos_bate ?? 0}</strong>
    <span>Turnos al bate</span>
  </div>

  <div className="stat-card">
    <strong>{selected.hits ?? 0}</strong>
    <span>Hits</span>
  </div>

  <div className="stat-card">
    <strong>{selected.carreras ?? 0}</strong>
    <span>Carreras</span>
  </div>

  <div className="stat-card">
    <strong>{selected.rbi ?? 0}</strong>
    <span>RBI</span>
  </div>

  <div className="stat-card">
    <strong>{selected.home_runs ?? 0}</strong>
    <span>Home Runs</span>
  </div>
</div>
<div className="stat-card">
  <strong>
  {Number(selected.turnos_bate) > 0
    ? (Number(selected.hits || 0) / Number(selected.turnos_bate)).toFixed(3).replace(/^0/, '')
    : '.000'}
</strong>
  <span>AVG</span>
</div>
    </div>
  </div>
) : tabActiva === 'historial' ? (
  <div className="summary-grid">
    <div className="bio-card">
      <h3>Historial</h3>
      {isAdmin && (
  <button
    type="button"
    className="primary"
    onClick={() => {
  setEditingHistorialId(null);
  setHistorialForm({ fecha: '', tipo: '', titulo: '', observacion: '' });
  setHistorialFormOpen(true);
}}
  >
    Agregar registro
  </button>
)}
{isAdmin && historialFormOpen && (
  <form onSubmit={saveHistorial}>
    <label>
      Fecha
      <input
        type="date"
        value={historialForm.fecha}
        onChange={(e) =>
          setHistorialForm({ ...historialForm, fecha: e.target.value })
        }
        required
      />
    </label>

    <label>
      Tipo de actividad
      <input
        type="text"
        placeholder="Entrenamiento, juego o evaluación"
        value={historialForm.tipo}
        onChange={(e) =>
          setHistorialForm({ ...historialForm, tipo: e.target.value })
        }
        required
      />
    </label>

    <label>
      Título
      <input
        type="text"
        value={historialForm.titulo}
        onChange={(e) =>
          setHistorialForm({ ...historialForm, titulo: e.target.value })
        }
        required
      />
    </label>

    <label>
      Observación
      <textarea
        value={historialForm.observacion}
        onChange={(e) =>
          setHistorialForm({ ...historialForm, observacion: e.target.value })
        }
      />
    </label>

    <button type="submit" className="primary" disabled={savingHistorial}>
      {savingHistorial
  ? 'Guardando...'
  : editingHistorialId
    ? 'Guardar cambios'
    : 'Guardar registro'}
    </button>
    <button type="button" onClick={() => setHistorialFormOpen(false)}>
      Cancelar
    </button>
  </form>
)}
<div className="historial-list">
  {loadingHistorial ? (
    <p>Cargando historial...</p>
  ) : historial.length === 0 ? (
    <p>No hay registros en el historial de este jugador.</p>
  ) : (
    historial.map(item => (
      <div className="historial-item" key={item.id}>
        <strong>
          {item.fecha
            ? item.fecha.split('-').reverse().join('/')
            : 'Sin fecha'}
        </strong>

        <span>{item.tipo || 'Actividad'}</span>

        <p>{item.titulo || 'Sin título'}</p>

        {item.observacion && (
          <small>{item.observacion}</small>
        )}
        {isAdmin && (
  <button
    type="button"
    onClick={() => {
      setEditingHistorialId(item.id);
      setHistorialForm({
        fecha: item.fecha || '',
        tipo: item.tipo || '',
        titulo: item.titulo || '',
        observacion: item.observacion || ''
      });
      setHistorialFormOpen(true);
    }}
  >
    Editar registro
  </button>
)}
        {isAdmin && (
  <button
    type="button"
    onClick={() => eliminarHistorial(item)}
  >
    Eliminar registro
  </button>
)}
      </div>
    ))
  )}
</div>
    </div>
  </div>
  ) : tabActiva === 'premios' ? (
  <div className="summary-grid">
    <div className="bio-card">
      <h3>Premios</h3>
      {isAdmin && (
  <button
    type="button"
    className="primary"
    onClick={() => setPremioFormOpen(true)}
  >
    Agregar premio
  </button>
)}
{isAdmin && premioFormOpen && (
  <form onSubmit={savePremio}>
    <label>
      Premio
      <input
        type="text"
        value={premioForm.premio}
        onChange={(e) =>
          setPremioForm({ ...premioForm, premio: e.target.value })
        }
        required
      />
    </label>

    <label>
      Fecha
      <input
        type="date"
        value={premioForm.fecha}
        onChange={(e) =>
          setPremioForm({ ...premioForm, fecha: e.target.value })
        }
      />
    </label>

    <label>
      Descripción
      <textarea
        value={premioForm.descripcion}
        onChange={(e) =>
          setPremioForm({ ...premioForm, descripcion: e.target.value })
        }
      />
    </label>

    <button type="submit" className="primary" disabled={savingPremio}>
      {savingPremio ? 'Guardando...' : 'Guardar premio'}
    </button>
    <button
      type="button"
      onClick={() => setPremioFormOpen(false)}
    >
      Cancelar
    </button>
  </form>
)}

      {loadingPremios ? (
  <p>Cargando premios...</p>
) : premios.length === 0 ? (
  <p>Este jugador aún no tiene premios registrados.</p>
) : (
  premios.map((item) => (
    <div className="historial-item" key={item.id}>
      <strong>{item.premio}</strong>
      <span>
        {item.fecha
          ? item.fecha.split('-').reverse().join('/')
          : 'Sin fecha'}
      </span>
      {item.descripcion && <p>{item.descripcion}</p>}
      {isAdmin && (
  <button
    type="button"
    onClick={() => eliminarPremio(item)}
  >
    Eliminar premio
  </button>
)}
    </div>
  ))
)}
    </div>
  </div>
) : (
  <div className="summary-grid">
    <div className="bio-card galeria-panel">
      <h3>Galería</h3>
{isAdmin && (
  <label
    className={`galeria-subir ${
      subiendoGaleria ? 'disabled' : ''
    }`}
  >
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={subirFotoGaleria}
      disabled={subiendoGaleria}
    />

    {subiendoGaleria
      ? 'Subiendo fotografía...'
      : '+ Subir fotografía'}
  </label>
)}
      {loadingGaleria ? (
        <p>Cargando fotografías...</p>
      ) : galeria.length === 0 ? (
        <p>Este jugador todavía no tiene fotografías.</p>
      ) : (
        <div className="galeria-jugador-grid">
          {galeria.map((foto) => (
           <div
  className="galeria-jugador-item"
  key={foto.id}
>
  <button
    type="button"
    className="galeria-jugador-foto"
    onClick={() => setFotoAmpliada(foto.url)}
  >
    <img
      src={foto.url}
      alt={foto.titulo || 'Fotografía del jugador'}
    />
  </button>

  {isAdmin && (
    <button
      type="button"
      className="galeria-eliminar"
      onClick={() => eliminarFotoGaleria(foto)}
    >
      Eliminar
    </button>
  )}
</div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
          </>}
        </section>
      </section>
    </main>

    <nav className="bottom-nav"><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
  ⌂<span>Inicio</span>
</button><button
  onClick={() =>
    document.querySelector('.roster')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
>
  ⚾<span>Jugadores</span>
</button>

<button
  onClick={() => {
    if (isAdmin) {
      openNew()
      return
    }

    if (session) {
      setCuentaOpen(true)
      return
    }

    setLoginOpen(true)
  }}
>
  {isAdmin ? '➕' : session ? '👤' : '🔒'}
  <span>
    {isAdmin ? 'Agregar' : session ? 'Mi cuenta' : 'Admin'}
  </span>
</button>

{isAdmin && (
  <button onClick={abrirAcudientes}>
    👥
    <span>Acudientes</span>
  </button>
)}

</nav>
{fotoAmpliada && (
  <div
    className="foto-modal-backdrop"
    onClick={() => setFotoAmpliada(null)}
  >
    <div
      className="foto-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="foto-modal-cerrar"
        onClick={() => setFotoAmpliada(null)}
        aria-label="Cerrar foto"
      >
        ×
      </button>

      <img
        src={fotoAmpliada}
        alt="Foto ampliada del jugador"
      />

      <a
        className="foto-descargar"
        href={fotoAmpliada}
        download
        target="_blank"
        rel="noreferrer"
      >
        Descargar foto
      </a>
    </div>
  </div>
)}
    {loginOpen && (
  <div className="modal-backdrop">
    <form className="modal login-modal" onSubmit={login}>
      <button
        type="button"
        className="close"
        onClick={() => setLoginOpen(false)}
      >
        ×
      </button>

      <h3>Iniciar sesión</h3>

      <label>
        Correo
        <input name="email" type="email" required />
      </label>

      <label>
        Contraseña
        <input name="password" type="password" required />
      </label>

      <button className="primary full">Entrar</button>

      <button
        type="button"
        className="ghost"
        onClick={() => {
          setLoginOpen(false)
          setRegistroOpen(true)
        }}
      >
        Crear cuenta de acudiente
      </button>
      <button
  type="button"
  className="ghost"
  onClick={() => {
    setLoginOpen(false)
    setRecuperarOpen(true)
  }}
>
  Olvidé mi contraseña
</button>
    </form>
  </div>
)}
{recuperarOpen && (
  <div className="modal-backdrop">
    <form className="modal" onSubmit={enviarRecuperacion}>
      <button
        type="button"
        className="close"
        onClick={() => setRecuperarOpen(false)}
      >
        ×
      </button>

      <h3>Recuperar contraseña</h3>

      <p>
        Escribe el correo de tu cuenta y te enviaremos un enlace
        para crear una contraseña nueva.
      </p>

      <label>
        Correo
        <input name="email" type="email" required />
      </label>

      <button className="primary full">
        Enviar enlace
      </button>

      <button
        type="button"
        className="ghost"
        onClick={() => {
          setRecuperarOpen(false)
          setLoginOpen(true)
        }}
      >
        Volver a iniciar sesión
      </button>
    </form>
  </div>
)}
{nuevaClaveOpen && (
  <div className="modal-backdrop">
    <form className="modal" onSubmit={actualizarClave}>
      <button
        type="button"
        className="close"
        onClick={async () => {
          setNuevaClaveOpen(false)
          await supabase.auth.signOut()
          setSession(null)
        }}
      >
        ×
      </button>

      <h3>Nueva contraseña</h3>

      <p>
        Escribe y confirma la contraseña nueva.
      </p>

      <label>
        Nueva contraseña
        <input
          name="password"
          type="password"
          minLength={8}
          required
        />
      </label>

      <label>
        Confirmar contraseña
        <input
          name="confirmacion"
          type="password"
          minLength={8}
          required
        />
      </label>

      <button className="primary full">
        Guardar contraseña
      </button>
    </form>
  </div>
)}
{registroOpen && (
  <div className="modal-backdrop">
    <form className="modal registro-modal" onSubmit={registrarAcudiente}>
      <button
        type="button"
        className="close"
        onClick={() => setRegistroOpen(false)}
      >
        ×
      </button>

      <h3>Cuenta de acudiente</h3>
      <p>Podrás ver a tus jugadores cuando la academia los vincule con tu cuenta.</p>

      <label>
        Nombre completo
        <input name="nombre" type="text" required />
      </label>

      <label>
        Correo
        <input name="email" type="email" required />
      </label>

      <label>
        Contraseña
        <input name="password" type="password" minLength={8} required />
      </label>

      <button className="primary full">Crear cuenta</button>

      <button
        type="button"
        className="ghost"
        onClick={() => {
          setRegistroOpen(false)
          setLoginOpen(true)
        }}
      >
        Ya tengo una cuenta
      </button>
    </form>
  </div>
)}
{cuentaOpen && session && !isAdmin && (
  <div className="modal-backdrop">
    <div className="modal cuenta-modal">
      <button
        type="button"
        className="close"
        onClick={() => setCuentaOpen(false)}
      >
        ×
      </button>

  <div className="cuenta-encabezado">
  <div className="cuenta-avatar">👤</div>

  <div>
    <span>Cuenta de acudiente</span>
    <h3>
      {session.user.user_metadata?.nombre || 'Acudiente'}
    </h3>
  </div>
</div>

<div
  className={`cuenta-estado ${
    players.length > 0 ? 'activo' : 'pendiente'
  }`}
>
  <strong>
    {players.length > 0
      ? 'Cuenta vinculada'
      : 'Pendiente de vinculación'}
  </strong>

  <p>
    {players.length > 0
      ? `Tienes ${players.length} jugador(es) vinculado(s).`
      : 'La academia debe vincular tu cuenta con tu jugador.'}
  </p>
</div>

      <button
        type="button"
        className="primary full"
        onClick={() => {
          setCuentaOpen(false)
          logout()
        }}
      >
        Cerrar sesión
      </button>
    </div>
  </div>
)}
{acudientesOpen && (
  <div className="modal-backdrop">
    <div className="modal acudientes-modal">
      <button
        type="button"
        className="close"
        onClick={() => setAcudientesOpen(false)}
      >
        ×
      </button>

      <h3>Solicitudes de acudientes</h3>

      {acudientes.length === 0 ? (
        <p>No hay cuentas de acudientes registradas.</p>
      ) : (
        acudientes.map((acudiente) => {
          const asignados = vinculaciones.filter(
            (vinculacion) => vinculacion.acudiente_id === acudiente.id
          )

          return (
            <div className="acudiente-item" key={acudiente.id}>
              <strong>{acudiente.nombre}</strong>
              <span>{acudiente.email}</span>
              <small>
                {asignados.length > 0
                  ? `${asignados.length} jugador(es) vinculado(s)`
                  : 'Pendiente de vinculación'}
              </small>
              {asignados.map((vinculacion) => {
  const jugadorVinculado = players.find(
    (jugador) =>
      Number(jugador.id) === Number(vinculacion.jugador_id)
  )

  return (
    <div className="vinculacion-item" key={vinculacion.id}>
      <span>
        {jugadorVinculado
          ? `${jugadorVinculado.nombre} ${jugadorVinculado.apellido}`
          : `Jugador #${vinculacion.jugador_id}`}
      </span>

      <button
        type="button"
        className="ghost"
        onClick={() => desvincularJugador(vinculacion.id)}
      >
        Desvincular
      </button>
    </div>
  )
})}
              <form onSubmit={(e) => vincularAcudiente(e, acudiente.id)}>
  <select name="jugador_id" defaultValue="" required>
    <option value="" disabled>
      Seleccionar jugador
    </option>

    {players
  .filter(
    (jugador) =>
      !asignados.some(
        (vinculacion) =>
          Number(vinculacion.jugador_id) === Number(jugador.id)
      )
  )
  .map((jugador) => (
      <option key={jugador.id} value={jugador.id}>
        {jugador.nombre} {jugador.apellido}
      </option>
    ))}
  </select>

  <button type="submit" className="primary">
    Vincular
  </button>
</form>
            </div>
          )
        })
      )}
    </div>
  </div>
)}
    {editorOpen && <div className="modal-backdrop"><form className="modal editor" onSubmit={savePlayer}>
      <button type="button" className="close" onClick={()=>setEditorOpen(false)}>×</button><h3>{form.id?'Editar jugador':'Nuevo jugador'}</h3>
      <div className="form-grid">
        {['nombre','apellido','categoria','posicion','batea','lanza','estado'].map(k=><label key={k}>{k.replace('_',' ')}<input value={form[k] ?? ''} onChange={e=>setForm({...form,[k]:e.target.value})} required={k==='nombre'} /></label>)}
      <label className="wide">Foto del jugador<input type="file" accept="image/*" onChange={(e)=>subirFoto(e.target.files?.[0])} /></label>
        <label>Fecha nacimiento<input type="date" value={form.fecha_nacimiento ?? ''} onChange={e=>setForm({...form,fecha_nacimiento:e.target.value})}/></label>
        <label>Número<input type="number" value={form.numero ?? ''} onChange={e=>setForm({...form,numero:e.target.value})}/></label>
        <label>Estatura '<input type="number" min="0" value={form.estatura_cm ?? ''} onChange={e=>setForm({...form,estatura_cm:e.target.value})}/></label>
        <label>Estatura "<input type="number" min="0" max="11" value={form.estatura_pulgadas ?? ''} onChange={e=>setForm({...form,estatura_pulgadas:e.target.value})}/></label>
        <label>Peso libras<input type="number" step="0.1" value={form.peso_kg ?? ''} onChange={e=>setForm({...form,peso_kg:e.target.value})}/></label>
        <label>Juegos<input type="number" min="0" value={form.juegos ?? 0} onChange={e=>setForm({...form,juegos:e.target.value})}/></label>

<label>Turnos al bate<input type="number" min="0" value={form.turnos_bate ?? 0} onChange={e=>setForm({...form,turnos_bate:e.target.value})}/></label>

<label>Hits<input type="number" min="0" value={form.hits ?? 0} onChange={e=>setForm({...form,hits:e.target.value})}/></label>

<label>Carreras<input type="number" min="0" value={form.carreras ?? 0} onChange={e=>setForm({...form,carreras:e.target.value})}/></label>

<label>RBI<input type="number" min="0" value={form.rbi ?? 0} onChange={e=>setForm({...form,rbi:e.target.value})}/></label>

<label>Home Runs<input type="number" min="0" value={form.home_runs ?? 0} onChange={e=>setForm({...form,home_runs:e.target.value})}/></label>
        <label className="wide">Notas<textarea rows="4" value={form.notas ?? ''} onChange={e=>setForm({...form,notas:e.target.value})}/></label>
      </div><button className="primary full">Guardar jugador</button></form></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
