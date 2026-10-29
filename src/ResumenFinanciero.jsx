
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const formatoDinero = valor =>
  new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD'
  }).format(valor)

export default function ResumenFinanciero() {
  const [resumen, setResumen] = useState({
    activos: 0,
    recaudado: 0,
    pagos: 0
  })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true

    async function cargarResumen() {
      try {
        const fecha = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Panama',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date())

        const mes = fecha.slice(0, 7)
        const [anio, numero] = mes.split('-').map(Number)
        const ultimoDia = new Date(
          Date.UTC(anio, numero, 0)
        ).toISOString().slice(0, 10)

        const { count, error: errorJugadores } = await supabase
          .from('jugadores')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'Activo')

        if (errorJugadores) throw errorJugadores

        const lista = []
        for (let desde = 0; ; desde += 500) {
          const { data, error: errorPagos } = await supabase
            .from('pagos_academia')
            .select('monto,anulado')
            .gte('fecha_pago', mes + '-01')
            .lte('fecha_pago', ultimoDia)
            .range(desde, desde + 499)

          if (errorPagos) throw errorPagos
          lista.push(...data)
          if (data.length < 500) break
        }

        const vigentes = lista.filter(p => !p.anulado)
        const centavos = vigentes.reduce(
          (total, p) => total + Math.round(Number(p.monto) * 100),
          0
        )

        if (vigente) {
          setResumen({
            activos: count || 0,
            recaudado: centavos / 100,
            pagos: vigentes.length
          })
        }
      } catch (e) {
        if (vigente) setError(e.message)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    cargarResumen()
    return () => { vigente = false }
  }, [])

  return (
    <section style={{
      padding: 20,
      background: '#102e45',
      border: '1px solid #e7b945',
      borderRadius: 16,
      color: 'white'
    }}>
      <h2>Resumen financiero</h2>
      {cargando ? (
        <p>Cargando información...</p>
      ) : error ? (
        <p role="alert">Error: {error}</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12
        }}>
          {[
            ['Jugadores activos', resumen.activos],
            ['Recaudado este mes', formatoDinero(resumen.recaudado)],
            ['Pagos recibidos', resumen.pagos]
          ].map(([titulo, valor]) => (
            <div key={titulo} style={{
              padding: 16,
              borderRadius: 12,
              background: '#061c2e'
            }}>
              <small>{titulo}</small>
              <h3 style={{ color: '#ffd166' }}>{valor}</h3>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
