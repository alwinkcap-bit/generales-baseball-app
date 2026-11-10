import { situacionesManager } from './situacionesManager';
import './ManagerVirtual.css';
import React from 'react'
import { useEffect, useState } from 'react';
import {
  situacionInicial,
  decisionesManager,
  evaluarDecision
} from './motorManager';

export default function ManagerVirtual({ onCerrar }) {
  const [indiceJugada, setIndiceJugada] = useState(0);
  const situacion = situacionesManager[indiceJugada];
  const [tiempo, setTiempo] = useState(20);
  const [decision, setDecision] = useState('');
  const [resultado, setResultado] = useState(null);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    if (cerrado) return;

    const intervalo = setInterval(() => {
      setTiempo((anterior) => {
        if (anterior <= 1) {
          clearInterval(intervalo);
          setCerrado(true);
          return 0;
        }
        return anterior - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [cerrado]);

  function nuevaJugada() {
    setIndiceJugada((anterior) => (anterior + 1) % situacionesManager.length);
    setTiempo(20);
    setDecision('');
    setResultado(null);
    setCerrado(false);
  }

  function confirmarDecision() {
    if (!decision || cerrado) return;

    const evaluacion = evaluarDecision(
      decision,
      situacion
    );

    setResultado(evaluacion);
    setCerrado(true);
  }

  return (
    <main className="manager-virtual" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      overflowY: 'auto',
      background: '#071a30',
      color: '#ffffff',
      padding: '24px max(16px, calc((100vw - 650px) / 2))',
      boxSizing: 'border-box',
      fontFamily: 'Arial, sans-serif'
    }}>
      <button type="button" onClick={onCerrar}>← Volver a los juegos</button>
      <h1>⚾ MÁNAGER VIRTUAL GENERALES</h1>
      <h2>Panamá 2027 · Nivel experto</h2>

      <section className="manager-marcador">
        <div className="manager-marcador-equipos">
          <div className="manager-marcador-equipo">
            {situacion.equipoDefensivo}
            <span className="manager-marcador-carreras">{situacion.carrerasDefensivo}</span>
          </div>
          <strong>–</strong>
          <div className="manager-marcador-equipo">
            {situacion.equipoOfensivo}
            <span className="manager-marcador-carreras">{situacion.carrerasOfensivo}</span>
          </div>
        </div>
        <div className="manager-marcador-datos">
          <span>{situacion.mitad === 'alta' ? '▲' : '▼'} {situacion.episodio}°</span>
          <span>{situacion.outs} OUT</span>
          <span>B {situacion.cuenta.bolas} · S {situacion.cuenta.strikes}</span>
          <span>⏱ {tiempo}s</span>
        </div>
      </section>

      <div className="manager-explicacion-jugada">
        <strong>📋 SITUACIÓN:</strong> {situacion.explicacion}
      </div>
      <div className="manager-terreno" aria-label="Terreno de béisbol con corredores en primera y tercera base">
        <div className="manager-diamante" />
  <svg className="manager-lineas-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="M 50 97 L 28 58 L 0 10 M 50 97 L 72 58 L 100 10" fill="none" stroke="white" strokeWidth="0.45" vectorEffect="non-scaling-stroke" />
  </svg>
  
        {[
          { n: 'P', x: 50, y: 58 },
          { n: 'C', x: 50, y: 91 },
          { n: '1B', x: 66, y: 64, cuadro: true },
          { n: '2B', x: 61, y: 44, cuadro: true },
          { n: 'SS', x: 39, y: 44, cuadro: true },
          { n: '3B', x: 34, y: 64, cuadro: true },
          { n: 'LF', x: 22, y: 19 },
          { n: 'CF', x: 50, y: 9 },
          { n: 'RF', x: 78, y: 19 }
        ].map((jugador) => {
          const adelantado = decision === 'cuadro_adentro' && jugador.cuadro;
          return (
            <span
              key={jugador.n}
              className={`manager-jugador ${adelantado ? 'activo' : ''}`}
              style={{
                left: `${jugador.x}%`,
                top: `${adelantado ? jugador.y + 10 : jugador.y}%`
              }}
              title={jugador.n}
            >
              {jugador.n}
            </span>
          );
        })}
        {decision && (
          <div className="manager-estrategia-visual" role="status">
            {{
              ponche: '🎯 BUSCAR PONCHE',
              cuadro_adentro: '🧤 CUADRO ADENTRO',
              doble_play: '⚾ BUSCAR DOBLE PLAY',
              cambio_lanzador: '🔄 CAMBIO DE PITCHER'
            }[decision]}
          </div>
        )}
        <span className="manager-base" style={{ left: '50%', top: '86%' }} title="Home" />
        <span className={`manager-base ${situacion.corredores.primera ? 'ocupada' : ''}`} style={{ left: '72%', top: '58%' }} title="Primera base" />
        <span className={`manager-base ${situacion.corredores.segunda ? 'ocupada' : ''}`} style={{ left: '50%', top: '29%' }} title="Segunda base" />
        <span className={`manager-base ${situacion.corredores.tercera ? 'ocupada' : ''}`} style={{ left: '28%', top: '58%' }} title="Tercera base" />
      </div>

      <h3>¿Qué decisión tomarías como mánager?</h3>

      <div className="manager-opciones">
        {decisionesManager.map((opcion) => {
          const visuales = {
            ponche: ['🎯', 'Buscar ponche', 'Dos strikes'],
            cuadro_adentro: ['🧤', 'Cuadro adentro', 'Defender home'],
            doble_play: ['⚾', 'Doble play', 'Eliminar dos corredores'],
            cambio_lanzador: ['🔄', 'Cambiar pitcher', 'Nuevo lanzador']
          };
          const [icono, titulo, descripcion] =
            visuales[opcion.id] || ['⚾', opcion.texto, ''];

          return (
            <button
              key={opcion.id}
              type="button"
              className={`manager-opcion ${decision === opcion.id ? 'seleccionada' : ''}`}
              disabled={cerrado}
              onClick={() => setDecision(opcion.id)}
              aria-pressed={decision === opcion.id}
            >
              <span className="manager-tarjeta-icono">{icono}</span>
              <span className="manager-tarjeta-titulo">{titulo}</span>
              <span className="manager-tarjeta-descripcion">{descripcion}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={confirmarDecision}
        disabled={!decision || cerrado}
        style={{
          padding: '12px 20px',
          background: '#d4a017',
          color: '#111',
          border: 'none',
          borderRadius: 8,
          fontWeight: 'bold'
        }}
      >
        CONFIRMAR DECISIÓN
      </button>

      {resultado && (
        <section>
          <h2>🏆 +{resultado.puntos} puntos</h2>
          <p>{resultado.mensaje}</p>
        </section>
      )}

      {cerrado && (
        <button
          type="button"
          onClick={nuevaJugada}
          style={{
            marginTop: 16,
            padding: 12,
            background: '#e8b64a',
            color: '#071a30',
            borderRadius: 10,
            fontWeight: 'bold'
          }}
        >
          🔄 NUEVA JUGADA
        </button>
      )}

      {cerrado && !resultado && (
        <p>⏰ Tiempo agotado. No se registró una decisión.</p>
      )}
    </main>
  );
}
