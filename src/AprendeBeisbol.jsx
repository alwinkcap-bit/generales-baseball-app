import React from 'react'

const temas = [
  {
    titulo: '⚾ ¿Cómo se juega?',
    texto: 'Dos equipos alternan entre atacar y defender. El equipo que ataca busca anotar carreras; el que defiende intenta conseguir outs.',
    ejemplo: 'Se anota una carrera al recorrer legalmente primera, segunda, tercera y home, según las condiciones de la jugada.'
  },
  {
    titulo: '🧢 Posiciones del terreno',
    texto: 'En el béisbol tradicional hay nueve defensores: lanzador, receptor, primera base, segunda base, tercera base, campocorto y tres jardineros.',
    ejemplo: 'Los jardineros cubren el jardín izquierdo, central y derecho. Algunas categorías infantiles usan una cantidad distinta de defensores.'
  },
  {
    titulo: '🎯 Bolas, strikes y outs',
    texto: 'Una bola es un lanzamiento fuera de la zona de strike al que el bateador no intenta batear. Un strike puede ser un swing fallado o un lanzamiento válido en la zona que no se batea.',
    ejemplo: 'En el béisbol tradicional, cuatro bolas conceden una base por bolas. Tres strikes normalmente terminan el turno; existen excepciones, como el tercer strike no atrapado. Un foul común no suma el tercer strike.'
  },
  {
    titulo: '📅 Entradas y turnos',
    texto: 'Cada entrada tiene una parte alta y una parte baja. El visitante batea en la alta y el local en la baja. Generalmente, tres outs terminan cada mitad.',
    ejemplo: 'La cantidad de entradas y los límites de tiempo o carreras pueden variar según la categoría y el torneo.'
  },
  {
    titulo: '🏃 Situaciones de juego',
    texto: 'Una pelota bateada atrapada de aire antes de tocar el suelo normalmente produce un out. Los corredores deben retocar su base antes de avanzar después de la atrapada.',
    ejemplo: 'Un out forzado ocurre cuando un corredor debe avanzar porque el bateador se convierte en corredor. La defensa puede conseguirlo tocando la base obligada con la pelota antes de su llegada.'
  }
]

export default function AprendeBeisbol({ onReto }) {
  return (
    <dialog
      id="gb-aprende-beisbol"
      aria-labelledby="gb-aprende-titulo"
      style={{
        width: 'min(800px, 94vw)',
        maxWidth: '94vw',
        maxHeight: '90vh',
        padding: 0,
        boxSizing: 'border-box',
        border: '1px solid #f3b83b',
        borderRadius: '18px',
        background: '#081b30',
        color: '#fff'
      }}
    >
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        padding: '20px'
      }}>
        <div>
          <small style={{ color: '#f3b83b' }}>GENERALES BASEBALL</small>
          <h2 id="gb-aprende-titulo" style={{ margin: '8px 0' }}>
            Aprende béisbol
          </h2>
          <p style={{ color: '#c8d8e8', margin: 0 }}>
            Conoce el juego, paso a paso.
          </p>
        </div>
        <form method="dialog">
          <button
            type="submit"
            autoFocus
            aria-label="Cerrar Aprende béisbol"
            style={{
              padding: '10px 14px',
              border: 0,
              borderRadius: '10px',
              background: '#f3b83b',
              color: '#081b30',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Cerrar ×
          </button>
        </form>
      </header>

      <div style={{ padding: '0 20px 20px' }}>
        <p style={{ color: '#c8d8e8', lineHeight: 1.6 }}>
          Guía de iniciación. En modalidades como bim-bim y coach pitch,
          consulta el reglamento de tu torneo: algunas reglas cambian.
        </p>

        {temas.map(tema => (
          <details
            key={tema.titulo}
            style={{
              marginBottom: '12px',
              padding: '16px',
              border: '1px solid #39516b',
              borderRadius: '12px',
              background: '#102b47'
            }}
          >
            <summary style={{
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '17px',
              lineHeight: 1.5
            }}>
              {tema.titulo}
            </summary>
            <p style={{ lineHeight: 1.7 }}>{tema.texto}</p>
            <p style={{
              padding: '12px',
              borderLeft: '3px solid #f3b83b',
              background: '#081b30',
              color: '#dce7f3',
              lineHeight: 1.7
            }}>
              {tema.ejemplo}
            </p>
          </details>
        ))}

        <button
          type="button"
          onClick={() => {
            document.getElementById('gb-aprende-beisbol')?.close()
            onReto()
          }}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '8px',
            border: 0,
            borderRadius: '12px',
            background: '#f3b83b',
            color: '#081b30',
            fontFamily: 'inherit',
            fontSize: '16px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          🏆 Pon a prueba tus conocimientos
        </button>
      </div>
    </dialog>
  )
}
