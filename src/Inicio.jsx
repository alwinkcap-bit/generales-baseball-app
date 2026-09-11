
import React, { useState } from 'react';
import './inicio.css';
import logoGenerales from './public/logo-generales.png';
import equipoGenerales from './public/equipo-generales.jpg';

export default function Inicio() {
  const whatsapp = 'https://wa.me/50763776387';
  const [categoriaActiva, setCategoriaActiva] = useState('4-5');

  return (
  <div id="inicio" className="inicio-app"> 
      <header className="inicio-header">
        <div className="inicio-marca">
          <span>GENERALES DE CHITRÉ</span>
          <strong>BASEBALL ACADEMY</strong>
        </div>
        
      </header>

      <main>
        <section className="inicio-hero">

  <div className="inicio-hero-contenido">
            <span className="inicio-etiqueta">FORMANDO FUTUROS CAMPEONES</span>
            <h1>
              GENERALES DE CHITRÉ<br />
              <span>BASEBALL</span><br />
              ACADEMY
            </h1>
            <p>UN EQUIPO,<br />UNA FAMILIA,<br />UN LEGADO</p>
            <div className="inicio-acciones">
              <a href={whatsapp} target="_blank" rel="noreferrer" className="inicio-boton dorado">
                ⚾ INSCRÍBETE AHORA
              </a>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="inicio-boton contorno">
                ☎ CONTACTAR POR WHATSAPP
              </a>
            </div>
          </div>
          <div className="inicio-hero-imagen">
  <img
    src={equipoGenerales}
    alt="Equipo Generales de Chitré"
    className="inicio-foto-equipo"
  />
  <img
    src={logoGenerales}
    alt="Logo Generales de Chitré"
    className="inicio-logo-portada"
  />
</div>
        </section>

        <section id="programas" className="inicio-valores">
        <h2>PROGRAMAS DE FORMACIÓN</h2> 
          <div><span>🏅</span><strong>DISCIPLINA</strong><small>En el terreno y en la vida</small></div>
          <div><span>⚾</span><strong>FORMACIÓN</strong><small>Desarrollo integral</small></div>
          <div><span>🏃</span><strong>DESARROLLO</strong><small>Talento y aprendizaje</small></div>
          <div><span>🏆</span><strong>VALORES</strong><small>Respeto y compañerismo</small></div>
          <div className="programas-categorias">
  <div
  className={`categoria-card ${categoriaActiva === '4-5' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('4-5')}
>
  <strong>4–5 AÑOS</strong>
  <small>INICIACIÓN</small>
</div>
<div
  className={`categoria-card ${categoriaActiva === '6' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('6')}
>  
  <strong>6 AÑOS</strong>
  <small>FUNDAMENTOS</small>
</div>
<div
  className={`categoria-card ${categoriaActiva === '7' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('7')}
>

  <strong>7 AÑOS</strong>
  <small>DESARROLLO</small>
</div>
  <div
  className={`categoria-card ${categoriaActiva === '8' ? 'categoria-activa' : ''}`}
  onClick={() => setCategoriaActiva('8')}
>
  <strong>8 AÑOS</strong>
  <small>PREPARACIÓN</small>
</div>
</div>
<div className="programa-detalle">
  <h3>
  {categoriaActiva === '4-5' && 'Programa 4–5 años'}
  {categoriaActiva === '6' && 'Programa 6 años'}
  {categoriaActiva === '7' && 'Programa 7 años'}
  {categoriaActiva === '8' && 'Programa 8 años'}
</h3>
{categoriaActiva === '4-5' && (
  <ul className="programa-objetivos">
    <li>Mejorar coordinación y motricidad.</li>
    <li>Aprender los fundamentos básicos del béisbol.</li>
    <li>Desarrollar disciplina y diversión mediante el juego.</li>
  </ul>
)}{categoriaActiva === '6' && (
  <ul className="programa-objetivos">
    <li>Fortalecer los fundamentos de bateo y fildeo.</li>
    <li>Mejorar lanzamiento, recepción y coordinación.</li>
    <li>Aprender posiciones básicas y trabajo en equipo.</li>
  </ul>
)}{categoriaActiva === '7' && (
  <ul className="programa-objetivos">
    <li>Perfeccionar bateo, fildeo y lanzamiento.</li>
    <li>Desarrollar coordinación avanzada y reacción.</li>
    <li>Comprender situaciones básicas de juego y toma de decisiones.</li>
  </ul>
)}{categoriaActiva === '8' && (
  <ul className="programa-objetivos">
    <li>Consolidar la técnica de bateo, fildeo y lanzamiento.</li>
    <li>Mejorar la comprensión de posiciones y situaciones de juego.</li>
    <li>Prepararse para competir aplicando disciplina, estrategia y trabajo en equipo.</li>
  </ul>
)}
<p>
  {categoriaActiva === '4-5' && 'Coordinación, juego, motricidad y primeros fundamentos del béisbol.'}
  {categoriaActiva === '6' && 'Fundamentos básicos de bateo, fildeo, lanzamiento y trabajo en equipo.'}
  {categoriaActiva === '7' && 'Desarrollo técnico, coordinación avanzada y situaciones básicas de juego.'}
  {categoriaActiva === '8' && 'Preparación más completa para competir, mejorar técnica y comprender mejor el juego.'}
</p>
</div>
        </section>

        <section id="galeria" className="inicio-bienvenida">
          <span className="inicio-etiqueta">NUESTRA ACADEMIA</span>
          <h2>Más que béisbol,<br />una familia.</h2>
          <p>
            En Generales de Chitré formamos niños a través del deporte,
            promoviendo la disciplina, el compañerismo y el desarrollo
            de sus habilidades dentro y fuera del terreno.
          </p>
          <div className="inicio-datos">
            <div><strong>⚾</strong><span>Entrenamiento<br />formativo</span></div>
            <div><strong>🤝</strong><span>Trabajo en<br />equipo</span></div>
            <div><strong>⭐</strong><span>Valores para<br />la vida</span></div>
          </div>
        </section>

        <section id="noticias" className="inicio-ubicacion">
          <span className="inicio-etiqueta">NUESTRA CASA</span>
          <h2>Estadio Pepe Osorio</h2>
          <p>Calle Abajo de Chitré, Herrera, Panamá.</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Estadio+Pepe+Osorio+Chitre" target="_blank" rel="noreferrer">
            📍 CÓMO LLEGAR
          </a>
        </section>
        <div id="mas"></div>
      </main>

      <nav className="inicio-nav">
        <a className="activo" href="#inicio"><span>⌂</span>Inicio</a>
        <a href="#programas"><span>⚾</span>Programas</a>
        <a href="#galeria"><span>▧</span>Galería</a>
        <a href="#noticias"><span>▤</span>Noticias</a>
        <a href="#mas"><span>•••</span>Más</a>
      </nav>
    </div>
  );
}
