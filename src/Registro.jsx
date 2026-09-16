import React, { useState } from 'react';
import { supabase } from './supabase';
import './registro.css';

const formularioInicial = {
  nombre_nino: '',
  fecha_nacimiento: '',
  categoria: '',
  posicion: '',
  escuela: '',
  residencia: '',
  condicion_medica: '',
  experiencia: '',
  academia_anterior: '',
  nombre_acudiente: '',
  telefono: '',
  correo: '',
  autorizacion: false,
};

export default function Registro({ onVolver }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const cambiarCampo = (e) => {
    const { name, value, type, checked } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    setError('');

    if (!formulario.autorizacion) {
      setError('Debes autorizar el envío de la información.');
      return;
    }

    setEnviando(true);

    const { error: errorSupabase } = await supabase
      .from('inscripciones')
      .insert({
        ...formulario,
        estado: 'pendiente',
      });

    setEnviando(false);

    if (errorSupabase) {
      console.error(errorSupabase);
      setError('No se pudo enviar la inscripción. Inténtalo nuevamente.');
      return;
    }

    setFormulario(formularioInicial);
    setEnviado(true);
  };

  if (enviado) {
    return (
      <main className="registro-pagina">
        <section className="registro-exito">
          <span className="registro-exito-icono">✓</span>
          <h1>Inscripción enviada</h1>
          <p>
            Recibimos correctamente la información. La academia se comunicará
            con el acudiente.
          </p>
          <button type="button" onClick={onVolver}>
            Volver a la aplicación
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="registro-pagina">
      <section className="registro-contenedor">
        <button
          type="button"
          className="registro-volver"
          onClick={onVolver}
        >
          ← Volver a la aplicación
        </button>

        <div className="registro-encabezado">
          <span>INSCRIPCIONES</span>
          <h1>Registro de jugadores</h1>
          <p>
            Completa la información del niño y del acudiente. Los campos
            marcados con * son obligatorios.
          </p>
        </div>

        <form className="registro-formulario" onSubmit={enviarFormulario}>
          <label>
            Nombre completo del niño *
            <input
              type="text"
              name="nombre_nino"
              value={formulario.nombre_nino}
              onChange={cambiarCampo}
              required
            />
          </label>

          <label>
            Fecha de nacimiento *
            <input
              type="date"
              name="fecha_nacimiento"
              value={formulario.fecha_nacimiento}
              onChange={cambiarCampo}
              max={new Date().toISOString().split('T')[0]}
              required
            />
          </label>

          <label>
            Categoría
            <select
              name="categoria"
              value={formulario.categoria}
              onChange={cambiarCampo}
            >
              <option value="">Seleccionar</option>
              <option value="Pre bim-bim">Pre bim-bim</option>
              <option value="Bim-bim">Bim-bim</option>
              <option value="U6">U6</option>
              <option value="U7">U7</option>
              <option value="U8">U8</option>
            </select>
          </label>

          <label>
            Posición del jugador
            <input
              type="text"
              name="posicion"
              value={formulario.posicion}
              onChange={cambiarCampo}
              placeholder="Ejemplo: aún no definida"
            />
          </label>

          <label>
            Escuela actual
            <input
              type="text"
              name="escuela"
              value={formulario.escuela}
              onChange={cambiarCampo}
            />
          </label>

          <label>
            Lugar de residencia *
            <input
              type="text"
              name="residencia"
              value={formulario.residencia}
              onChange={cambiarCampo}
              required
            />
          </label>

          <label>
            Enfermedad, condición médica o alergia
            <textarea
              name="condicion_medica"
              value={formulario.condicion_medica}
              onChange={cambiarCampo}
              placeholder="Escribe Ninguna si no aplica"
            />
          </label>

          <label>
            Conocimiento o experiencia en béisbol
            <textarea
              name="experiencia"
              value={formulario.experiencia}
              onChange={cambiarCampo}
              placeholder="Principiante, básico o con experiencia"
            />
          </label>

          <label>
            Academia anterior
            <input
              type="text"
              name="academia_anterior"
              value={formulario.academia_anterior}
              onChange={cambiarCampo}
              placeholder="Escribe Ninguna si no aplica"
            />
          </label>

          <label>
            Nombre completo del acudiente *
            <input
              type="text"
              name="nombre_acudiente"
              value={formulario.nombre_acudiente}
              onChange={cambiarCampo}
              required
            />
          </label>

          <label>
            Teléfono o WhatsApp *
            <input
              type="tel"
              name="telefono"
              value={formulario.telefono}
              onChange={cambiarCampo}
              required
            />
          </label>

          <label>
            Correo electrónico
            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={cambiarCampo}
            />
          </label>

          <label className="registro-autorizacion">
            <input
              type="checkbox"
              name="autorizacion"
              checked={formulario.autorizacion}
              onChange={cambiarCampo}
              required
            />
            <span>
              Autorizo el uso de esta información exclusivamente para la
              administración y comunicación de la academia. *
            </span>
          </label>

          {error && <p className="registro-error">{error}</p>}

          <button
            type="submit"
            className="registro-enviar"
            disabled={enviando}
          >
            {enviando ? 'Enviando…' : 'Enviar inscripción'}
          </button>
        </form>
      </section>
    </main>
  );
}