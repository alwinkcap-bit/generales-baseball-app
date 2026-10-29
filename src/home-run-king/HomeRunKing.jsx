
import { useState } from 'react'

export default function HomeRunKing() {
  const [lanzamientos, setLanzamientos] = useState(0)
  const [puntos, setPuntos] = useState(0)
  const [mensaje, setMensaje] = useState(
    '¡Prepárate para batear!'
  )

  const terminado = lanzamientos >= 10

  function batear() {
    if (terminado) return

    const contacto = Math.random()
    let resultado = '¡Strike!'
    let ganados = 0

    if (contacto > 0.75) {
      resultado = '¡HOME RUN! ⚾🔥'
      ganados = 300
    } else if (contacto > 0.4) {
      resultado = '¡Hit conectado!'
      ganados = 50
    }

    setLanzamientos(n => n + 1)
    setPuntos(p => p + ganados)
    setMensaje(resultado)
  }

  function reiniciar() {
    setLanzamientos(0)
    setPuntos(0)
    setMensaje('¡Prepárate para batear!')
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#07182c',
      color: 'white',
      textAlign: 'center',
      padding: '30px 15px'
    }}>
      <h1>⚾ HOME RUN KING 3D</h1>
      <h2>CAMPEONATO DE JONRONES</h2>

      <section style={{
        background: '#132e4c',
        padding: 25,
        borderRadius: 18,
        margin: '25px auto',
        maxWidth: 450
      }}>
        <h2>Puntuación: {puntos}</h2>
        <p>Lanzamientos: {lanzamientos} / 10</p>
        <h2>{mensaje}</h2>

        <button
          onClick={batear}
          disabled={terminado}
          style={{
            padding: '18px 40px',
            fontSize: 22,
            background: '#e8b344',
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer'
          }}
        >
          ⚾ BATEAR
        </button>

        {terminado && (
          <div>
            <h2>¡Ronda finalizada!</h2>
            <button onClick={reiniciar}>
              JUGAR OTRA VEZ
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
