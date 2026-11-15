import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function SalaDraftVeteranos({
  salaId,
  onVolver,
  usuario,
  isAdmin = false
}) {
  const [estado, setEstado] = useState(null);
  const [peloteros, setPeloteros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [segundos, setSegundos] = useState(20);
  const [mensaje, setMensaje] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [cargando, setCargando] = useState(true);

  async function actualizar() {
    if (!salaId) return;

    const [respuestaEstado, respuestaPeloteros] = await Promise.all([
      supabase.rpc('fantasy_veteranos_estado_draft', {
        p_sala_id: salaId
      }),
      supabase
        .from('fantasy_veteranos_peloteros')
        .select('id,nombre,posicion,equipo_real,activo')
        .eq('equipo_real', 'Monagrillo')
        .eq('activo', true)
        .order('nombre')
    ]);

    if (respuestaEstado.error) {
      setMensaje(respuestaEstado.error.message);
    } else {
      setEstado(respuestaEstado.data);
    }

    if (respuestaPeloteros.error) {
      setMensaje(respuestaPeloteros.error.message);
    } else {
      setPeloteros(respuestaPeloteros.data || []);
    }

    setCargando(false);
  }

  useEffect(() => {
    actualizar();
    const intervalo = setInterval(actualizar, 3000);
    return () => clearInterval(intervalo);
  }, [salaId]);

  useEffect(() => {
    function actualizarReloj() {
      if (estado?.estado !== 'activo' || !estado.turno_vence_en) {
        setSegundos(20);
        return;
      }

      const restante = Math.ceil(
        (new Date(estado.turno_vence_en).getTime() - Date.now()) / 1000
      );

      setSegundos(Math.max(0, restante));
    }

    actualizarReloj();
    const intervalo = setInterval(actualizarReloj, 250);
    return () => clearInterval(intervalo);
  }, [estado?.estado, estado?.turno_vence_en]);

  async function iniciar() {
    if (procesando || (estado?.equipos?.length || 0) !== 10) return;

    setProcesando(true);
    setMensaje('');

    const { error } = await supabase.rpc(
      'fantasy_veteranos_iniciar_draft',
      { p_sala_id: salaId }
    );

    setProcesando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje('Draft iniciado correctamente.');
    await actualizar();
  }

  async function seleccionar(jugador) {
    if (procesando || estado?.estado !== 'activo') return;

    setProcesando(true);
    setMensaje('');

    const { error } = await supabase.rpc(
      'fantasy_veteranos_seleccionar',
      {
        p_draft_id: estado.draft_id,
        p_jugador_id: jugador.id
      }
    );

    setProcesando(false);

    if (error) {
      setMensaje(error.message);
      await actualizar();
      return;
    }

    setMensaje('Seleccionado: ' + jugador.nombre);
    await actualizar();
  }

  const equipos = estado?.equipos || [];
  const turno = estado?.turno;
  const selecciones = estado?.selecciones || [];

  const equipoActual = equipos.find(
    e => e.id === turno?.participante_id
  );

  const cupos = {};
  for (const seleccion of selecciones) {
    if (!cupos[seleccion.jugador_id]) {
      cupos[seleccion.jugador_id] = new Set();
    }
    cupos[seleccion.jugador_id].add(seleccion.participante_id);
  }

  const disponibles = peloteros.filter(j => {
    const equiposQueLoTienen = cupos[j.id] || new Set();

    return j.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (turno?.posicion_requerida === 'LIBRE' ||
       !turno ||
       j.posicion === turno.posicion_requerida) &&
      equiposQueLoTienen.size < 5 &&
      !equiposQueLoTienen.has(turno?.participante_id);
  });

  return (
    <div style={{
      padding: 24,
      maxWidth: 900,
      margin: '0 auto',
      color: '#fff',
      background: '#10233d',
      borderRadius: 16
    }}>
      <button onClick={onVolver}>← VOLVER</button>

      <h2>🥎 FANTASY SÓFTBOL VETERANOS 2028</h2>

      {mensaje && <p role="status" style={{ color: '#ffd65c' }}>{mensaje}</p>}
      {cargando && <p>Conectando con Supabase...</p>}

      <h3>Equipos inscritos: {equipos.length}/10</h3>

      {equipos.map((equipo, indice) => (
        <p key={equipo.id}>
          {indice + 1}. {equipo.nombre}
        </p>
      ))}

      <h3>Peloteros de Monagrillo: {peloteros.length}/40</h3>

      {estado?.estado === 'sin_iniciar' && (
        <>
          <p>
            {equipos.length === 10
              ? 'Los 10 equipos están inscritos.'
              : 'Se necesitan exactamente 10 equipos para comenzar.'}
          </p>

          {isAdmin && (
            <button
              onClick={iniciar}
              disabled={procesando || equipos.length !== 10}
            >
              ▶ INICIAR DRAFT
            </button>
          )}
        </>
      )}

      {estado?.estado === 'activo' && (
        <>
          <h2>RONDA {turno?.ronda || 18} DE 18</h2>
          <h3>
            SELECCIÓN {(estado.seleccion_actual || 0) + 1} DE 180
          </h3>

          <h2 style={{
            color: segundos <= 10 ? '#ff6262' : '#ffd65c'
          }}>
            00:{String(segundos).padStart(2, '0')}
          </h2>

          <h3>Turno: {equipoActual?.nombre || 'Equipo Fantasy'}</h3>
          <p>Posición: {turno?.posicion_requerida}</p>

          <input
            type="search"
            placeholder="Buscar pelotero..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ padding: 10, width: '100%', marginBottom: 12 }}
          />

          {disponibles.map(j => (
            <div key={j.id} style={{
              padding: 12,
              background: '#203b5e',
              marginBottom: 8,
              borderRadius: 8
            }}>
              <strong>{j.nombre}</strong> — {j.posicion}

              <span style={{ marginLeft: 12 }}>
                {cupos[j.id]?.size || 0}/5
              </span>

              <button
                style={{ marginLeft: 12 }}
                disabled={procesando || segundos === 0}
                onClick={() => seleccionar(j)}
              >
                SELECCIONAR
              </button>
            </div>
          ))}

          {disponibles.length === 0 && (
            <p>No hay peloteros disponibles para esta posición.</p>
          )}
        </>
      )}

      {estado?.estado === 'finalizado' && (
        <h2>🏆 DRAFT FINALIZADO — 180 SELECCIONES</h2>
      )}
    </div>
  );
}
