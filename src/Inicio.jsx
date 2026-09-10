
import React from 'react';
import './inicio.css';
import logoGenerales from './public/logo-generales.png';
import equipoGenerales from './public/equipo-generales.jpg';

export default function Inicio() {
  const whatsapp = 'https://wa.me/50763776387';

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
  <div className="categoria-card">
  <strong>4–5 AÑOS</strong>
  <small>INICIACIÓN</small>
</div>
  <div className="categoria-card">
  <strong>6 AÑOS</strong>
  <small>FUNDAMENTOS</small>
</div>
  <div className="categoria-card">
  <strong>7 AÑOS</strong>
  <small>DESARROLLO</small>
</div>
  <div className="categoria-card">
  <strong>8 AÑOS</strong>
  <small>PREPARACIÓN</small>
</div>
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
