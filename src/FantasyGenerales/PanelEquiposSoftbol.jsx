import React from 'react';
import { equiposSoftbol } from './equiposSoftbol';

export default function PanelEquiposSoftbol() {
  return (
    <section className="fantasy-alineacion">
      <h3>🥎 EQUIPOS DE SÓFTBOL VETERANOS</h3>
      <p>10 equipos seleccionados por la administración.</p>
      {equiposSoftbol.map((equipo, indice) => (
        <div className="fantasy-posicion" key={equipo.id}>
          <span className="fantasy-posicion-codigo">
            {indice + 1}
          </span>
          <span className="fantasy-posicion-nombre">
            {equipo.nombre}
          </span>
          <span className="fantasy-posicion-vacia">
            Pendiente
          </span>
        </div>
      ))}
      <p className="fantasy-aviso">
        Los peloteros se registrarán cuando la administración
        confirme los rosters de cada equipo.
      </p>
    </section>
  );
}
