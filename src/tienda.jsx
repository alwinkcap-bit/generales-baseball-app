import { tarjetasColeccionables } from "./data/tarjetasColeccionables";
import React from 'react';

export default function Tienda({ onVolver }) {
  return (
    <div className="tienda-container">
      {/* Encabezado con botón para regresar */}
      <header className="tienda-header">
        <button type="button" className="ghost" onClick={onVolver}>
          ← Volver al Inicio
        </button>
        <h2>Tienda Oficial Generales</h2>
      </header>

      {/* Catálogo de Productos */}
      <div className="tienda-grid">
        <div className="producto-card">
          <div className="producto-imagen-placeholder">🧢</div>
          <h3>Gorra Oficial Generales</h3>
          <p className="precio">$15.00</p>
          <button type="button">Comprar / Solicitar</button>
        </div>

        <div className="producto-card">
          <div className="producto-imagen-placeholder">👕</div>
          <h3>Camiseta de Entrenamiento</h3>
          <p className="precio">$25.00</p>
          <button type="button">Comprar / Solicitar</button>
        </div>
      </div>

      {/* Tarjetas coleccionables */}
      <section className="tarjetas-seccion">
<h2>⚾ Tarjetas Coleccionables</h2>
<p>Descubre nuestras tarjetas de béisbol disponibles.</p>
<div className="tienda-grid">
{tarjetasColeccionables.map((tarjeta) => (
<div className="producto-card" key={tarjeta.id}>
<div className="producto-imagen-placeholder">🃏</div>
<h3>{tarjeta.jugador}</h3>
<p>{tarjeta.marca} {tarjeta.anio} · #{tarjeta.numero}</p>
<p>Tarjeta sola: ${tarjeta.precioSolo.toFixed(2)}</p>
<p>Con protector: ${tarjeta.precioProtector.toFixed(2)}</p>
<p>{tarjeta.estado}</p>
</div>
))}
</div>
</section>
    </div>
  );
}