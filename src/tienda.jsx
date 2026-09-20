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
    </div>
  );
}