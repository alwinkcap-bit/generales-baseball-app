import React from 'react'
import './MemoriaBeisbol.css'

export default function MemoriaBeisbol({ onCerrar }) {
  return (
    <div className="memoria-ventana-fondo">
      <section className="memoria-juego">
        <button
          type="button"
          className="memoria-cerrar"
          onClick={onCerrar}
          aria-label="Cerrar juego"
        >
          ✕
        </button>

        <p className="memoria-etiqueta">JUEGO EDUCATIVO</p>
        <h2>🧠 Memoria de Béisbol</h2>
        <p>Nivel 1 de 30</p>
        <p>Encuentra todas las parejas relacionadas con el béisbol.</p>
      </section>
    </div>
  )
}