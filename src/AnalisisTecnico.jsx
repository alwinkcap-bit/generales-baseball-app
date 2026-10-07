import React from 'react'
import iconoGuante from './public/clases/guante-icons.png'
import iconoBate from './public/clases/icono-bate.jpg'
import './AnalisisTecnico.css'

const servicios = [
  {
    id: 'fildeo',
    titulo: 'Mejora tu fildeo',
    imagen: iconoGuante,
    descripcion: 'Muéstranos cómo recibes un rodado y realizas el tiro.',
    indicacion: 'Graba el cuerpo completo durante la recepción y el tiro.',
    mensaje: 'Hola, Alwin. Quiero solicitar el análisis de fildeo por $3. ¿Cómo realizo el pago y envío mi video?'
  },
  {
    id: 'bateo',
    titulo: 'Mejora tu bateo',
    imagen: iconoBate,
    descripcion: 'Trabaja tu postura, equilibrio y contacto con la pelota.',
    indicacion: 'Graba tu swing de lado, con el cuerpo completo visible.',
    mensaje: 'Hola, Alwin. Quiero solicitar el análisis de bateo por $3. ¿Cómo realizo el pago y envío mi video?'
  }
]

export default function AnalisisTecnico() {
  return (
    <section className="analisis-tecnico" aria-label="Análisis personalizado de fildeo y bateo">
      <header className="analisis-tecnico-cabecera">
        <small>ENTRENA CON ALWIN PÉREZ</small>
        <h3>Tu técnica merece atención personalizada.</h3>
        <p>Envía tu video y recibe 3 recomendaciones de Alwin Pérez y un ejercicio para trabajar tu técnica.</p>
      </header>

      
      <div className="analisis-tecnico-pasos" aria-label="Cómo funciona">
        <span><b>1</b> Elige tu análisis</span>
        <span><b>2</b> Envía tu video</span>
        <span><b>3</b> Recibe orientación</span>
      </div>

      <div className="analisis-tecnico-grid">
        {servicios.map(servicio => (
          <article className="analisis-tecnico-tarjeta" key={servicio.id}>
            <div className="analisis-tecnico-superior">
              <img src={servicio.imagen} alt="" loading="lazy" />
              <span className="analisis-tecnico-precio">
                $3 <small>por análisis</small>
              </span>
            </div>
            <h4>{servicio.titulo}</h4>
            <p>{servicio.descripcion}</p>
            <p className="analisis-tecnico-indicacion">{servicio.indicacion}</p>
            <ul className="analisis-tecnico-beneficios">
              <li>3 ajustes personalizados</li>
              <li>1 ejercicio para practicar</li>
              <li>Orientación directa del entrenador</li>
            </ul>
            <a
              href={`https://wa.me/50763776387?text=${encodeURIComponent(servicio.mensaje)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Solicitar análisis de {servicio.id} <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>

      <p className="analisis-tecnico-nota">
        Coordina el pago y el plazo de entrega por WhatsApp.
        Para menores, la solicitud y el envío del video los realiza un adulto responsable.
      </p>
    </section>
  )
}
