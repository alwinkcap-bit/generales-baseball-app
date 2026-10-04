import React from 'react'
import { createPortal } from 'react-dom'
import './ClasesVirtuales.css'

const clases = [
  ['⚾', 'Fundamentos del béisbol', 'Terreno, bases y objetivo del juego.'],
  ['🧤', 'Fildeo', 'Posición básica, rodados y recepción.'],
  ['🏏', 'Bateo', 'Agarre, postura, balance y coordinación.'],
  ['🏃', 'Corrido de bases', 'Recorrido, velocidad y seguridad.'],
  ['🔢', 'Posiciones defensivas', 'Nombres y números de las posiciones.'],
  ['⭐', 'Valores deportivos', 'Disciplina, respeto y trabajo en equipo.']
]

export default function ClasesVirtuales({ onCerrar }) {
  return createPortal(
    <div className="clases-fondo" onClick={onCerrar}>
      <section
        className="clases-ventana"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="clases-header">
          <div>
            <small>ACADEMIA DIGITAL</small>
            <h2>Clases virtuales de béisbol</h2>
            <p>Aprende fundamentos, reglas y valores deportivos.</p>
          </div>

          <button type="button" onClick={onCerrar}>×</button>
        </header>

        <div className="clases-grid">
          {clases.map(([icono, titulo, descripcion], indice) => (
            <article key={titulo}>
              <small>CLASE {String(indice + 1).padStart(2, '0')}</small>
              <span>{icono}</span>
              <h3>{titulo}</h3>
              <p>{descripcion}</p>
              <button
                type="button"
                onClick={() =>
                  window.alert(
                    'Próximamente estará disponible esta clase.'
                  )
                }
              >
                Ver clase →
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>,
    document.body
  )
}
