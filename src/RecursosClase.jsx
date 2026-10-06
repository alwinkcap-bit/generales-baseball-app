import React from 'react'
import SesionesClasesVivo from './SesionesClasesVivo'
import './RecursosClase.css'

// Agrega aquí el enlace real del video de cada clase.
const videos = {
  1: '',
  2: '',
  3: '',
  4: ''
}

function imprimirDocumento(titulo, lineas) {
  const ventana = window.open('', '_blank')
  if (!ventana) {
    window.alert('Permite las ventanas emergentes para abrir el documento.')
    return
  }

  const documento = ventana.document
  documento.title = titulo
  const estilo = documento.createElement('style')
  estilo.textContent = `
    body{font-family:Arial,sans-serif;color:#081b30;
      max-width:800px;margin:40px auto;padding:24px;line-height:1.6}
    h1{border-bottom:4px solid #dcae35;padding-bottom:15px}
    h2{color:#805c00}
    button{padding:12px 20px;cursor:pointer}
    @media print{button{display:none}body{margin:0}}
  `
  documento.head.appendChild(estilo)

  for (const [etiqueta, texto] of lineas) {
    const elemento = documento.createElement(etiqueta)
    elemento.textContent = texto
    documento.body.appendChild(elemento)
  }

  const boton = documento.createElement('button')
  boton.textContent = 'Imprimir / Guardar como PDF'
  boton.onclick = () => ventana.print()
  documento.body.appendChild(boton)
}

export default function RecursosClase({
  clase, usuario, isAdmin, aprobada
}) {
  function irA(selector) {
    document.querySelector(selector)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  function abrirGuia() {
    const contenido = document.querySelector('.clase-contenido')
    if (!contenido) return

    const bloques = contenido.querySelectorAll(
      '.clase-portada, .clase-bloque'
    )
    const lineas = [
      ['h1', 'Generales de Chitré Baseball Academy'],
      ['h2', clase.titulo],
      ['p', 'Un equipo, una familia, un legado']
    ]

    bloques.forEach((bloque) => {
      bloque.querySelectorAll('h3,h4,p,li,strong,figcaption')
        .forEach((elemento) => {
          const texto = elemento.textContent.trim()
          if (texto) {
            lineas.push([
              elemento.matches('h3,h4') ? 'h2' : 'p',
              texto
            ])
          }
        })
    })

    imprimirDocumento(`Guía — ${clase.titulo}`, lineas)
  }

  function abrirConstancia() {
    if (!aprobada) return

    const sugerido = usuario?.user_metadata?.nombre ||
      usuario?.user_metadata?.full_name || ''
    const nombre = window.prompt(
      'Nombre del participante para la constancia:',
      sugerido
    )?.trim()

    if (!nombre) return

    imprimirDocumento(`Constancia — ${clase.titulo}`, [
      ['h1', 'Generales de Chitré Baseball Academy'],
      ['h2', 'Constancia de finalización'],
      ['p', `Se reconoce a ${nombre}`],
      ['p', `por aprobar la evaluación de la clase: ${clase.titulo}.`],
      ['p', `Fecha de emisión: ${new Date().toLocaleDateString('es-PA')}`],
      ['p', 'Alwin Pérez — Coordinador General'],
      ['p', 'Un equipo, una familia, un legado']
    ])
  }

  return (
    <section className="recursos-clase">
      <h3>📚 Recursos de esta clase</h3>
      <div className="recursos-clase-grid">
        <article>
          <h4>🎥 Video explicativo</h4>
          {videos[clase.id] ? (
            <a href={videos[clase.id]} target="_blank"
              rel="noopener noreferrer">Ver video →</a>
          ) : (
            <p>El video de esta clase estará disponible próximamente.</p>
          )}
        </article>

        <article>
          <h4>📄 Guía de estudio</h4>
          <p>Resumen del contenido y las actividades de esta clase.</p>
          <button type="button" onClick={abrirGuia}>
            Abrir guía / Guardar PDF
          </button>
        </article>

        <article>
          <h4>⚾ Ejercicios prácticos</h4>
          <p>Practica las actividades con el acompañamiento de un adulto.</p>
          <button type="button" onClick={() => irA(
            '.clase-drills, .clase-juego-infantil, .clase-actividad'
          )}>
            Ver ejercicios →
          </button>
        </article>

        <article>
          <h4>📝 Evaluación</h4>
          <p>Responde las cinco preguntas. Apruebas con cuatro aciertos.</p>
          <button type="button"
            onClick={() => irA('.clase-evaluacion')}>
            Ir a la evaluación →
          </button>
        </article>

        <article>
          <h4>📅 Clase en vivo</h4>
          <p>Consulta las sesiones programadas debajo de estos recursos.</p>
          <button type="button"
            onClick={() => irA('.recursos-sesiones')}>
            Ver sesiones →
          </button>
        </article>

        <article>
          <h4>🏅 Constancia</h4>
          <p>{aprobada
            ? 'Tu evaluación está aprobada. Puedes emitir tu constancia.'
            : 'Se habilita al aprobar la evaluación en esta sesión.'}</p>
          <button type="button" disabled={!aprobada}
            onClick={abrirConstancia}>
            Abrir constancia / Guardar PDF
          </button>
        </article>
      </div>

      <div className="recursos-sesiones">
        <SesionesClasesVivo usuario={usuario} isAdmin={isAdmin} />
      </div>
    </section>
  )
}
