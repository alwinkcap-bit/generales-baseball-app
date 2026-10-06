import React from 'react'
import './IlustracionesBateo.css'

function Jugador({ fase = 0 }) {
  const brazos = [
    '90,83 116,65 126,42',
    '90,83 120,83 146,68',
    '90,83 119,100 155,100'
  ]
  const bates = [
    [126,42,145,12],
    [146,68,179,40],
    [155,100,192,94]
  ]
  const bate = bates[fase]
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 160H205" stroke="#66849b" strokeWidth="2"/>
      <circle cx="87" cy="40" r="15" fill="#f2c75c"
        stroke="#f2c75c" strokeWidth="2"/>
      <path d="M73 32Q86 18 103 31L112 32"
        stroke="#fff" strokeWidth="5"/>
      <path d="M87 59L91 111" stroke="#fff" strokeWidth="15"/>
      <path d="M91 110L65 134L47 156M91 110L125 129L151 156"
        stroke="#fff" strokeWidth="10"/>
      <polyline points={brazos[fase]} stroke="#f2c75c" strokeWidth="8"/>
      <line x1={bate[0]} y1={bate[1]} x2={bate[2]} y2={bate[3]}
        stroke="#e7a564" strokeWidth="8"/>
      <path d="M39 158H58M143 158H164" stroke="#f2c75c" strokeWidth="5"/>
    </g>
  )
}

export default function IlustracionBateo({ tipo }) {
  const titulos = {
    cadena: 'Cadena cinética: coordinación desde el suelo hasta el bate',
    biomecanica: 'Vista superior esquemática: pelvis y hombros',
    metricas: 'Ángulo de ataque y ángulo de salida',
    practica: 'Tres momentos para observar el swing'
  }

  return (
    <figure className="bateo-ilustracion">
      {tipo === 'cadena' && (
        <svg viewBox="0 0 620 270" role="img"
          aria-label={titulos[tipo]}>
          <g transform="translate(35 45) scale(1.15)">
            <Jugador fase={1}/>
          </g>
          <g className="bateo-svg-texto">
            <text x="305" y="45">SECUENCIA COORDINADA</text>
            {['1 · Apoyo en el suelo', '2 · Piernas y pelvis',
              '3 · Tronco y hombros', '4 · Brazos y bate'].map((texto,i) => (
              <g key={texto}>
                <rect x="295" y={62+i*44} width="295" height="34"
                  rx="9" fill="#193c56" stroke="#58768c"/>
                <text x="309" y={85+i*44}>{texto}</text>
              </g>
            ))}
            <path d="M280 220Q260 130 278 64" fill="none"
              stroke="#f2c75c" strokeWidth="4"/>
            <path d="M266 77L278 64L284 80" fill="none"
              stroke="#f2c75c" strokeWidth="4"/>
          </g>
        </svg>
      )}

      {tipo === 'biomecanica' && (
        <svg viewBox="0 0 620 300" role="img"
          aria-label={titulos[tipo]}>
          <g transform="translate(170 150)" fill="none">
            <ellipse rx="90" ry="65" stroke="#58768c" strokeWidth="2"/>
            <circle r="26" fill="#193c56" stroke="#fff" strokeWidth="2"/>
            <line x1="-87" y1="-20" x2="87" y2="20"
              stroke="#fff" strokeWidth="12" strokeLinecap="round"/>
            <line x1="-64" y1="42" x2="64" y2="-42"
              stroke="#f2c75c" strokeWidth="12" strokeLinecap="round"/>
            <path d="M100 35Q127 0 105 -40" stroke="#f2c75c" strokeWidth="4"/>
            <path d="M103 -22L105 -40L120 -32"
              stroke="#f2c75c" strokeWidth="4"/>
          </g>
          <g className="bateo-svg-texto">
            <text x="50" y="38">VISTA SUPERIOR</text>
            <line x1="325" y1="95" x2="365" y2="95" stroke="#fff" strokeWidth="8"/>
            <text x="380" y="102">Hombros</text>
            <line x1="325" y1="145" x2="365" y2="145" stroke="#f2c75c" strokeWidth="8"/>
            <text x="380" y="152">Pelvis</text>
            <text x="325" y="209">Observa la secuencia.</text>
            <text x="325" y="239">No fuerces la torsión.</text>
            <text x="50" y="280">Las líneas muestran orientaciones distintas, no un ángulo objetivo.</text>
          </g>
        </svg>
      )}

      {tipo === 'metricas' && (
        <svg viewBox="0 0 620 320" role="img"
          aria-label={titulos[tipo]}>
          <g fill="none" strokeLinecap="round">
            <path d="M70 230H560" stroke="#66849b" strokeWidth="2"
              strokeDasharray="6 6"/>
            <path d="M80 255L245 218" stroke="#f2c75c" strokeWidth="8"/>
            <path d="M245 218L278 210L266 224"
              stroke="#f2c75c" strokeWidth="3"/>
            <path d="M245 218Q390 58 545 105"
              stroke="#79d9ff" strokeWidth="4" strokeDasharray="8 6"/>
            <circle cx="245" cy="218" r="9" fill="#fff" stroke="#fff"/>
            <circle cx="440" cy="88" r="9" fill="#fff" stroke="#fff"/>
          </g>
          <g className="bateo-svg-texto">
            <text x="45" y="40">BATE Y PELOTA: DOS MEDICIONES DISTINTAS</text>
            <text x="55" y="190" fill="#f2c75c">Movimiento del bate</text>
            <text x="300" y="70" fill="#79d9ff">Salida de la pelota</text>
            <text x="185" y="263">Contacto</text>
            <text x="45" y="295">EV = velocidad de la pelota después del impacto.</text>
          </g>
        </svg>
      )}

      {tipo === 'practica' && (
        <svg viewBox="0 0 660 245" role="img"
          aria-label={titulos[tipo]}>
          {[0,1,2].map((fase) => (
            <g key={fase} transform={`translate(${fase*220} 25)`}>
              <Jugador fase={fase}/>
              <text x="110" y="200" textAnchor="middle"
                className="bateo-svg-texto">
                {['1 · Carga', '2 · Inicio del giro', '3 · Contacto imaginario'][fase]}
              </text>
            </g>
          ))}
        </svg>
      )}
      <figcaption>
        {titulos[tipo]}. Esquema educativo; no representa mediciones
        ni una postura idéntica para todos los jugadores.
      </figcaption>
    </figure>
  )
}
