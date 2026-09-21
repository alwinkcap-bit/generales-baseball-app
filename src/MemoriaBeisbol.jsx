import React, { useState } from 'react'
import './MemoriaBeisbol.css'

const conceptos = [
  { nombre: 'Pelota', icono: '⚾' },
  { nombre: 'Bate', icono: '🏏' },
  { nombre: 'Guante', icono: '🧤' },
  { nombre: 'Gorra', icono: '🧢' },
  { nombre: 'Trofeo', icono: '🏆' },
  { nombre: 'Estadio', icono: '🏟️' },
  { nombre: 'Árbitro', icono: '👨‍⚖️' },
  { nombre: 'Base', icono: '⬜' },
  { nombre: 'Carrera', icono: '🏃' },
  { nombre: 'Equipo', icono: '👥' },
  { nombre: 'Entrenador', icono: '📋' },
  { nombre: 'Uniforme', icono: '👕' },
  { nombre: 'Casco', icono: '⛑️' },
  { nombre: 'Marcador', icono: '🔢' },
  { nombre: 'Banderín', icono: '🚩' },
  { nombre: 'Medalla', icono: '🥇' },
  { nombre: 'Hidratación', icono: '💧' },
  { nombre: 'Fuerza', icono: '💪' },
  { nombre: 'Respeto', icono: '🤝' },
  { nombre: 'Disciplina', icono: '⏱️' },
  { nombre: 'Precisión', icono: '🎯' },
  { nombre: 'Velocidad', icono: '⚡' },
  { nombre: 'Victoria', icono: '⭐' },
  { nombre: 'Defensa', icono: '🛡️' },
  { nombre: 'Ataque', icono: '🔥' },
  { nombre: 'Corredor', icono: '🏃‍♂️' },
  { nombre: 'Afición', icono: '📣' },
  { nombre: 'Calendario', icono: '📅' },
  { nombre: 'Academia', icono: '🏫' },
  { nombre: 'Campeón', icono: '👑' },
]

function obtenerParejas(nivel) {
  const inicio = ((nivel - 1) * 7) % conceptos.length

  return Array.from({ length: 6 }, (_, indice) => {
    return conceptos[(inicio + indice) % conceptos.length]
  })
}

function crearCartas(nivel) {
  const parejas = obtenerParejas(nivel)

  return [...parejas, ...parejas]
    .map((pareja, indice) => ({
      ...pareja,
      id: `${pareja.nombre}-${indice}`,
      encontrada: false,
    }))
    .sort(() => Math.random() - 0.5)
}

export default function MemoriaBeisbol({ onCerrar }) {
  const [nivel, setNivel] = useState(1)
  const [cartas, setCartas] = useState(() => crearCartas(1))
  const [seleccionadas, setSeleccionadas] = useState([])
  const [movimientos, setMovimientos] = useState(0)
  const [bloqueado, setBloqueado] = useState(false)

  const prepararNivel = (nuevoNivel) => {
    setNivel(nuevoNivel)
    setCartas(crearCartas(nuevoNivel))
    setSeleccionadas([])
    setMovimientos(0)
    setBloqueado(false)
  }

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
    prepararNivel(nivel)
  }

  const siguienteNivel = () => {
    if (nivel < 30) {
      prepararNivel(nivel + 1)
    }
  }

  const completado =
    cartas.length > 0 && cartas.every((carta) => carta.encontrada)

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
        <p>
          Nivel {nivel} de 30 · Movimientos: {movimientos}
        </p>

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
            <strong>
              {nivel === 30
                ? '🏆 ¡Completaste los 30 niveles!'
                : '🎉 ¡Nivel completado!'}
            </strong>

            <span>
              {nivel === 30
                ? 'Eres un campeón de la memoria.'
                : 'Encontraste todas las parejas.'}
            </span>

            {nivel < 30 && (
              <button
                type="button"
                className="memoria-siguiente"
                onClick={siguienteNivel}
              >
                Siguiente nivel →
              </button>
            )}
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