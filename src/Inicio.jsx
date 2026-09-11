
import React, { useState } from 'react';
import './inicio.css';
import logoGenerales from './public/logo-generales.png';
import equipoGenerales from './public/equipo-generales.jpg';
import fotoGaleria1 from './public/1000297390.png';
import fotoGaleria2 from './public/1000250736.png';
import fotoGaleria3 from './public/1000350600.png';
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
)}{categoriaActiva === '6' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      Aprenderá fundamentos de bateo, fildeo y lanzamiento, además de mejorar
      su coordinación, recepción y trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '6' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos con ejercicios técnicos de bateo, fildeo, lanzamiento y
      recepción, combinados con juegos que fortalecen la coordinación y el trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '7' && (
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
)}{categoriaActiva === '8' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      Consolidará su técnica de bateo, fildeo y lanzamiento, comprenderá mejor
      las situaciones de juego y se preparará para competir con disciplina,
      estrategia y trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '8' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos enfocados en perfeccionar la técnica ofensiva y defensiva,
      practicar situaciones reales de juego y fortalecer la disciplina,
      estrategia y trabajo en equipo.
    </p>
  </div>
)}
{categoriaActiva === '7' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      Desarrollará mejor su técnica de bateo, fildeo y lanzamiento, aprenderá
      situaciones básicas de juego y mejorará la toma de decisiones en el terreno.
    </p>
  </div>
)}
{categoriaActiva === '7' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos técnicos con ejercicios de bateo, fildeo y lanzamiento,
      combinados con situaciones de juego para desarrollar coordinación,
      reacción y toma de decisiones.
    </p>
  </div>
)}
{categoriaActiva === '4-5' && (
  <div className="programa-extra">
    <strong>¿Qué aprenderá el niño?</strong>
    <p>
      A través de juegos y ejercicios sencillos, aprenderá coordinación,
      control corporal, trabajo en equipo y los primeros fundamentos del béisbol.
    </p>
  </div>
)}
{categoriaActiva === '4-5' && (
  <div className="programa-extra">
    <strong>Metodología de entrenamiento</strong>
    <p>
      Entrenamientos basados en juegos, ejercicios de coordinación y actividades
      sencillas que permiten aprender béisbol de forma divertida y progresiva.
    </p>
  </div>
)}
<p>
  {categoriaActiva === '4-5' && 'Coordinación, juego, motricidad y primeros fundamentos del béisbol.'}
  {categoriaActiva === '6' && 'Fundamentos básicos de bateo, fildeo, lanzamiento y trabajo en equipo.'}
  {categoriaActiva === '7' && 'Desarrollo técnico, coordinación avanzada y situaciones básicas de juego.'}
  {categoriaActiva === '8' && 'Preparación más completa para competir, mejorar técnica y comprender mejor el juego.'}
</p>
</div>
        </section>

        <section id="academia" className="inicio-bienvenida">
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

        <section id="ubicacion" className="inicio-ubicacion">
          <span className="inicio-etiqueta">NUESTRA CASA</span>
          <h2>Estadio Pepe Osorio</h2>
          <p>Calle Abajo de Chitré, Herrera, Panamá.</p>
          <a href="https://www.google.com/maps/search/?api=1&query=Estadio+Pepe+Osorio+Chitre" target="_blank" rel="noreferrer">
            📍 CÓMO LLEGAR
          </a>
        </section>
        <section id="noticias" className="inicio-noticias">
  <span className="inicio-etiqueta">ACTUALIDAD</span>
  <h2>NOTICIAS</h2>
  <p>
    Mantente informado sobre juegos, actividades y novedades de Generales de Chitré.
  </p>
 <div className="noticia-card">
  <span>ACADEMIA</span>
  <h3>Generales de Chitré sigue formando nuevos talentos</h3>
  <p>
    Continuamos trabajando en la formación deportiva, disciplina,
    compañerismo y desarrollo de nuestros niños.
  </p>
</div> 
</section>
        <section id="galeria" className="inicio-galeria">
  <h2>GALERÍA</h2>
  <p>
    Momentos de entrenamientos, juegos y actividades de Generales de Chitré.
  </p>
  <div className="galeria-grid">
  <div className="galeria-item">
  <img src={fotoGaleria1} alt="Generales de Chitré Baseball Academy" />
</div>
  <div className="galeria-item">
  <img src={fotoGaleria2} alt="Beneficios de Generales de Chitré" />
</div>
  <div className="galeria-item">
  <img src={fotoGaleria3} alt="Generales de Chitré Baseball Academy" />
</div>
</div>
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
