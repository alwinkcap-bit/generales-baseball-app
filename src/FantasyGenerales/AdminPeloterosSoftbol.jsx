import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const POSICIONES = ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];

export default function AdminPeloterosVeteranos({ onVolver }) {
  const [jugadores, setJugadores] = useState([]);
  const [nombre, setNombre] = useState('');
  const [posicion, setPosicion] = useState('P');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from('fantasy_veteranos_peloteros')
      .select('id,nombre,posicion,activo')
      .eq('equipo_real', 'Monagrillo')
      .order('nombre');

    if (error) {
      setMensaje('Error al cargar: ' + error.message);
    } else {
      setJugadores(data || []);
    }

    setCargando(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const activos = jugadores.filter(j => j.activo);
  const total = activos.length;

  async function agregarJugador(e) {
    e.preventDefault();

    const limpio = nombre.trim();
    if (!limpio || guardando) return;

    if (total >= 40) {
      setMensaje('El catálogo ya tiene 40 peloteros activos.');
      return;
    }

    if (jugadores.some(j =>
      j.nombre.toLowerCase() === limpio.toLowerCase()
    )) {
      setMensaje('Ya existe un pelotero con ese nombre.');
      return;
    }

    setGuardando(true);

    const { error } = await supabase.rpc(
      'fantasy_veteranos_registrar_pelotero',
      { p_nombre: limpio, p_posicion: posicion }
    );

    if (error) {
      setMensaje('No se pudo registrar: ' + error.message);
    } else {
      setNombre('');
      setMensaje('Pelotero registrado correctamente.');
      await cargar();
    }

    setGuardando(false);
  }

  async function actualizarJugador(jugador, activo = jugador.activo) {
    if (guardando) return;

    let nuevoNombre = jugador.nombre;
    let nuevaPosicion = jugador.posicion;

    if (activo === jugador.activo) {
      const respuestaNombre = window.prompt(
        'Nombre del pelotero:',
        jugador.nombre
      );

      if (respuestaNombre === null) return;

      nuevoNombre = respuestaNombre.trim();

      const respuestaPosicion = window.prompt(
        'Posición: P, C, 1B, 2B, 3B, SS, OF o DH',
        jugador.posicion
      );

      if (respuestaPosicion === null) return;

      nuevaPosicion = respuestaPosicion.trim().toUpperCase();

      if (!nuevoNombre || !POSICIONES.includes(nuevaPosicion)) {
        setMensaje('Nombre o posición no válida.');
        return;
      }
    }

    if (activo && !jugador.activo && total >= 40) {
      setMensaje('No se pueden superar 40 peloteros activos.');
      return;
    }

    setGuardando(true);

    const { error } = await supabase.rpc(
      'fantasy_veteranos_actualizar_pelotero',
      {
        p_id: jugador.id,
        p_nombre: nuevoNombre,
        p_posicion: nuevaPosicion,
        p_activo: activo
      }
    );

    if (error) {
      setMensaje('No se pudo actualizar: ' + error.message);
    } else {
      setMensaje('Registro actualizado correctamente.');
      await cargar();
    }

    setGuardando(false);
  }

  return (
    <section className="fantasy-alineacion">
      <button type="button" className="ghost" onClick={onVolver}>
        ← Volver al panel administrativo
      </button>

      <h3>🥎 PELOTEROS DE MONAGRILLO</h3>
      <p>Catálogo oficial para Fantasy Sóftbol Veteranos 2028.</p>
      <p><strong>{total} / 40 peloteros activos</strong></p>

      <form onSubmit={agregarJugador}>
        <label htmlFor="veteranos-nombre">NOMBRE DEL PELOTERO</label>
        <input
          id="veteranos-nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre y apellido"
          maxLength={80}
          required
          disabled={guardando || total >= 40}
        />

        <label htmlFor="veteranos-posicion">POSICIÓN</label>
        <select
          id="veteranos-posicion"
          value={posicion}
          onChange={e => setPosicion(e.target.value)}
          disabled={guardando || total >= 40}
        >
          {POSICIONES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          className="fantasy-guardar"
          type="submit"
          disabled={guardando || total >= 40}
        >
          {guardando ? 'GUARDANDO...' : '+ REGISTRAR PELOTERO'}
        </button>
      </form>

      {mensaje && <p role="status">{mensaje}</p>}

      <h3>ROSTER DE MONAGRILLO</h3>

      {cargando && <p>Cargando peloteros...</p>}

      {!cargando && jugadores.map(j => (
        <div className="fantasy-posicion" key={j.id}>
          <span className="fantasy-posicion-codigo">
            {j.posicion}
          </span>

          <span className="fantasy-posicion-nombre">
            {j.nombre} {!j.activo && '(Inactivo)'}
          </span>

          <button
            type="button"
            disabled={guardando}
            onClick={() => actualizarJugador(j)}
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            disabled={guardando}
            onClick={() => {
              const accion = j.activo ? 'desactivar' : 'reactivar';
              if (window.confirm(`¿Deseas ${accion} a ${j.nombre}?`)) {
                actualizarJugador(j, !j.activo);
              }
            }}
          >
            {j.activo ? 'Desactivar' : 'Reactivar'}
          </button>
        </div>
      ))}
    </section>
  );
}
