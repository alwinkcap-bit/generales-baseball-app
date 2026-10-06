import iconoBate from './public/clases/icono-bate.jpg'
import IlustracionBateo from './IlustracionesBateo'
import React from 'react'

export const preguntasBateoAvanzado = [
  {
    pregunta: '¿Qué describe la cadena cinética del swing?',
    opciones: [
      'La coordinación de piernas, pelvis, tronco y brazos',
      'Usar solamente los brazos',
      'Mantener todo el cuerpo rígido'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Cómo debe practicarse la separación cadera-hombros?',
    opciones: [
      'Forzando al máximo la torsión',
      'Con coordinación y sin forzar el movimiento',
      'Sin mover la pelvis'
    ],
    correcta: 1
  },
  {
    pregunta: '¿Qué diferencia el ángulo de ataque del ángulo de salida?',
    opciones: [
      'Son exactamente lo mismo',
      'Ambos miden la velocidad',
      'Uno describe el movimiento del bate y otro la salida de la pelota'
    ],
    correcta: 2
  },
  {
    pregunta: '¿Qué variables utiliza Statcast para clasificar un barrel?',
    opciones: [
      'Velocidad de salida y ángulo de salida',
      'Edad y estatura',
      'Peso del bate únicamente'
    ],
    correcta: 0
  },
  {
    pregunta: '¿Cuál es el objetivo del ejercicio de swings pausados?',
    opciones: [
      'Buscar máxima velocidad desde el inicio',
      'Observar secuencia, equilibrio y control',
      'Bloquear rígidamente la rodilla delantera'
    ],
    correcta: 1
  }
]

export default function BateoAvanzado() {
  return (
    <>
      <section className="clase-portada clase-portada-bateo">
        <span><img className="clase-icono-material" src={iconoBate} alt="Bate de béisbol" /></span>
        <div>
          <small>CLASE 06 · NIVEL INTERMEDIO–AVANZADO</small>
          <h3>Bateo avanzado y biomecánica moderna</h3>
          <p>Masterclass virtual de 30 minutos.</p>
        </div>
      </section>

      <section className="clase-bloque clase-objetivo">
        <h4>🎯 Objetivo</h4>
        <p>Comprender la secuencia del swing, distinguir las métricas
          de contacto y observar el propio movimiento con control.</p>
      </section>

      <section className="clase-bloque">
        <h4>⏱️ Estructura de la masterclass</h4>
        <div className="clase-cronograma">
          <article><strong>0–5 min</strong><span>Cadena cinética</span></article>
          <article><strong>5–15 min</strong><span>Biomecánica del swing</span></article>
          <article><strong>15–23 min</strong><span>Métricas modernas</span></article>
          <article><strong>23–30 min</strong><span>Visión y práctica</span></article>
        </div>
      </section>

      <section className="clase-bloque">
        <h4>01 · Cadena cinética y postura — 5 minutos</h4>
        <IlustracionBateo tipo="cadena" />
        <p>El swing combina fuerzas del suelo y movimientos coordinados
          de piernas, pelvis, tronco, brazos y bate. La eficiencia
          depende de su secuencia y del momento en que actúan.</p>
        <ol>
          <li>Agarre firme sin tensión excesiva en los antebrazos.</li>
          <li>Postura equilibrada y carga controlada.</li>
          <li>Zancada que permita llegar a una posición estable.</li>
          <li>La pierna delantera ayuda a controlar el avance y apoyar
            la rotación; no debe bloquearse rígidamente.</li>
        </ol>
        <p className="clase-dato">Pregunta inicial: ¿qué cambia en tu
          equilibrio cuando das un paso demasiado largo?</p>
      </section>

      <section className="clase-bloque">
        <h4>02 · Biomecánica del swing — 10 minutos</h4>
        <IlustracionBateo tipo="biomecanica" />
        <p><strong>Separación cadera-hombros:</strong> la pelvis puede
          comenzar a girar antes que el tronco. Observa la coordinación
          sin intentar conseguir una torsión máxima.</p>
        <p><strong>Trayectoria del bate:</strong> busca una ruta que
          facilite el contacto según la ubicación del lanzamiento.
          La trayectoria completa y el ángulo de ataque al contacto
          son conceptos distintos.</p>
        <p><strong>Conexión y ventana de contacto:</strong> analiza la
          relación entre brazos, tronco y bate durante la aceleración.</p>
        <p>Instructor: muestra un swing de frente y de lado, pausa en
          apoyo frontal, inicio de rotación y contacto. Dibuja líneas
          para observar postura y trayectoria.</p>
      </section>

      <section className="clase-bloque">
        <h4>03 · Métricas modernas — 8 minutos</h4>
        <IlustracionBateo tipo="metricas" />
        <ul>
          <li><strong>Exit Velocity:</strong> velocidad de salida de la
            pelota. La distancia también depende del ángulo, efecto
            y condiciones; no existe una ganancia fija por cada mph.</li>
          <li><strong>Attack Angle:</strong> dirección vertical del
            movimiento del bate al contacto. Statcast usa 5°–20°
            como rango ideal de referencia, no como una exigencia
            idéntica para todos los jugadores.</li>
          <li><strong>Launch Angle:</strong> ángulo de salida de la
            pelota: rodados por debajo de 10°, líneas entre 10° y
            25°, elevados entre 25° y 50°, y globos por encima de 50°.</li>
          <li><strong>Barrel:</strong> combinación de velocidad y
            ángulo de salida. A 98 mph, la ventana es 26°–30°;
            aumenta con velocidades superiores.</li>
          <li><strong>Barrel %:</strong> proporción de contactos
            clasificados como barrels sobre las bolas bateadas
            consideradas por la métrica.</li>
        </ul>
        <p>Estas referencias de MLB no son metas de velocidad para niños.
          Compara al jugador con su propio progreso.</p>
        <p>Hawk-Eye y Rapsodo ofrecen mediciones según el sistema y
          modelo disponible. Una cámara común permite observar
          movimiento, pero no sustituye esas mediciones.</p>
        <p className="clase-dato">Reserva los últimos dos minutos del
          bloque para preguntas: ¿puede un contacto rápido terminar
          como rodado? ¿Por qué?</p>
        <p>
          Referencias: <a href="https://www.mlb.com/glossary/statcast/attack-angle"
            target="_blank" rel="noopener noreferrer">Ángulo de ataque</a>
          {' · '}
          <a href="https://www.mlb.com/glossary/statcast/barrel"
            target="_blank" rel="noopener noreferrer">Barrel</a>
          {' · '}
          <a href="https://www.mlb.com/glossary/statcast/launch-angle"
            target="_blank" rel="noopener noreferrer">Ángulo de salida</a>
        </p>
      </section>

      <section className="clase-bloque clase-actividad">
        <h4>04 · Visión, decisión y práctica — 7 minutos</h4>
        <IlustracionBateo tipo="practica" />
        <p>El tiempo disponible depende de la velocidad y distancia
          del lanzamiento. Los 400 ms son una referencia aproximada
          para ciertos lanzamientos rápidos, no un tiempo universal.
          La decisión y el inicio del swing se superponen.</p>
        <p>Observa el punto de salida y practica reconocer ubicación
          y trayectoria con videos pausados.</p>
        <div className="clase-drills">
          <article>
            <span><img className="clase-icono-material" src={iconoBate} alt="Bate de béisbol" /></span>
            <div>
              <strong>Swings pausados con observación</strong>
              <ol>
                <li>Despeja el espacio y usa un implemento liviano.</li>
                <li>Haz cinco repeticiones lentas, con pausas en carga,
                  apoyo frontal y contacto imaginario.</li>
                <li>Observa equilibrio, secuencia y trayectoria.</li>
                <li>Realiza cinco swings fluidos y controlados.</li>
                <li>Explica qué ajuste mejoró tu equilibrio.</li>
              </ol>
            </div>
          </article>
        </div>
        <p>No fuerces la torsión ni mantengas la rodilla rígida.
          Los menores practican acompañados por un adulto.</p>
      </section>
    </>
  )
}
