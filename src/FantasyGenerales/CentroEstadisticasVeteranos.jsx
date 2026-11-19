import './CentroEstadisticasVeteranos.css';
import React, { useState } from 'react';
import { calcularPuntosVeteranos } from './motorPuntuacionVeteranos';
import {
  leerPeloterosVeteranos,
  guardarPeloterosVeteranos,
  calcularPuntosEquiposVeteranos,
  CLAVES_VETERANOS
} from './datosVeteranos2028';

const CLAVE = 'fantasy-veteranos-2028-estadisticas-local';

const CAMPOS = [
  ['sencillo', 'Sencillos'],
  ['doble', 'Dobles'],
  ['triple', 'Triples'],
  ['jonron', 'Jonrones'],
  ['carreraAnotada', 'Carreras anotadas'],
  ['carreraImpulsada', 'Carreras impulsadas'],
  ['basePorBolas', 'Bases por bolas'],
  ['baseRobada', 'Bases robadas'],
  ['poncheRecibido', 'Ponches recibidos'],
  ['poncheLanzador', 'Ponches realizados']
];

const vacio = () => Object.fromEntries(
  CAMPOS.map(([campo]) => [campo, 0])
);

function cargarRegistros() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export default function CentroEstadisticasVeteranos({ onVolver }) {
  const [registros, setRegistros] = useState(cargarRegistros);
  const [draftLocal] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(CLAVES_VETERANOS.draft) || 'null'
      );
    } catch {
      return null;
    }
  });

  const puntosCalculados = calcularPuntosEquiposVeteranos(
    registros,
    Array.isArray(draftLocal?.selecciones)
      ? draftLocal.selecciones
      : []
  );

  const nombresEquipos = new Map(
    (draftLocal?.orden || []).map(turno => [
      String(turno.equipoId),
      turno.equipoNombre
    ])
  );

  const puntosPorEquipo = new Map(
    puntosCalculados.map(equipo => [
      String(equipo.equipoId),
      equipo.puntos
    ])
  );

  const clasificacion = [...nombresEquipos.keys()]
    .map(equipoId => ({
      equipoId,
      puntos: puntosPorEquipo.get(equipoId) || 0
    }))
    .sort((a, b) =>
      b.puntos - a.puntos ||
      String(nombresEquipos.get(a.equipoId)).localeCompare(
        String(nombresEquipos.get(b.equipoId)),
        'es'
      )
    );
  const [fecha, setFecha] = useState('');
  const [rival, setRival] = useState('');
  const [jugador, setJugador] = useState('');
  const [peloteros, setPeloteros] = useState(leerPeloterosVeteranos);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaPosicion, setNuevaPosicion] = useState('P');
  const [estadisticas, setEstadisticas] = useState(vacio);
  const [entradas, setEntradas] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [registroEditando, setRegistroEditando] = useState(null);
  const [peloteroEditando, setPeloteroEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [posicionEditada, setPosicionEditada] = useState('P');
  const [buscarRoster, setBuscarRoster] = useState('');


  function cambiarCampo(campo, valor) {
    setEstadisticas(actual => ({
      ...actual,
      [campo]: valor === '' ? 0 : Number(valor)
    }));
  }

  function registrarPelotero() {
    try {
      const nombre = nuevoNombre.trim();

      if (!nombre) {
        throw new Error('Escribe el nombre del pelotero.');
      }

      if (peloteros.some(p =>
        p.nombre.toLowerCase() === nombre.toLowerCase()
      )) {
        throw new Error('Este pelotero ya está registrado.');
      }

      const nuevo = {
        id: crypto.randomUUID(),
        nombre,
        posicion: nuevaPosicion,
        equipoId: 'monagrillo',
        activo: true
      };

      const actualizados = [...peloteros, nuevo];
      guardarPeloterosVeteranos(actualizados);
      setPeloteros(actualizados);
      setNuevoNombre('');
      setMensaje('✓ Pelotero registrado: ' + nombre);
    } catch (error) {
      setMensaje('Error: ' + error.message);
    }
  }

  function iniciarEdicionPelotero(p) {
    setPeloteroEditando(p.id);
    setNombreEditado(p.nombre);
    setPosicionEditada(p.posicion);
    setMensaje('Editando pelotero: ' + p.nombre);
  }

  function cancelarEdicionPelotero() {
    setPeloteroEditando(null);
    setNombreEditado('');
    setMensaje('Edición de pelotero cancelada.');
  }

  function guardarEdicionPelotero() {
    try {
      const nombre = nombreEditado.trim();

      if (!nombre) {
        throw new Error('El nombre no puede estar vacío.');
      }

      if (peloteros.some(p =>
        p.id !== peloteroEditando &&
        p.nombre.trim().toLowerCase() === nombre.toLowerCase()
      )) {
        throw new Error('Ya existe otro pelotero con ese nombre.');
      }

      const actualizados = peloteros.map(p =>
        p.id === peloteroEditando
          ? { ...p, nombre, posicion: posicionEditada }
          : p
      );

      guardarPeloterosVeteranos(actualizados);
      setPeloteros(actualizados);

      setRegistros(actuales => {
        const nuevos = actuales.map(r =>
          String(r.jugadorId) === String(peloteroEditando)
            ? { ...r, jugador: nombre }
            : r
        );
        localStorage.setItem(CLAVE, JSON.stringify(nuevos));
        return nuevos;
      });

      setPeloteroEditando(null);
      setMensaje('✓ Datos del pelotero actualizados: ' + nombre);
    } catch (error) {
      setMensaje('Error: ' + error.message);
    }
  }

  function editarRegistro(registro) {
    setRegistroEditando(registro.id);
    setFecha(registro.fecha);
    setRival(registro.rival);
    setJugador(String(registro.jugadorId));
    setEstadisticas({
      ...vacio(),
      ...registro.estadisticas
    });
    setEntradas(
      (registro.estadisticas?.entradasLanzadas || []).join(',')
    );
    setMensaje('Editando estadísticas de ' + registro.jugador);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelarEdicion() {
    setRegistroEditando(null);
    setJugador('');
    setEstadisticas(vacio());
    setEntradas('');
    setMensaje('Edición cancelada.');
  }

  function guardar() {
    try {
      if (!fecha || !rival.trim() || !jugador) {
        throw new Error('Completa fecha, rival y pelotero.');
      }

      const pelotero = peloteros.find(
        p => String(p.id) === String(jugador)
      );

      if (!pelotero) {
        throw new Error('Selecciona un pelotero registrado.');
      }

      // Evitar registrar dos veces al mismo pelotero
      // en un partido de la misma fecha y contra el mismo rival.
      const normalizarRival = texto =>
        String(texto || '')
          .trim()
          .replace(/\\s+/g, ' ')
          .toLocaleLowerCase('es');

      const duplicado = registros.some(registro =>
        registro.id !== registroEditando &&
        registro.fecha === fecha &&
        String(registro.jugadorId) === String(pelotero.id) &&
        normalizarRival(registro.rival) === normalizarRival(rival)
      );

      if (duplicado) {
        throw new Error(
          'Este pelotero ya tiene estadísticas registradas ' +
          'para ese partido. No se duplicaron los puntos.'
        );
      }

      const entradasLanzadas = entradas.trim()
        ? entradas.split(',').map(valor => {
            const limpio = valor.trim();
            if (!/^\d+$/.test(limpio)) {
              throw new Error(
                'Escribe las carreras por entrada separadas por comas. Ejemplo: 0,2,3,4'
              );
            }
            return Number(limpio);
          })
        : [];

      const datos = { ...estadisticas, entradasLanzadas };
      const resultado = calcularPuntosVeteranos(datos);

      const nuevo = {
        id: registroEditando || crypto.randomUUID(),
        fecha,
        equipo: 'Monagrillo',
        rival: rival.trim(),
        jugadorId: pelotero.id,
        jugador: pelotero.nombre,
        estadisticas: datos,
        puntos: resultado.total
      };

      const actualizados = registroEditando
        ? registros.map(registro =>
            registro.id === registroEditando ? nuevo : registro
          )
        : [nuevo, ...registros];

      localStorage.setItem(CLAVE, JSON.stringify(actualizados));
      setRegistros(actualizados);
      setRegistroEditando(null);
      setJugador('');
      setEstadisticas(vacio());
      setEntradas('');
      setMensaje(
        `✓ Estadísticas guardadas: ${resultado.total} puntos`
      );
    } catch (error) {
      setMensaje(`Error: ${error.message}`);
    }
  }

  return (
    <section className="veteranos-estadisticas" style={{
      maxWidth: 900,
      margin: '20px auto',
      padding: 20,
      color: '#fff',
      background: '#10233d',
      borderRadius: 16
    }}>
      {onVolver && (
        <button onClick={onVolver}>← VOLVER</button>
      )}

      <h2>⚾ Centro de Estadísticas</h2>
      <h3>Fantasy Sóftbol Veteranos 2028</h3>
      <p>Registro local de partidos de Monagrillo.</p>

      <div style={{ display: 'grid', gap: 12 }}>
        <label>
          Fecha del partido
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
          />
        </label>

        <label>
          Rival
          <input
            value={rival}
            onChange={e => setRival(e.target.value)}
            placeholder="Nombre del equipo rival"
          />
        </label>

        <label>
          Pelotero de Monagrillo
          <select
            value={jugador}
            onChange={e => setJugador(e.target.value)}
            style={{ width: '100%', padding: 10 }}
          >
            <option value="">Selecciona un pelotero</option>
            {peloteros.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>

        {peloteros.length === 0 && (
          <p style={{ color: '#ffcc66' }}>
            No hay peloteros en el catálogo local de Veteranos 2028.
            Primero debemos registrar o importar los jugadores de Monagrillo.
          </p>
        )}

        <details style={{
          padding: 14,
          background: '#203b5e',
          borderRadius: 10
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ Registrar pelotero de Monagrillo
          </summary>

          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <input
              placeholder="Nombre completo"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
            />

            <select
              value={nuevaPosicion}
              onChange={e => setNuevaPosicion(e.target.value)}
            >
              {['P','C','1B','2B','3B','SS','OF','UT','DH'].map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>

            <button type="button" onClick={registrarPelotero}>
              GUARDAR PELOTERO
            </button>
          </div>
        </details>

        {/* ROSTER OFICIAL DE MONAGRILLO 2028 */}
        <div className="veteranos-roster-admin">
          <h3>⚾ ROSTER OFICIAL DE MONAGRILLO 2028</h3>
          <p>Total de peloteros registrados: {peloteros.length}</p>

          <input
            type="search"
            placeholder="Buscar pelotero por nombre"
            value={buscarRoster}
            onChange={e => setBuscarRoster(e.target.value)}
            style={{ width: '100%', marginBottom: 14 }}
          />

          {peloteros
            .filter(p => p.nombre.toLowerCase().includes(
              buscarRoster.toLowerCase()
            ))
            .sort((a, b) => {
              const orden = ['P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'];

              const posicionA = orden.indexOf(a.posicion);
              const posicionB = orden.indexOf(b.posicion);

              const indiceA = posicionA === -1 ? 999 : posicionA;
              const indiceB = posicionB === -1 ? 999 : posicionB;

              return indiceA - indiceB ||
                a.nombre.localeCompare(b.nombre, 'es');
            })
            .map(p => (
              <div key={p.id} className="veteranos-roster-fila">
                {peloteroEditando === p.id ? (
                  <div className="veteranos-roster-edicion">
                    <input
                      value={nombreEditado}
                      onChange={e => setNombreEditado(e.target.value)}
                      aria-label="Nombre del pelotero"
                    />

                    <select
                      value={posicionEditada}
                      onChange={e => setPosicionEditada(e.target.value)}
                    >
                      {['P','C','1B','2B','3B','SS','OF','UT','DH'].map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>

                    <button type="button" onClick={guardarEdicionPelotero}>
                      GUARDAR CAMBIOS
                    </button>

                    <button type="button" onClick={cancelarEdicionPelotero}>
                      CANCELAR
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <strong>{p.nombre}</strong>
                      <span> · {p.posicion}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => iniciarEdicionPelotero(p)}
                    >
                      ✏️ EDITAR
                    </button>
                  </>
                )}
              </div>
            ))}
        </div>

        <h3>Estadísticas del pelotero</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}>
          {CAMPOS.map(([campo, etiqueta]) => (
            <label key={campo}>
              {etiqueta}
              <input
                type="number"
                min="0"
                step="1"
                value={estadisticas[campo]}
                onChange={e => cambiarCampo(campo, e.target.value)}
                style={{ width: '100%' }}
              />
            </label>
          ))}
        </div>

        <label>
          Carreras permitidas por entrada lanzada
          <input
            value={entradas}
            onChange={e => setEntradas(e.target.value)}
            placeholder="Ejemplo: 0,2,3,4"
          />
        </label>

        <p>
          Lanzadores: 0–2 carreras = +1;
          3 carreras = 0;
          4 o más = -3 por entrada.
        </p>

        <button onClick={guardar}>
          {registroEditando
            ? '💾 GUARDAR CORRECCIONES'
            : '💾 GUARDAR ESTADÍSTICAS'}
        </button>

        {registroEditando && (
          <button
            type="button"
            onClick={cancelarEdicion}
            style={{ marginLeft: 10 }}
          >
            CANCELAR EDICIÓN
          </button>
        )}

        {mensaje && <p role="status">{mensaje}</p>}
      </div>

      <hr />

      <h3>🏆 Clasificación Fantasy Veteranos 2028</h3>

      {!draftLocal && (
        <p>
          Todavía no existe un Draft local.
          La clasificación aparecerá cuando se registren selecciones.
        </p>
      )}

      {draftLocal && (
        <div className="veteranos-ranking">
          <div className="veteranos-ranking-encabezado">
            <div>
              <span>FANTASY GENERALES</span>
              <h4>🏆 TABLA GENERAL 2028</h4>
              <p>Sóftbol Veteranos · Clasificación oficial</p>
            </div>
            <strong>{clasificacion.length} EQUIPOS</strong>
          </div>

          {!clasificacion.some(equipo => equipo.puntos !== 0) && (
            <p className="veteranos-ranking-pendiente">
              ⚾ Clasificación pendiente del inicio del campeonato
            </p>
          )}

          <div className="veteranos-ranking-tabla">
            <table>
              <thead>
                <tr>
                  <th>POS.</th>
                  <th>EQUIPO FANTASY</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
                {clasificacion.map((equipo, indice) => {
                  const posicion = clasificacion.findIndex(
                    item => item.puntos === equipo.puntos
                  ) + 1;

                  const campeonatoIniciado = clasificacion.some(
                    item => item.puntos !== 0
                  );

                  const destacar =
                    campeonatoIniciado && equipo.puntos > 0;

                  return (
                  <tr key={equipo.equipoId}>
                    <td>
                      <span className={
                        'veteranos-ranking-posicion' +
                        (destacar ? ' posicion-' + posicion : '')
                      }>
                        {campeonatoIniciado ? posicion : '—'}
                      </span>
                    </td>
                    <td className="veteranos-ranking-nombre">
                      {nombresEquipos.get(equipo.equipoId) ||
                        equipo.equipoId}
                    </td>
                    <td className="veteranos-ranking-puntos">
                      {equipo.puntos}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h3>⚾ Equipos Fantasy · Plantillas 2028</h3>

      <div className="veteranos-tarjetas-seguras">
        {clasificacion.map(equipo => {
          const nombre = String(
            nombresEquipos.get(equipo.equipoId) ||
            'Equipo Fantasy'
          );

          const selecciones = Array.isArray(draftLocal?.selecciones)
            ? draftLocal.selecciones.filter(
                s => s && String(s.equipoId) === equipo.equipoId
              )
            : [];

          return (
            <article
              key={equipo.equipoId}
              className="veteranos-tarjeta-segura"
            >
              <div className="veteranos-tarjeta-titulo">
                <span>⚾</span>
                <strong>{nombre}</strong>
              </div>

              <div className="veteranos-tarjeta-datos">
                <div>
                  <small>JUGADORES</small>
                  <strong>{selecciones.length}/18</strong>
                </div>
                <div>
                  <small>PUNTOS</small>
                  <strong>{equipo.puntos}</strong>
                </div>
              </div>

              <details className="veteranos-tarjeta-detalles">
                <summary>VER PLANTILLA</summary>

                {selecciones.length === 0 ? (
                  <p>Sin peloteros seleccionados todavía.</p>
                ) : (
                  <ol>
                    {selecciones.map((s, indice) => (
                      <li key={s.numero ?? indice}>
                        {String(s.jugadorNombre || 'Pelotero')}
                      </li>
                    ))}
                  </ol>
                )}
              </details>
            </article>
          );
        })}
      </div>

      <h3>Historial de registros ({registros.length})</h3>

      {registros.length === 0 && (
        <p>Todavía no hay estadísticas registradas.</p>
      )}

      {registros.map(registro => (
        <div key={registro.id} style={{
          padding: 12,
          marginBottom: 10,
          background: '#203b5e',
          borderRadius: 10
        }}>
          <strong>{registro.jugador}</strong>
          <p>
            {registro.fecha} · Monagrillo vs. {registro.rival}
          </p>
          <strong>{registro.puntos} puntos Fantasy</strong>
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => editarRegistro(registro)}
            >
              ✏️ EDITAR ESTADÍSTICAS
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
