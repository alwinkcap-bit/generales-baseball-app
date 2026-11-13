import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { crearDraft, obtenerTurno, iniciarDraft, seleccionarJugador, REGLAS_DRAFT } from './motorDraft';
import { equiposSoftbol } from './equiposSoftbol';
import { obtenerPosicionRonda } from './rondasSoftbol';

export default function SalaDraft({ campeonato, nombreEquipo, onVolver, isAdmin = false, usuario = null, salaId = null }) {
  const esSalaRealVeteranos =
    campeonato === 'softbol-veteranos' && Boolean(salaId);

  const [equiposReales, setEquiposReales] = useState([]);
  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [errorEquipos, setErrorEquipos] = useState('');

  useEffect(() => {
    if (!esSalaRealVeteranos) return;

    let cancelado = false;

    async function cargarEquipos() {
      setCargandoEquipos(true);
      setErrorEquipos('');

      const { data, error } = await supabase.rpc(
        'fantasy_veteranos_equipos_sala',
        { p_sala_id: salaId }
      );

      if (cancelado) return;

      if (error) {
        setErrorEquipos(error.message);
      } else {
        setEquiposReales(
          (data || []).map(e => ({
            id: e.participante_id,
            nombre: e.nombre_equipo
          }))
        );
      }

      setCargandoEquipos(false);
    }

    cargarEquipos();

    return () => {
      cancelado = true;
    };
  }, [esSalaRealVeteranos, salaId]);

  const [draft, setDraft] = useState(() => {
    const equiposDemo = [
      { id: 'usuario', nombre: nombreEquipo || 'Mi equipo' },
      { id: 'rival1', nombre: 'Los Generales' },
      { id: 'rival2', nombre: 'Los Titanes' },
      { id: 'rival3', nombre: 'Los Campeones' }
    ];

    if (campeonato === 'softbol-veteranos') {
      for (let i = 4; i < 10; i++) {
        equiposDemo.push({
          id: 'rival' + i,
          nombre: 'Equipo Fantasy ' + (i + 1)
        });
      }
    }

    const nuevoDraft = crearDraft(equiposDemo, campeonato);

    if (campeonato !== 'softbol-veteranos') {
      return nuevoDraft;
    }

    try {
      const guardado = JSON.parse(
        localStorage.getItem('fantasy-softbol-draft-2027') || 'null'
      );

      if (
        guardado &&
        guardado.campeonato === campeonato &&
        Array.isArray(guardado.orden) &&
        guardado.orden.length >= 36 &&
        guardado.orden.length <= 180 &&
        guardado.orden.length % 18 === 0 &&
        Array.isArray(guardado.selecciones) &&
        Number.isInteger(guardado.seleccionActual) &&
        guardado.seleccionActual >= 0 &&
        guardado.seleccionActual <= guardado.orden.length &&
        ['preparado', 'activo', 'finalizado'].includes(guardado.estado)
      ) {
        return guardado;
      }
    } catch {
      // Si los datos están dañados, iniciar una prueba nueva.
    }

    return nuevoDraft;
  });

  // Guardar el progreso después de cada selección.
  useEffect(() => {
    if (campeonato !== 'softbol-veteranos') return;

    try {
      localStorage.setItem(
        'fantasy-softbol-draft-2027',
        JSON.stringify(draft)
      );
    } catch (error) {
      console.error('No se pudo guardar el Draft:', error);
    }
  }, [draft, campeonato]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('');
  const [peloteros] = useState(() => {
    if (campeonato !== 'softbol-veteranos') return [];
    try {
      const datos = JSON.parse(
        localStorage.getItem('fantasy-softbol-peloteros-2027') || '[]'
      );
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  });

  const rondaActual = obtenerTurno(draft)?.ronda;
  const posicionObligatoria = campeonato === 'softbol-veteranos'
    ? obtenerPosicionRonda(rondaActual)
    : null;

  const peloterosFiltrados = peloteros.filter(j =>
    !draft.selecciones.some(s =>
      s.jugadorId === j.id &&
      s.equipoId === obtenerTurno(draft)?.equipoId
    ) &&
    (!posicionObligatoria || posicionObligatoria.posicion === 'LIBRE' || j.posicion === posicionObligatoria.posicion) &&
    j.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
    (!filtroEquipo || j.equipoId === filtroEquipo)
  );

  const [segundos, setSegundos] = useState(REGLAS_DRAFT.segundosPorTurno);
  const [relojActivo, setRelojActivo] = useState(false);

  function comenzarDraft() {
    if (draft.estado !== 'preparado') return;
    setDraft(actual => iniciarDraft(actual));
    setSegundos(REGLAS_DRAFT.segundosPorTurno);
    setRelojActivo(true);
  }


  useEffect(() => {
    if (!relojActivo || segundos === 0) return;
    const temporizador = setTimeout(() => {
      setSegundos(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearTimeout(temporizador);
  }, [relojActivo, segundos]);

  // Asignación automática al agotarse los 20 segundos.
  useEffect(() => {
    if (
      campeonato !== 'softbol-veteranos' ||
      draft.estado !== 'activo' ||
      !relojActivo ||
      segundos !== 0
    ) return;

    const temporizador = setTimeout(() => {
      const turnoActual = obtenerTurno(draft);
      if (!turnoActual) return;

      const posicion = obtenerPosicionRonda(turnoActual.ronda);

      const disponibles = peloteros.filter(j =>
        (posicion?.posicion === 'LIBRE' || j.posicion === posicion?.posicion) &&
        !draft.selecciones.some(s =>
      s.jugadorId === j.id &&
      s.equipoId === obtenerTurno(draft)?.equipoId
    )
      );

      if (disponibles.length === 0) {
        setRelojActivo(false);
        setMensajeSeleccion(
          'No hay jugadores disponibles para ' +
          (posicion?.nombre || 'esta posición') +
          '. El Draft está detenido hasta completar el catálogo.'
        );
        return;
      }

      const elegido = disponibles[
        Math.floor(Math.random() * disponibles.length)
      ];

      try {
        const actualizado = seleccionarJugador(
          draft,
          turnoActual.equipoId,
          elegido
        );

        setDraft({
          ...actualizado,
          selecciones: actualizado.selecciones.map(s =>
            s.numero === turnoActual.numero
              ? { ...s, tipo: 'automatica' }
              : s
          )
        });
        setSegundos(REGLAS_DRAFT.segundosPorTurno);
        setRelojActivo(actualizado.estado === 'activo');

        setMensajeSeleccion(
          '🤖 Selección automática: ' +
          elegido.nombre +
          ' para ' +
          turnoActual.equipoNombre
        );
      } catch (error) {
        setRelojActivo(false);
        setMensajeSeleccion(error.message);
      }
    }, 1000);

    return () => clearTimeout(temporizador);
  }, [
    campeonato,
    draft,
    relojActivo,
    segundos,
    peloteros
  ]);

  const [mensajeSeleccion, setMensajeSeleccion] = useState('');

  function elegirPelotero(jugador) {
    try {
      const turnoActual = obtenerTurno(draft);
      if (!turnoActual) {
        throw new Error('No hay un turno disponible.');
      }
      if (campeonato === 'softbol-veteranos') {
        const posicionRequerida = obtenerPosicionRonda(turnoActual.ronda);
        if (!posicionRequerida || (
          posicionRequerida.posicion !== 'LIBRE' &&
          jugador.posicion !== posicionRequerida.posicion
        )) {
          throw new Error('Este pelotero no corresponde a la posición de la ronda.');
        }
      }
      const actualizado = seleccionarJugador(draft, turnoActual.equipoId, jugador);
      setDraft(actualizado);

      // Cada nuevo turno comienza con 20 segundos.
      setSegundos(REGLAS_DRAFT.segundosPorTurno);
      setRelojActivo(actualizado.estado === 'activo');

      setMensajeSeleccion(
        'Seleccionado: ' + jugador.nombre +
        ' para ' + turnoActual.equipoNombre
      );
    } catch (error) {
      setMensajeSeleccion(error.message);
    }
  }

  const [equipoVisible, setEquipoVisible] = useState(null);

  function reiniciarDraftDemo() {
    if (campeonato !== 'softbol-veteranos' || !isAdmin) return;

    const confirmar = window.confirm(
      '¿Iniciar un Draft nuevo? Se borrarán las selecciones de esta prueba, pero se conservarán los peloteros registrados.'
    );

    if (!confirmar) return;

    const equipos = draft.orden
      .filter(t => t.ronda === 1)
      .map(t => ({
        id: t.equipoId,
        nombre: t.equipoNombre
      }));

    if (equipos.length < 2 || equipos.length > 10) {
      setMensajeSeleccion('Se necesitan entre 2 y 10 equipos Fantasy.');
      return;
    }

    setRelojActivo(false);
    setSegundos(REGLAS_DRAFT.segundosPorTurno);
    setBusqueda('');
    setFiltroEquipo('');
    setEquipoVisible(null);
    setMensajeSeleccion('');

    setDraft(crearDraft(equipos, campeonato));
  }

  const turno = obtenerTurno(draft);

  if (esSalaRealVeteranos) {
    return (
      <div style={{
        padding: 24,
        maxWidth: 800,
        margin: '0 auto',
        color: '#ffffff',
        background: '#10233d',
        borderRadius: 16
      }}>
        <button onClick={onVolver}>← VOLVER</button>

        <h2>⚾ FANTASY SÓFTBOL VETERANOS 2028</h2>
        <h3>Equipos inscritos en la sala</h3>

        {cargandoEquipos && <p>Consultando Supabase...</p>}

        {errorEquipos && (
          <p style={{ color: '#ff9999' }}>
            Error: {errorEquipos}
          </p>
        )}

        {!cargandoEquipos && !errorEquipos && (
          <>
            <h2>{equiposReales.length} / 10 equipos</h2>

            {equiposReales.length === 0 && (
              <p>Todavía no hay equipos inscritos.</p>
            )}

            {equiposReales.map((equipo, indice) => (
              <div key={equipo.id} style={{
                padding: 14,
                marginBottom: 10,
                background: '#203b5e',
                borderRadius: 10
              }}>
                ⚾ {indice + 1}. {equipo.nombre}
              </div>
            ))}

            <p>
              {equiposReales.length < 2
                ? 'Se necesitan al menos 2 equipos para iniciar.'
                : 'Sala lista para continuar con la configuración del Draft.'}
            </p>

            <p style={{ color: '#ffcc66' }}>
              El Draft compartido se habilitará después de
              instalar y probar las funciones del servidor.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="fantasy-panel" style={{ margin: '15px auto' }}>
      <button className="fantasy-regresar" onClick={onVolver}>
        ← Volver a mi equipo
      </button>
      <h2>🏆 SALA DE DRAFT</h2>
      {campeonato === 'softbol-veteranos' && isAdmin && (
        <button
          type="button"
          className="fantasy-regresar"
          onClick={reiniciarDraftDemo}
          style={{ marginBottom: 12 }}
        >
          🔄 INICIAR DRAFT NUEVO (PRUEBA)
        </button>
      )}

      <p>{campeonato.toUpperCase()} · {campeonato === 'softbol-veteranos' ? 'Draft rotativo' : 'Draft serpiente'}</p>

      {/* Marcador visual Fantasy 2028 */}
      <div className="fantasy-draft-estadio">
        <img
          src={`${import.meta.env.BASE_URL}fantasy-sala-draft-2028.png`}
          alt="Estadio Fantasy Generales 2028"
          className="fantasy-draft-fondo"
        />

        <div className="fantasy-draft-dato fantasy-draft-ronda">
          {turno?.ronda || 18} DE 18
        </div>

        <div className="fantasy-draft-dato fantasy-draft-seleccion">
          {turno?.numero || draft.orden.length} DE {draft.orden.length}
        </div>

        <div className="fantasy-draft-dato fantasy-draft-tiempo"
             style={{ color: segundos <= 10 ? '#ff6262' : '#ffd65c' }}>
          00:{String(segundos).padStart(2, '0')}
        </div>

        <div className="fantasy-draft-dato fantasy-draft-turno">
          {turno?.equipoNombre || 'Draft finalizado'}
        </div>

        <button
          type="button"
          className="fantasy-draft-zona fantasy-draft-iniciar"
          aria-label={relojActivo ? 'Reiniciar reloj' : 'Iniciar reloj'}
          onClick={() => {
            setSegundos(REGLAS_DRAFT.segundosPorTurno);
            setRelojActivo(true);
          }}
        />

        <button
          type="button"
          className="fantasy-draft-zona fantasy-draft-pausar"
          aria-label="Pausar reloj"
          onClick={() => setRelojActivo(false)}
        />
      </div>

      {campeonato === 'softbol-veteranos' && (
        <div style={{
          background: '#092640',
          padding: 15,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>🥎 BUSCAR PELOTEROS</h3>
          <p style={{ color: '#f2c14e', fontWeight: 'bold', margin: '4px 0 10px', fontSize: 14 }}>
            POSICIÓN OBLIGATORIA: {posicionObligatoria
              ? posicionObligatoria.posicion + ' - ' + posicionObligatoria.nombre
              : 'Draft finalizado'}
          </p>
          <input
            type="search"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            style={{ width: '100%', padding: 8, marginBottom: 7 }}
          />
          <select
            value={filtroEquipo}
            onChange={e => setFiltroEquipo(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 7 }}
          >
            <option value="">Todos los equipos</option>
            {equiposSoftbol.map(e => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>

          <p style={{ margin: "8px 0", fontSize: 13 }}>{peloterosFiltrados.length} peloteros encontrados</p>
          {mensajeSeleccion && <p role="status">{mensajeSeleccion}</p>}

          {peloterosFiltrados.map(j => {
            const equiposSeleccionaron = new Set(
              draft.selecciones
                .filter(s => s.jugadorId === j.id)
                .map(s => s.equipoId)
            ).size;

            const cupoCompleto = equiposSeleccionaron >= 5;
            const yaSeleccionadoPorEquipo = Boolean(
              turno && draft.selecciones.some(s =>
                s.jugadorId === j.id &&
                s.equipoId === turno.equipoId
              )
            );

            return (
            <div key={j.id} className="fantasy-posicion">
              <span className="fantasy-posicion-codigo">{j.posicion}</span>
              <span className="fantasy-posicion-nombre">{j.nombre}</span>
              <span>
                {equiposSoftbol.find(e => e.id === j.equipoId)?.nombre || 'Equipo'}
              </span>
              <span style={{
                color: cupoCompleto ? '#ff7777' : '#f2c14e',
                fontWeight: 'bold',
                fontSize: 12
              }}>
                {equiposSeleccionaron}/5
                {cupoCompleto
                  ? ' · CUPO COMPLETO'
                  : equiposSeleccionaron === 4
                    ? ' · ÚLTIMO CUPO'
                    : ' · DISPONIBLE'}
              </span>
              <button
                type="button"
                disabled={
                  draft.estado !== 'activo' ||
                  !turno ||
                  segundos === 0 ||
                  cupoCompleto ||
                  yaSeleccionadoPorEquipo
                }
                onClick={() => elegirPelotero(j)}
              >
                {cupoCompleto
                  ? 'CUPO COMPLETO'
                  : yaSeleccionadoPorEquipo
                    ? 'YA SELECCIONADO'
                    : 'SELECCIONAR'}
              </button>
            </div>
            );
          })}

          {peloterosFiltrados.length === 0 && (
            <p style={{ margin: "8px 0", fontSize: 13 }}>No hay peloteros que coincidan con la búsqueda.</p>
          )}
          <p className="fantasy-aviso" style={{ margin: "8px 0 0", fontSize: 11 }}>
            Modo demostración: puedes seleccionar por el equipo que esté en turno.
          </p>
        </div>
      )}

      {campeonato === 'softbol-veteranos' && draft.estado === 'preparado' && (
        <button
          type="button"
          className="fantasy-guardar"
          onClick={comenzarDraft}
        >
          ▶ INICIAR DRAFT
        </button>
      )}

      {campeonato === 'softbol-veteranos' && draft.estado === 'activo' && (
        <p className="fantasy-aviso">
          🟢 Draft iniciado. Ya puedes preparar las selecciones.
        </p>
      )}

      {campeonato === 'softbol-veteranos' && (
        <div style={{
          background: '#092640',
          padding: 15,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <h3>📋 HISTORIAL DE SELECCIONES</h3>
          {draft.selecciones.length === 0 ? (
            <p>Aún no se han seleccionado peloteros.</p>
          ) : (
            draft.selecciones.map(s => (
              <div key={s.numero} className="fantasy-posicion">
                <span>Ronda {s.ronda}</span>
                <strong>{s.jugadorNombre}</strong>
                <span>
                  {s.tipo === 'automatica' ? '🤖 Automática' : '👤 Manual'}
                </span>
                <span>
                  {draft.orden.find(t => t.numero === s.numero)?.equipoNombre}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {campeonato === 'softbol-veteranos' && (
        <div style={{
          background: '#092640',
          padding: 15,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <h3>🏆 EQUIPOS FANTASY</h3>
          {draft.orden
            .filter(t => t.ronda === 1)
            .map(equipo => {
              const cantidad = draft.selecciones.filter(
                s => s.equipoId === equipo.equipoId
              ).length;

              return (
                <div key={equipo.equipoId} className="fantasy-posicion"
                  style={{ justifyContent: 'space-between' }}>
                  <span>{equipo.equipoNombre}</span>
                  <strong>{cantidad}/18 jugadores</strong>
                </div>
              );
            })}
        </div>
      )}

      {campeonato === 'softbol-veteranos' && (
        <div style={{
          background: '#092640',
          padding: 15,
          borderRadius: 12,
          marginBottom: 20
        }}>
          <h3>📋 PLANTILLAS DE LOS EQUIPOS</h3>

          <select
            value={equipoVisible || ''}
            onChange={e => setEquipoVisible(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 15
            }}
          >
            <option value="">Seleccionar equipo Fantasy</option>
            {draft.orden
              .filter(t => t.ronda === 1)
              .map(equipo => (
                <option
                  key={equipo.equipoId}
                  value={equipo.equipoId}
                >
                  {equipo.equipoNombre}
                </option>
              ))}
          </select>

          {equipoVisible && (
            <div>
              <p>
                <strong>
                  {draft.selecciones.filter(
                    s => s.equipoId === equipoVisible
                  ).length}/18 jugadores seleccionados
                </strong>
              </p>

              {Array.from({ length: 18 }, (_, i) => {
                const ronda = i + 1;
                const posicion = obtenerPosicionRonda(ronda);
                const elegido = draft.selecciones.find(
                  s => s.equipoId === equipoVisible &&
                       s.ronda === ronda
                );

                return (
                  <div key={ronda} className="fantasy-posicion">
                    <strong>
                      {posicion?.posicion === 'OF'
                        ? 'OF' + (ronda - 6)
                        : posicion?.posicion || '-'}
                    </strong>
                    <span>
                      {elegido?.jugadorNombre || 'Sin seleccionar'}
                    </span>
                    <span>
                      {elegido
                        ? elegido.tipo === 'automatica'
                          ? '🤖 Automática'
                          : '👤 Manual'
                        : '⏳ Pendiente'}
                    </span>
                  </div>
                );
              })}

              {!draft.selecciones.some(
                s => s.equipoId === equipoVisible
              ) && (
                <p>Este equipo todavía no tiene peloteros.</p>
              )}
            </div>
          )}
        </div>
      )}

      <h3>
        {campeonato === 'softbol-veteranos'
          ? '📋 TURNOS DE LA RONDA ' + (turno?.ronda || 18)
          : 'ORDEN DE SELECCIÓN'}
      </h3>
      {(campeonato === 'softbol-veteranos'
        ? draft.orden.filter(
            seleccion => seleccion.ronda === (turno?.ronda || 18)
          )
        : draft.orden.slice(0, 12)
      ).map((seleccion) => (
        <div key={seleccion.numero} className="fantasy-posicion"
          style={{ justifyContent: 'space-between' }}>
          <span>{seleccion.numero}. {seleccion.equipoNombre}</span>
          <span style={{
            color: seleccion.numero <= draft.seleccionActual
              ? '#5de0a0'
              : seleccion.numero === draft.seleccionActual + 1
                ? '#f2c14e'
                : '#a9c3dc'
          }}>
            {seleccion.numero <= draft.seleccionActual
              ? (() => {
                  const elegido = draft.selecciones.find(
                    s => s.numero === seleccion.numero
                  );
                  return elegido
                    ? '✓ ' + elegido.jugadorNombre
                    : '⏭ Sin selección';
                })()
              : seleccion.numero === draft.seleccionActual + 1
                ? 'EN TURNO'
                : 'Pendiente'}
          </span>
        </div>
      ))}

      <p className="fantasy-aviso">
        Modo demostración: próximamente podrás seleccionar peloteros
        reales y competir con otros usuarios.
      </p>
    </section>
  );
}
