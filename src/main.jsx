import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { supabase } from './supabase'
import './styles.css'

const blankPlayer = {
  nombre: '', apellido: '', fecha_nacimiento: '', categoria: '', posicion: '', numero: '',
  batea: 'R', lanza: 'R', estatura_cm: '', peso_kg: '', foto_url: '', estado: 'Activo', notas: ''
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
  const [players, setPlayers] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [session, setSession] = useState(null)
  const [loginOpen, setLoginOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [form, setForm] = useState(blankPlayer)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadPlayers() {
    setLoading(true)
    const { data, error } = await supabase.from('jugadores').select('*').order('nombre')
    if (error) setMessage(error.message)
    setPlayers(data || [])
    if (!selected && data?.length) setSelected(data[0])
    setLoading(false)
  }

  useEffect(() => {
    loadPlayers()
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: auth } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
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
    setForm({ ...blankPlayer, ...p })
    setEditorOpen(true)
  }

  async function savePlayer(e) {
    e.preventDefault()
    setMessage('')
    const payload = {
      nombre: form.nombre.trim(), apellido: form.apellido.trim(), fecha_nacimiento: form.fecha_nacimiento || null,
      categoria: form.categoria || null, posicion: form.posicion || null, numero: form.numero === '' ? null : Number(form.numero),
      batea: form.batea || null, lanza: form.lanza || null, estatura_cm: form.estatura_cm === '' ? null : Number(form.estatura_cm),
      peso_kg: form.peso_kg === '' ? null : Number(form.peso_kg), foto_url: form.foto_url || null,
      estado: form.estado || null, notas: form.notas || null
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
    const fd = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') })
    if (error) return setMessage(error.message)
    setLoginOpen(false)
  }

  async function logout() { await supabase.auth.signOut() }

  return <div className="app-shell">
    <header className="topbar">
      <div>
        <div className="eyebrow">Generales de Chitré</div>
        <h1>Baseball Academy</h1>
      </div>
      {session ? <button className="ghost" onClick={logout}>Salir</button> : <button className="ghost" onClick={() => setLoginOpen(true)}>🔒 Administrador</button>}
    </header>

    <main>
      <section className="search-row">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nombre, número, categoría..." />
        {session && <button className="primary" onClick={openNew}>+ Jugador</button>}
      </section>

      {message && <div className="message">{message}</div>}

      <section className="content-grid">
        <aside className="roster">
          <div className="section-title">Jugadores <span>{filtered.length}</span></div>
          {loading ? <div className="empty">Cargando...</div> : filtered.length === 0 ? <div className="empty">No hay jugadores todavía.</div> : filtered.map(p =>
            <button className={`player-card ${selected?.id===p.id?'active':''}`} key={p.id} onClick={()=>setSelected(p)}>
              <div className="avatar">{p.foto_url ? <img src={p.foto_url} alt=""/> : `${p.nombre?.[0]||''}${p.apellido?.[0]||''}`}</div>
              <div className="player-card-info"><strong>{p.nombre} {p.apellido}</strong><span>#{p.numero ?? '—'} · {p.posicion || 'Sin posición'} · {p.categoria || 'Sin categoría'}</span></div>
            </button>)}
        </aside>

        <section className="profile">
          {!selected ? <div className="empty hero-empty">Selecciona un jugador para ver su ficha.</div> : <>
            <div className="hero">
              <div className="hero-photo">{selected.foto_url ? <img src={selected.foto_url} alt=""/> : <div className="photo-placeholder">FOTO</div>}</div>
              <div className="hero-info">
                <div className="number-chip">#{selected.numero ?? '—'}</div>
                <h2>{selected.nombre} {selected.apellido}</h2>
                <p>{selected.posicion || '—'} &nbsp; B/T: {selected.batea || '—'}/{selected.lanza || '—'} &nbsp; Edad: {edad(selected.fecha_nacimiento) || '—'}</p>
                <div className={`status ${String(selected.estado).toLowerCase()==='activo'?'ok':''}`}>{selected.estado || 'Sin estado'}</div>
                {session && <div className="admin-actions"><button onClick={()=>openEdit(selected)}>Editar</button><button className="danger" onClick={()=>deletePlayer(selected)}>Eliminar</button></div>}
              </div>
            </div>
            <div className="tabs"><b>Resumen</b><span>Estadísticas</span><span>Historial</span><span>Premios</span></div>
            <div className="summary-grid">
              <div className="bio-card"><h3>Información</h3><dl>
                <dt>Fecha de nacimiento</dt><dd>{selected.fecha_nacimiento || '—'}</dd>
                <dt>Categoría</dt><dd>{selected.categoria || '—'}</dd>
                <dt>Estatura</dt><dd>{selected.estatura_cm ? `${selected.estatura_cm} cm` : '—'}</dd>
                <dt>Peso</dt><dd>{selected.peso_kg ? `${selected.peso_kg} kg` : '—'}</dd>
              </dl></div>
              <div className="bio-card"><h3>Notas</h3><p>{selected.notas || 'Sin notas registradas.'}</p></div>
            </div>
          </>}
        </section>
      </section>
    </main>

    <nav className="bottom-nav"><button>⌂<span>Inicio</span></button><button>⚾<span>Jugadores</span></button><button onClick={()=>session?openNew():setLoginOpen(true)}>＋<span>{session?'Agregar':'Admin'}</span></button></nav>

    {loginOpen && <div className="modal-backdrop"><form className="modal" onSubmit={login}>
      <button type="button" className="close" onClick={()=>setLoginOpen(false)}>×</button><h3>Administrador</h3>
      <label>Correo<input name="email" type="email" required /></label><label>Contraseña<input name="password" type="password" required /></label>
      <button className="primary full">Entrar</button></form></div>}

    {editorOpen && <div className="modal-backdrop"><form className="modal editor" onSubmit={savePlayer}>
      <button type="button" className="close" onClick={()=>setEditorOpen(false)}>×</button><h3>{form.id?'Editar jugador':'Nuevo jugador'}</h3>
      <div className="form-grid">
        {['nombre','apellido','categoria','posicion','batea','lanza','foto_url','estado'].map(k=><label key={k}>{k.replace('_',' ')}<input value={form[k] ?? ''} onChange={e=>setForm({...form,[k]:e.target.value})} required={k==='nombre'} /></label>)}
        <label>Fecha nacimiento<input type="date" value={form.fecha_nacimiento ?? ''} onChange={e=>setForm({...form,fecha_nacimiento:e.target.value})}/></label>
        <label>Número<input type="number" value={form.numero ?? ''} onChange={e=>setForm({...form,numero:e.target.value})}/></label>
        <label>Estatura cm<input type="number" value={form.estatura_cm ?? ''} onChange={e=>setForm({...form,estatura_cm:e.target.value})}/></label>
        <label>Peso kg<input type="number" step="0.1" value={form.peso_kg ?? ''} onChange={e=>setForm({...form,peso_kg:e.target.value})}/></label>
        <label className="wide">Notas<textarea rows="4" value={form.notas ?? ''} onChange={e=>setForm({...form,notas:e.target.value})}/></label>
      </div><button className="primary full">Guardar jugador</button></form></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
