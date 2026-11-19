import { useState } from 'react';

export default function TarjetasEquiposVeteranos({
  draft,
  registros,
  puntosEquipos
}) {
  const [equipoAbierto, setEquipoAbierto] = useState(null);

  const orden = Array.isArray(draft?.orden) ? draft.orden : [];
  const selecciones = Array.isArray(draft?.selecciones)
    ? draft.selecciones
    : [];

  const equipos = [...new Map(
    orden.filter(turno => turno?.equipoId != null).map(turno => [
      String(turno.equipoId),
      {
        id: String(turno.equipoId),
        nombre: String(turno?.equipoNombre || 'Equipo Fantasy')
      }
    ])
  ).values()];

  const puntosPorEquipo = new Map(
    (Array.isArray(puntosEquipos) ? puntosEquipos : []).map(e => [String(e.equipoId), Number(e.puntos) || 0])
  );

  const puntosPorJugador = new Map();

  (Array.isArray(registros) ? registros : []).forEach(registro => {
    const id = String(registro.jugadorId);
    puntosPorJugador.set(
      id,
      (puntosPorJugador.get(id) || 0) + Number(registro.puntos || 0)
    );
  });

  if (!equipos.length) {
    return (
      <p className="veteranos-tarjetas-vacio">
        Los equipos aparecerán cuando se prepare el Draft local.
      </p>
    );
  }

  return (
    <div className="veteranos-tarjetas-grid">
      {equipos.map(equipo => {
        const plantilla = selecciones
          .filter(s => s && String(s.equipoId) === equipo.id)
          .sort((a, b) => Number(a.ronda) - Number(b.ronda));

        const abierto = equipoAbierto === equipo.id;

        return (
          <article className="veteranos-equipo-card" key={equipo.id}>
            <header className="veteranos-equipo-header">
              <span className="veteranos-equipo-escudo">
                {equipo.nombre
                  .split(/\s+/)
                  .map(p => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
              <div>
                <h4>{equipo.nombre}</h4>
                <small>FANTASY VETERANOS 2028</small>
              </div>
            </header>

            <div className="veteranos-equipo-datos">
              <div>
                <small>JUGADORES</small>
                <strong>{plantilla.length}/18</strong>
              </div>
              <div>
                <small>PUNTOS</small>
                <strong className="veteranos-equipo-pts">
                  {puntosPorEquipo.get(equipo.id) || 0}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="veteranos-equipo-boton"
              aria-expanded={abierto}
              onClick={() => setEquipoAbierto(
                abierto ? null : equipo.id
              )}
            >
              {abierto ? 'OCULTAR PLANTILLA' : 'VER PLANTILLA'}
            </button>

            {abierto && (
              <div className="veteranos-equipo-plantilla">
                {plantilla.length === 0 ? (
                  <p>Este equipo todavía no tiene peloteros seleccionados.</p>
                ) : (
                  plantilla.map((s, indice) => (
                    <div
                      key={s.numero ?? indice}
                      className="veteranos-equipo-jugador"
                    >
                      <span>
                        R{s.ronda} · {s.jugadorNombre || 'Pelotero'}
                      </span>
                      <strong>
                        {puntosPorJugador.get(String(s.jugadorId)) || 0} pts
                      </strong>
                    </div>
                  ))
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
