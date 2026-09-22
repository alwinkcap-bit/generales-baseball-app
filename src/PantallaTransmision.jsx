import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'
import logoGenerales from './public/logo-generales.png'
import './PantallaTransmision.css'

const estadoInicial = {
  nombreVisitante: 'Visitante',
  nombreLocal: 'Generales',
  visitante: 0,
  local: 0,
  inning: 1,
  parte: 'Alta',
  bolas: 0,
  strikes: 0,
  outs: 0,
  primeraBase: false,
  segundaBase: false,
  terceraBase: false,
  carrerasVisitante: Array(9).fill(0),
  carrerasLocal: Array(9).fill(0),
  hitsVisitante: 0,
  erroresVisitante: 0,
  hitsLocal: 0,
  erroresLocal: 0,
  estadoPartido: 'Por comenzar'
}

export default function PantallaTransmision({ codigo }) {
  const [estado, setEstado] = useState(estadoInicial)
  const [cargando, setCargando] = useState(true)
  const [disponible, setDisponible] = useState(true)

  useEffect(() => {
    let activa = true

    async function cargarTransmision() {
      const { data, error } = await supabase
        .from('transmisiones_vivo')
        .select('estado, activa')
        .eq('codigo', codigo)
        .eq('activa', true)
        .maybeSingle()

      if (!activa) return

      if (error || !data) {
        setDisponible(false)
      } else {
        setEstado({
          ...estadoInicial,
          ...(data.estado || {})
        })
        setDisponible(true)
      }

      setCargando(false)
    }

    cargarTransmision()

    const canal = supabase
      .channel(`transmision-${codigo}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transmisiones_vivo',
          filter: `codigo=eq.${codigo}`
        },
        (cambio) => {
          if (!cambio.new?.activa) {
            setDisponible(false)
            return
          }

          setEstado({
            ...estadoInicial,
            ...(cambio.new.estado || {})
          })

          setDisponible(true)
        }
      )
      .subscribe()

    const verificador = window.setInterval(
      cargarTransmision,
      15000
    )

    return () => {
      activa = false
      window.clearInterval(verificador)
      supabase.removeChannel(canal)
    }
  }, [codigo])

  if (cargando) {
    return (
      <main className="transmision-mensaje">
        <div className="transmision-cargando"></div>
        <h1>Conectando con la transmisión…</h1>
      </main>
    )
  }

  if (!disponible) {
    return (
      <main className="transmision-mensaje">
        <img src={logoGenerales} alt="Generales de Chitré" />
        <h1>Transmisión no disponible</h1>
        <p>El partido todavía no ha comenzado o ya finalizó.</p>
      </main>
    )
  }

  return (
    <main className="transmision-vivo">
      <header className="transmision-cabecera">
        <div>
          <span className="transmision-en-vivo">
            <i></i>
            EN VIVO
          </span>

          <small>
            Generales de Chitré Baseball Academy
          </small>
        </div>

        <img
          src={logoGenerales}
          alt="Generales de Chitré"
        />

        <div className="transmision-estado-partido">
          <small>ESTADO DEL PARTIDO</small>
          <strong>{estado.estadoPartido}</strong>
        </div>
      </header>

      <section className="transmision-marcador">
        <article>
          <small>VISITANTE</small>
          <h2>{estado.nombreVisitante}</h2>
          <strong>{estado.visitante}</strong>
        </article>

        <div className="transmision-centro">
          <span>ENTRADA</span>
          <b>{estado.inning}</b>
          <strong>{estado.parte}</strong>
        </div>

        <article>
          <small>LOCAL</small>
          <h2>{estado.nombreLocal}</h2>
          <strong>{estado.local}</strong>
        </article>
      </section>

      <section className="transmision-linea-contenedor">
        <table className="transmision-linea">
          <thead>
            <tr>
              <th>EQUIPO</th>

              {Array.from({ length: 9 }, (_, indice) => (
                <th
                  key={indice}
                  className={
                    estado.inning === indice + 1
                      ? 'entrada-actual'
                      : ''
                  }
                >
                  {indice + 1}
                </th>
              ))}

              <th>R</th>
              <th>H</th>
              <th>E</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th>{estado.nombreVisitante}</th>

              {estado.carrerasVisitante.map(
                (cantidad, indice) => (
                  <td key={indice}>{cantidad}</td>
                )
              )}

              <td>{estado.visitante}</td>
              <td>{estado.hitsVisitante}</td>
              <td>{estado.erroresVisitante}</td>
            </tr>

            <tr>
              <th>{estado.nombreLocal}</th>

              {estado.carrerasLocal.map(
                (cantidad, indice) => (
                  <td key={indice}>{cantidad}</td>
                )
              )}

              <td>{estado.local}</td>
              <td>{estado.hitsLocal}</td>
              <td>{estado.erroresLocal}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="transmision-inferior">
        <div className="transmision-conteo">
          <div>
            <small>BOLAS</small>
            <strong>{estado.bolas}</strong>
          </div>

          <div>
            <small>STRIKES</small>
            <strong>{estado.strikes}</strong>
          </div>

          <div>
            <small>OUTS</small>
            <strong>{estado.outs}</strong>
          </div>
        </div>

        <div className="transmision-bases">
          <span
            className={`base segunda ${
              estado.segundaBase ? 'ocupada' : ''
            }`}
          >
            2
          </span>

          <span
            className={`base tercera ${
              estado.terceraBase ? 'ocupada' : ''
            }`}
          >
            3
          </span>

          <span
            className={`base primera ${
              estado.primeraBase ? 'ocupada' : ''
            }`}
          >
            1
          </span>

          <span className="home">⌂</span>
        </div>
      </section>

      <footer>
        Un equipo, una familia, un legado
      </footer>
    </main>
  )
}