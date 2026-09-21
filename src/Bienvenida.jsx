import React, { useEffect } from 'react'
import './Bienvenida.css'
import logoGenerales from './public/logo-generales.png'

export default function Bienvenida({ onEntrar }) {
  useEffect(() => {
    const temporizador = setTimeout(() => {
      onEntrar()
    }, 5000)

    return () => clearTimeout(temporizador)
  }, [onEntrar])

  return (
    <main className="bienvenida">
      <div className="bienvenida-luces"></div>

      <section className="bienvenida-contenido">
        <span className="bienvenida-etiqueta">
          BIENVENIDOS
        </span>

        <img
          className="bienvenida-logo"
          src={logoGenerales}
          alt="Generales de Chitré Baseball Academy"
        />

        <h1>
          Generales de Chitré
          <small>Baseball Academy</small>
        </h1>
      </section>
    </main>
  )
}