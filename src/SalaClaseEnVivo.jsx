import React from 'react'
import './SalaClaseEnVivo.css'

export default function SalaClaseEnVivo({
  sala,
  titulo,
  onCerrar
}) {
  const enlaceMeet = String(sala || '').trim()

  const enlaceValido =
    /^https:\/\/meet\.google\.com\/[a-z0-9-]+/i.test(
      enlaceMeet
    )

  return (
    <div
      className="sala-vivo-fondo"
      onClick={onCerrar}
    >
      <section
        className="sala-vivo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="sala-vivo-header">
          <div>
            <small>
              <i></i> CLASE EN VIVO
            </small>

            <h2>{titulo}</h2>
          </div>

          <button
            type="button"
            className="sala-vivo-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar clase en vivo"
            title="Cerrar"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <main className="sala-vivo-contenedor">
          <div className="sala-meet-acceso">
            <span className="sala-meet-icono">
              🎥
            </span>

            <small>VIDEOCONFERENCIA</small>

            <h3>Clase virtual por Google Meet</h3>

            <p>
              La reunión abrirá en Google Meet para utilizar
              correctamente la cámara y el micrófono.
            </p>

            {enlaceValido ? (
              <a
                className="sala-meet-boton"
                href={enlaceMeet}
                target="_blank"
                rel="noopener noreferrer"
              >
                Entrar a la clase en vivo →
              </a>
            ) : (
              <button
                type="button"
                className="sala-meet-boton"
                disabled
              >
                Enlace de Google Meet pendiente
              </button>
            )}

            <span className="sala-meet-aviso">
              Puedes regresar a la aplicación sin cerrar
              la reunión.
            </span>
          </div>
        </main>
      </section>
    </div>
  )
}
