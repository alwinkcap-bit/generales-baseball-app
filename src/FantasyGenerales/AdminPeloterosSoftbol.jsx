import React, { useState } from 'react';
import { equiposSoftbol } from './equiposSoftbol';

const CLAVE = 'fantasy-softbol-peloteros-2027';

const posiciones = [
  ['P', 'Lanzador'],
  ['C', 'Receptor'],
  ['1B', 'Primera base'],
  ['2B', 'Segunda base'],
  ['3B', 'Tercera base'],
  ['SS', 'Campo corto'],
  ['OF', 'Jardinero'],
  ['DH', 'Bateador designado']
];

export default function AdminPeloterosSoftbol({ onVolver }) {
  const [equipoId, setEquipoId] = useState(equiposSoftbol[0].id);
  const [nombre, setNombre] = useState('');
  const [posicion, setPosicion] = useState('P');
  const [jugadores, setJugadores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE) || '[]');
    } catch {
      return [];
    }
  });
  const [mensaje, setMensaje] = useState('');

  const equipo = equiposSoftbol.find(e => e.id === equipoId);
  const roster = jugadores.filter(j => j.equipoId === equipoId);

  function agregarJugador(e) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return;

    if (jugadores.some(j =>
      j.equipoId === equipoId &&
      j.nombre.toLowerCase() === limpio.toLowerCase()
    )) {
      setMensaje('Este pelotero ya está registrado en el equipo.');
      return;
    }

    const actualizado = [
      ...jugadores,
      {
        id: crypto.randomUUID(),
        nombre: limpio,
        equipoId,
        posicion
      }
    ];

    localStorage.setItem(CLAVE, JSON.stringify(actualizado));
    setJugadores(actualizado);
    setNombre('');
    setMensaje('Pelotero registrado correctamente.');
  }

  function editarJugador(id) {
    const jugador = jugadores.find(j => j.id === id);
    if (!jugador) return;

    const nuevoNombre = window.prompt(
      'Nombre del pelotero:',
      jugador.nombre
    );

    if (nuevoNombre === null) return;
    const limpio = nuevoNombre.trim();

    if (!limpio) {
      setMensaje('El nombre no puede estar vacío.');
      return;
    }

    const repetido = jugadores.some(j =>
      j.id !== id &&
      j.equipoId === jugador.equipoId &&
      j.nombre.toLowerCase() === limpio.toLowerCase()
    );

    if (repetido) {
      setMensaje('Ya existe un pelotero con ese nombre en el equipo.');
      return;
    }

    const nuevaPosicion = window.prompt(
      'Posición: P, C, 1B, 2B, 3B, SS, OF o DH',
      jugador.posicion
    );

    if (nuevaPosicion === null) return;
    const posicionLimpia = nuevaPosicion.trim().toUpperCase();

    if (!posiciones.some(([id]) => id === posicionLimpia)) {
      setMensaje('Posición no válida. No se guardaron cambios.');
      return;
    }

    const actualizado = jugadores.map(j =>
      j.id === id
        ? { ...j, nombre: limpio, posicion: posicionLimpia }
        : j
    );

    localStorage.setItem(CLAVE, JSON.stringify(actualizado));
    setJugadores(actualizado);
    setMensaje('Pelotero actualizado correctamente.');
  }

  function eliminarJugador(id) {
    if (!window.confirm('¿Eliminar este pelotero del registro?')) return;
    const actualizado = jugadores.filter(j => j.id !== id);
    localStorage.setItem(CLAVE, JSON.stringify(actualizado));
    setJugadores(actualizado);
  }

  return (
    <section className="fantasy-alineacion">
      <button
        type="button"
        className="ghost"
        onClick={onVolver}
      >
        ← Volver al panel administrativo
      </button>
      <h3>🥎 ADMINISTRACIÓN DE PELOTEROS</h3>
      <p>Registro de los 10 equipos de Sóftbol Veteranos.</p>

      <label htmlFor="softbol-equipo">EQUIPO</label>
      <select
        id="softbol-equipo"
        value={equipoId}
        onChange={e => {
          setEquipoId(e.target.value);
          setMensaje('');
        }}
        style={{ width: '100%', padding: 12, marginBottom: 15 }}
      >
        {equiposSoftbol.map(e => (
          <option key={e.id} value={e.id}>{e.nombre}</option>
        ))}
      </select>

      <form onSubmit={agregarJugador}>
        <label htmlFor="softbol-nombre">NOMBRE DEL PELOTERO</label>
        <input
          id="softbol-nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre y apellido"
          maxLength={80}
          required
        />

        <label htmlFor="softbol-posicion">POSICIÓN</label>
        <select
          id="softbol-posicion"
          value={posicion}
          onChange={e => setPosicion(e.target.value)}
          style={{ width: '100%', padding: 12, marginBottom: 15 }}
        >
          {posiciones.map(([id, etiqueta]) => (
            <option key={id} value={id}>{etiqueta}</option>
          ))}
        </select>

        <button className="fantasy-guardar" type="submit">
          + REGISTRAR PELOTERO
        </button>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <h3>ROSTER: {equipo?.nombre}</h3>
      <p>{roster.length} peloteros registrados</p>

      {roster.map(j => (
        <div className="fantasy-posicion" key={j.id}>
          <span className="fantasy-posicion-codigo">{j.posicion}</span>
          <span className="fantasy-posicion-nombre">{j.nombre}</span>
          <button
            type="button"
            onClick={() => editarJugador(j.id)}
            aria-label={"Editar a " + j.nombre}
          >
            ✏️ Editar
          </button>
          <button
            type="button"
            onClick={() => eliminarJugador(j.id)}
            aria-label={`Eliminar a ${j.nombre}`}
          >
            ✕
          </button>
        </div>
      ))}
    </section>
  );
}
