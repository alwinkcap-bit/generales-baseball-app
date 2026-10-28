import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'
import './ControlPagos.css'

function hoyPanama() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Panama', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date())
  const valor = tipo => partes.find(p => p.type === tipo).value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}
function nuevoFormulario() {
  const hoy = hoyPanama()
  return {
    jugador_id: '', fecha_pago: hoy, concepto: 'Mensualidad',
    periodo_inicio: hoy.slice(0, 7) + '-01',
    periodo_fin: finMes(hoy.slice(0, 7)),
    monto: '25.00', metodo: 'Efectivo', referencia: '', observacion: ''
  }
}
function finMes(mes) {
  const [anio, numero] = mes.split('-').map(Number)
  return new Date(Date.UTC(anio, numero, 0)).toISOString().slice(0, 10)
}
function dinero(centavos) {
  return new Intl.NumberFormat('es-PA', {
    style: 'currency', currency: 'USD'
  }).format(centavos / 100)
}
function fecha(valor) {
  return valor ? valor.split('-').reverse().join('/') : ''
}
const ADMIN = '8b718847-f2ad-43a4-a26f-4a695138dcb8'

const CACHE_JUGADORES_MS = 5 * 60 * 1000
let cacheJugadores = null
let cacheJugadoresFecha = 0

export default function ControlPagos({ onVolver }) {
  const [jugadores, setJugadores] = useState([])
  const [pagos, setPagos] = useState([])
  const [form, setForm] = useState(nuevoFormulario)
  const [mes, setMes] = useState(() => hoyPanama().slice(0, 7))
  const [jugadorFiltro, setJugadorFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [ocupado, setOcupado] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [errorCarga, setErrorCarga] = useState('')
  const [version, setVersion] = useState(0)
  const bloqueo = useRef(false)
  const registroId = useRef(null)

  useEffect(() => {
    let activo = true
    async function cargarJugadores() {
      if (cacheJugadores && Date.now() - cacheJugadoresFecha < CACHE_JUGADORES_MS) {
        if (activo) setJugadores(cacheJugadores)
        return
      }
      const lista = []
      for (let desde = 0; ; desde += 500) {
        const { data, error } = await supabase.from('jugadores')
          .select('id,nombre,apellido,estado').order('id')
          .range(desde, desde + 499)
        if (error) throw error
        lista.push(...data)
        if (data.length < 500) break
      }
      lista.sort((a, b) =>
        `${a.nombre} ${a.apellido || ''}`.localeCompare(`${b.nombre} ${b.apellido || ''}`, 'es')
      )
      cacheJugadores = lista
      cacheJugadoresFecha = Date.now()
      if (activo) setJugadores(lista)
    }
    cargarJugadores().catch(e => {
      if (activo) setMensaje(`No se pudieron cargar los jugadores: ${e.message}`)
    })
    return () => { activo = false }
  }, [])

  useEffect(() => {
    let activo = true
    async function cargarPagos() {
      setCargando(true)
      setErrorCarga('')
      try {
        const lista = []
        for (let desde = 0; ; desde += 500) {
          const { data, error } = await supabase.from('pagos_academia')
            .select('id,jugador_id,fecha_pago,concepto,periodo_inicio,periodo_fin,monto,metodo,referencia,observacion,anulado,motivo_anulacion')
            .gte('fecha_pago', mes + '-01')
            .lte('fecha_pago', finMes(mes))
            .order('fecha_pago', { ascending: false })
            .order('id')
            .range(desde, desde + 499)
          if (error) throw error
          lista.push(...data)
          if (data.length < 500) break
        }
        if (activo) setPagos(lista)
      } catch (e) {
        if (activo) {
          setPagos([])
          setErrorCarga(e.message)
        }
      } finally {
        if (activo) setCargando(false)
      }
    }
    cargarPagos()
    return () => { activo = false }
  }, [mes, version])

  function cambiar(e) {
    const { name, value } = e.target
    setForm(actual => ({
      ...actual, [name]: value,
      ...(name === 'concepto' && value === 'Mensualidad' ? { monto: '25.00' } : {}),
      ...(name === 'concepto' && value === 'Quincena' ? { monto: '12.50' } : {})
    }))
  }

  async function guardar(e) {
    e.preventDefault()
    if (bloqueo.current) return
    const monto = String(form.monto).trim()
    if (!/^\d+(\.\d{1,2})?$/.test(monto) || Number(monto) <= 0) {
      setMensaje('Escribe un monto mayor que cero, con máximo dos decimales.')
      return
    }
    if (!form.jugador_id || form.periodo_fin < form.periodo_inicio) {
      setMensaje('Selecciona un jugador y revisa el período cubierto.')
      return
    }

    bloqueo.current = true
    setOcupado(true)
    setMensaje('')
    try {
      const { data, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (data.user?.id !== ADMIN) throw new Error('Ingresa como administrador.')
      if (!registroId.current) registroId.current = crypto.randomUUID()

      const datos = {
        ...form, id: registroId.current, monto,
        referencia: form.referencia.trim() || null,
        observacion: form.observacion.trim() || null,
        creado_por: data.user.id
      }
      const { error } = await supabase.from('pagos_academia')
        .insert(datos).select('id').single()
      if (error) throw error

      setMes(form.fecha_pago.slice(0, 7))
      setJugadorFiltro('')
      setVersion(v => v + 1)
      setForm(nuevoFormulario())
      registroId.current = null
      setMensaje('Pago guardado correctamente.')
    } catch (e) {
      setMensaje(`No se pudo guardar: ${e.message}`)
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  async function anular(pago) {
    if (bloqueo.current) return
    const motivo = window.prompt('Escribe el motivo de anulación:')
    if (!motivo?.trim()) return
    bloqueo.current = true
    setOcupado(true)
    try {
      const { data, error } = await supabase.from('pagos_academia')
        .update({ anulado: true, motivo_anulacion: motivo.trim() })
        .eq('id', pago.id).eq('anulado', false).select('id').single()
      if (error) throw error
      if (!data) throw new Error('No se confirmó la anulación.')
      setVersion(v => v + 1)
      setMensaje('Pago anulado. Se conserva en el historial.')
    } catch (e) {
      setMensaje(`No se pudo anular: ${e.message}`)
    } finally {
      bloqueo.current = false
      setOcupado(false)
    }
  }

  function nombre(id) {
    const j = jugadores.find(j => String(j.id) === String(id))
    return j ? `${j.nombre} ${j.apellido || ''}`.trim() : `Jugador #${id}`
  }
  const visibles = pagos.filter(p =>
    !jugadorFiltro || String(p.jugador_id) === jugadorFiltro
  )
  const vigentes = visibles.filter(p => !p.anulado)
  const total = vigentes.reduce((s, p) => s + Math.round(Number(p.monto) * 100), 0)

  return (
    <main className="pagos-panel">
      <header className="pagos-header">
        <div><small>ADMINISTRACIÓN · GENERALES DE CHITRÉ</small>
          <h1>Control de pagos</h1></div>
        <button type="button" onClick={onVolver} disabled={ocupado}>← Volver</button>
      </header>

      <form className="pagos-form" onSubmit={guardar}>
        <h2>Registrar pago</h2>
        <fieldset disabled={ocupado} className="pagos-campos">
          <label>Jugador
            <select name="jugador_id" value={form.jugador_id} onChange={cambiar} required>
              <option value="">Seleccionar jugador</option>
              {jugadores.map(j => <option key={j.id} value={String(j.id)}>
                {j.nombre} {j.apellido || ''}{j.estado === 'Inactivo' ? ' · Inactivo' : ''}
              </option>)}
            </select>
          </label>
          <label>Fecha del pago
            <input type="date" name="fecha_pago" value={form.fecha_pago} onChange={cambiar} required />
          </label>
          <label>Concepto
            <select name="concepto" value={form.concepto} onChange={cambiar}>
              {['Mensualidad', 'Quincena', 'Inscripción', 'Aporte', 'Otro'].map(c =>
                <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Monto recibido ($)
            <input type="number" min="0.01" max="99999999.99" step="0.01"
              name="monto" value={form.monto} onChange={cambiar} required />
          </label>
          <label>Período desde
            <input type="date" name="periodo_inicio" value={form.periodo_inicio}
              onChange={cambiar} required />
          </label>
          <label>Período hasta
            <input type="date" name="periodo_fin" value={form.periodo_fin}
              min={form.periodo_inicio} onChange={cambiar} required />
          </label>
          <label>Método
            <select name="metodo" value={form.metodo} onChange={cambiar}>
              {['Efectivo', 'Yappy', 'Transferencia', 'Otro'].map(m =>
                <option key={m}>{m}</option>)}
            </select>
          </label>
          <label>Referencia o comprobante
            <input name="referencia" value={form.referencia} onChange={cambiar} />
          </label>
          <label>Observación
            <input name="observacion" value={form.observacion} onChange={cambiar} />
          </label>
        </fieldset>
        <p className="pagos-ayuda">
          Revisa el período: al seleccionar Quincena, indica sus fechas.
          El monto sugerido se puede cambiar.
        </p>
        <button type="submit" disabled={ocupado || !jugadores.length}>
          {ocupado ? 'Procesando…' : 'Guardar pago'}
        </button>
      </form>

      {mensaje && <p role="status" className="pagos-mensaje">{mensaje}</p>}

      <section className="pagos-historial">
        <h2>Pagos recibidos</h2>
        <div className="pagos-filtros">
          <label>Mes de recepción
            <input type="month" value={mes} required
              onChange={e => { if (e.target.value) setMes(e.target.value) }} />
          </label>
          <label>Jugador
            <select value={jugadorFiltro} onChange={e => setJugadorFiltro(e.target.value)}>
              <option value="">Todos los jugadores</option>
              {jugadores.map(j => <option key={j.id} value={String(j.id)}>
                {j.nombre} {j.apellido || ''}
              </option>)}
            </select>
          </label>
          <button type="button" onClick={() => setVersion(v => v + 1)}>
            Actualizar
          </button>
        </div>

        {cargando ? <p>Cargando pagos…</p> : errorCarga ? (
          <p role="alert">No se pudieron cargar los pagos: {errorCarga}</p>
        ) : (
          <>
            <div className="pagos-total">
              <span>Total recibido en la selección</span>
              <strong>{dinero(total)}</strong>
              <small>{vigentes.length} pagos vigentes · anulados excluidos</small>
            </div>
            {!visibles.length ? <p>No hay pagos para esta selección.</p> : (
              <div className="pagos-tabla">
                <table>
                  <thead><tr>
                    <th>Jugador / fecha</th><th>Concepto / período</th>
                    <th>Monto</th><th>Método</th><th>Estado</th><th>Acción</th>
                  </tr></thead>
                  <tbody>{visibles.map(p => (
                    <tr key={p.id} className={p.anulado ? 'pago-anulado' : ''}>
                      <td><strong>{nombre(p.jugador_id)}</strong><small>{fecha(p.fecha_pago)}</small></td>
                      <td>{p.concepto}<small>{fecha(p.periodo_inicio)} — {fecha(p.periodo_fin)}</small>
                        {p.observacion && <small>{p.observacion}</small>}</td>
                      <td>{dinero(Math.round(Number(p.monto) * 100))}</td>
                      <td>{p.metodo}{p.referencia && <small>{p.referencia}</small>}</td>
                      <td>{p.anulado ? 'Anulado' : 'Registrado'}
                        {p.anulado && <small>{p.motivo_anulacion}</small>}</td>
                      <td>{!p.anulado && <button type="button" disabled={ocupado}
                        onClick={() => anular(p)}>Anular</button>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}
