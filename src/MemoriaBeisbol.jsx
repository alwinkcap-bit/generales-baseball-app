import React, { useState } from 'react'
import './MemoriaBeisbol.css'

const parejasNivel1 = [
  { nombre: 'Pelota', icono: '⚾' },
  { nombre: 'Bate', icono: '🏏' },
  { nombre: 'Guante', icono: '🧤' },
  { nombre: 'Gorra', icono: '🧢' },
  { nombre: 'Trofeo', icono: '🏆' },
  { nombre: 'Estadio', icono: '🏟️' },
]

function crearCartas() {
  return [...parejasNivel1, ...parejasNivel1]
    .map((pareja, indice) => ({
      ...pareja,
      id: `${pareja.nombre}-${indice}`,
      encontrada: false,
    }))
    .sort(() => Math.random() - 0.5)
}

export default function MemoriaBeisbol({ onCerrar }) {
  const [cartas, setCartas] = useState(crearCartas)
  const [seleccionadas, setSeleccionadas] = useState([])
  const [movimientos, setMovimientos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)

  const elegirCarta = (carta) => {
    if (
      bloqueado ||
      carta.encontrada ||
      seleccionadas.some((seleccionada) => seleccionada.id === carta.id)
    ) {
      return
    }

    const nuevaSeleccion = [...seleccionadas, carta]
    setSeleccionadas(nuevaSeleccion)

    if (nuevaSeleccion.length === 2) {
      setMovimientos((actual) => actual + 1)
      setBloqueado(true)

      if (nuevaSeleccion[0].nombre === nuevaSeleccion[1].nombre) {
        setCartas((actuales) =>
          actuales.map((item) =>
            item.nombre === nuevaSeleccion[0].nombre
              ? { ...item, encontrada: true }
              : item
          )
        )
        setSeleccionadas([])
        setBloqueado(false)
      } else {
        setTimeout(() => {
          setSeleccionadas([])
          setBloqueado(false)
        }, 900)
      }
    }
  }

  const reiniciar = () => {
    setCartas(crearCartas())
    setSeleccionadas([])
    setMovimientos(0)
    setBloqueado(false)
  }

  const completado = cartas.every((carta) => carta.encontrada)

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
        <p>Nivel 1 de 30 · Movimientos: {movimientos}</p>

        <div className="memoria-tablero">
          {cartas.map((carta) => {
            const visible =
              carta.encontrada ||
              seleccionadas.some(
                (seleccionada) => seleccionada.id === carta.id
              )

            return (
              <button
                type="button"
                key={carta.id}
                className={`memoria-carta ${
                  visible ? 'memoria-carta-visible' : ''
                }`}
                onClick={() => elegirCarta(carta)}
                disabled={carta.encontrada}
                aria-label={visible ? carta.nombre : 'Carta oculta'}
              >
                <span>{visible ? carta.icono : 'G'}</span>
                {visible && <small>{carta.nombre}</small>}
              </button>
            )
          })}
        </div>

        {completado && (
          <div className="memoria-completado">
            <strong>🎉 ¡Nivel completado!</strong>
            <span>Encontraste todas las parejas.</span>
          </div>
        )}

        <button
          type="button"
          className="memoria-reiniciar"
          onClick={reiniciar}
        >
          Reiniciar nivel
        </button>
      </section>
    </div>
  )
}