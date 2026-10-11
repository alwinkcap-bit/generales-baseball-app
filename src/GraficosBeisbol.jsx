import React from 'react'

const posiciones = [
  [1, 'Lanzador', 180, 177],
  [2, 'Receptor', 180, 267],
  [3, 'Primera base', 286, 183],
  [4, 'Segunda base', 226, 127],
  [5, 'Tercera base', 74, 183],
  [6, 'Campocorto', 134, 127],
  [7, 'Jardinero izquierdo', 65, 70],
  [8, 'Jardinero central', 180, 42],
  [9, 'Jardinero derecho', 295, 70]
]

function Campo() {
  return (
    <>
      <path d="M180 250 L25 149.25 Q180 -65 335 149.25 Z" fill="#236845" />
      <path d="M180 250 L80 185 L180 120 L280 185 Z"
        fill="#b78957" stroke="#ead5ac" strokeWidth="2" />
      <path d="M180 250 L25 149.25 M180 250 L335 149.25"
        stroke="#fff" strokeWidth="2" fill="none" />
      <circle cx="180" cy="177" r="12" fill="#ead5ac" />
      {[[80, 185], [180, 120], [280, 185]].map(([x, y]) => (
        <rect key={x} x={x - 5} y={y - 5} width="10" height="10"
          fill="#fff" transform={`rotate(45 ${x} ${y})`} />
      ))}
      <path d="M174 244 H186 V250 L180 257 L174 250 Z" fill="#fff" />
    </>
  )
}

function Etiqueta({ x, y, children }) {
  return (
    <text x={x} y={y} textAnchor="middle"
      fill="#fff" fontSize="13" fontWeight="700">
      {children}
    </text>
  )
}

const descripciones = [
  'Recorrido de las bases: home, primera, segunda, tercera y home.',
  'Campo de béisbol con las nueve posiciones y sus números de anotación.',
  'Conteo tradicional: cuatro bolas, tres strikes y tres outs.',
  'Entrada dividida en parte alta para el visitante y baja para el local.',
  'Ejemplo de out forzado en primera base y explicación de una atrapada.'
]

export default function GraficosBeisbol({ tema }) {
  return (
    <figure style={{
      margin: '16px 0',
      padding: '12px',
      borderRadius: '12px',
      background: '#061625',
      border: '1px solid #39516b'
    }}>
      <svg viewBox="0 0 360 300" role="img"
        aria-label={descripciones[tema]}
        style={{ display: 'block', width: '100%', maxWidth: '480px', margin: 'auto' }}>
        <title>{descripciones[tema]}</title>
        <defs>
          <marker id={`gb-flecha-${tema}`} markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6" fill="#ffcf69" />
          </marker>
        </defs>

        {tema === 0 && (
          <>
            <Campo />
            <path d="M193 244 L268 193 M273 175 L190 126
              M169 126 L91 175 M89 194 L169 244"
              fill="none" stroke="#ffcf69" strokeWidth="4"
              markerEnd="url(#gb-flecha-0)" />
            <Etiqueta x={305} y={210}>1.ª</Etiqueta>
            <Etiqueta x={180} y={105}>2.ª</Etiqueta>
            <Etiqueta x={55} y={210}>3.ª</Etiqueta>
            <Etiqueta x={180} y={283}>HOME</Etiqueta>
          </>
        )}

        {tema === 1 && (
          <>
            <Campo />
            {posiciones.map(([numero, nombre, x, y]) => (
              <g key={numero}>
                <title>{numero}: {nombre}</title>
                <circle cx={x} cy={y} r="15" fill="#ffcf69"
                  stroke="#081b30" strokeWidth="2" />
                <text x={x} y={y + 5} textAnchor="middle"
                  fill="#081b30" fontSize="16" fontWeight="900">
                  {numero}
                </text>
              </g>
            ))}
          </>
        )}

        {tema === 2 && (
          <>
            <Etiqueta x={180} y={40}>CONTEO TRADICIONAL</Etiqueta>
            {[
              ['BOLAS', 4, 95, '#68d49a'],
              ['STRIKES', 3, 170, '#ffcf69'],
              ['OUTS', 3, 245, '#ff8f8f']
            ].map(([nombre, total, y, color]) => (
              <g key={nombre}>
                <text x="20" y={y - 22} fill="#fff" fontSize="14"
                  fontWeight="700">{nombre}</text>
                {Array.from({ length: total }, (_, i) => (
                  <g key={i}>
                    <circle cx={55 + i * 75} cy={y} r="20" fill={color} />
                    <text x={55 + i * 75} y={y + 5} textAnchor="middle"
                      fill="#081b30" fontSize="16" fontWeight="800">{i + 1}</text>
                  </g>
                ))}
              </g>
            ))}
          </>
        )}

        {tema === 3 && (
          <>
            <Etiqueta x={180} y={35}>UNA ENTRADA</Etiqueta>
            <rect x="20" y="60" width="320" height="85" rx="14" fill="#183c5a" />
            <Etiqueta x={180} y={91}>PARTE ALTA ↑</Etiqueta>
            <Etiqueta x={180} y={119}>Batea el visitante</Etiqueta>
            <rect x="20" y="175" width="320" height="85" rx="14" fill="#236845" />
            <Etiqueta x={180} y={205}>PARTE BAJA ↓</Etiqueta>
            <Etiqueta x={180} y={233}>Batea el local</Etiqueta>
            <text x="180" y="164" textAnchor="middle" fill="#ffcf69"
              fontSize="12">3 outs → cambio de mitad</text>
            <text x="180" y="285" textAnchor="middle" fill="#ffcf69"
              fontSize="12">3 outs → siguiente entrada</text>
          </>
        )}

        {tema === 4 && (
          <>
            <Campo />
            <path d="M195 246 L267 197" fill="none"
              stroke="#ffcf69" strokeWidth="4"
              markerEnd="url(#gb-flecha-4)" />
            <circle cx="203" cy="235" r="7" fill="#ffcf69" />
            <circle cx="276" cy="177" r="12" fill="#7ecbff" />
            <path d="M133 135 L263 173" fill="none"
              stroke="#fff" strokeDasharray="5 5" strokeWidth="3"
              markerEnd="url(#gb-flecha-4)" />
            <circle cx="147" cy="139" r="5" fill="#fff" />
            <Etiqueta x={180} y={35}>OUT FORZADO EN PRIMERA</Etiqueta>
            <Etiqueta x={180} y={284}>La pelota llega antes que el corredor</Etiqueta>
          </>
        )}
      </svg>

      {tema === 1 && (
        <figcaption style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px',
          marginTop: '12px',
          fontSize: '13px',
          lineHeight: 1.5,
          color: '#e0e9f3'
        }}>
          {posiciones.map(([numero, nombre]) => (
            <span key={numero}>
              <b style={{ color: '#ffcf69' }}>{numero}.</b> {nombre}
            </span>
          ))}
          <span style={{ gridColumn: '1 / -1', color: '#bacbde' }}>
            Estos números identifican posiciones en la anotación;
            no son los números del uniforme.
          </span>
        </figcaption>
      )}

      {tema === 2 && (
        <figcaption style={{ color: '#c8d8e8', lineHeight: 1.6 }}>
          4 bolas: base por bolas. 3 strikes: normalmente ponche.
          3 outs: termina la mitad de la entrada.
          Consulta las excepciones en la explicación.
        </figcaption>
      )}

      {tema === 4 && (
        <figcaption style={{ color: '#c8d8e8', lineHeight: 1.6 }}>
          En primera, el defensor debe tener la pelota y tocar la base
          antes de la llegada del bateador-corredor.
          Una atrapada de aire es otra forma de conseguir un out.
        </figcaption>
      )}
    </figure>
  )
}
