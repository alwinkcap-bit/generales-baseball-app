import PanelEquiposSoftbol from './PanelEquiposSoftbol';
import SalaDraft from './SalaDraft';
import { supabase } from '../supabase';
import { posicionesFantasy } from './posicionesFantasy';
import React, { useState } from 'react';
import './FantasyGenerales.css';
import './PortadaFantasy2028.css';

const campeonatos = [
  { id: 'juvenil', nombre: 'BÉISBOL JUVENIL', icono: '🇵🇦', descripcion: 'Campeonato Nacional Juvenil de Panamá' },
  { id: 'mayor', nombre: 'BÉISBOL MAYOR', icono: '🏆', descripcion: 'Campeonato Nacional Mayor de Panamá' },
  { id: 'mlb', nombre: 'MLB', icono: '⚾', descripcion: 'Grandes Ligas de Béisbol' },
  {
    id: 'softbol-veteranos',
    nombre: 'SÓFTBOL VETERANOS',
    icono: '🥎',
    descripcion: 'Fantasy exclusivo de 10 equipos autorizados'
  }
];

export default function FantasyGenerales({ onCerrar, isAdmin = false, usuario = null }) {
  const codigoInvitacion = new URLSearchParams(
    window.location.search
  ).get('fantasy_invite');

  const [nombreInvitado, setNombreInvitado] = useState('');
  const [equipoInvitado, setEquipoInvitado] = useState('');
  const [registrandoInvitado, setRegistrandoInvitado] = useState(false);
  const [mensajeInvitado, setMensajeInvitado] = useState('');
  const [campeonato, setCampeonato] = useState(null);
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [guardado, setGuardado] = useState(false);
  const [salaDraftOpen, setSalaDraftOpen] = useState(false);
  const [crearSalaOpen, setCrearSalaOpen] = useState(false);
  const [nombreSala, setNombreSala] = useState('');
  const [fechaDraft, setFechaDraft] = useState('');
  const [horaDraft, setHoraDraft] = useState('18:00');
  const [creandoSala, setCreandoSala] = useState(false);
  const [salaCreada, setSalaCreada] = useState(null);
  const [errorSala, setErrorSala] = useState('');


  async function crearSalaPrivada() {
    if (creandoSala || salaCreada) return;
    if (!campeonato || !nombreSala.trim() ||
        !nombreEquipo.trim() || !fechaDraft || !horaDraft) return;

    setCreandoSala(true);
    setErrorSala('');

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError && authError.name !== 'AuthSessionMissingError') {
        throw authError;
      }

      if (!authData?.user) {
        const { error: loginError } =
          await supabase.auth.signInAnonymously();

        if (loginError) throw loginError;
      }

      const { data, error } = await supabase.rpc(
        'fantasy_crear_sala',
        {
          p_nombre_sala: nombreSala.trim(),
          p_campeonato: campeonato.id,
          p_fecha: fechaDraft,
          p_hora: horaDraft,
          p_nombre_participante: nombreEquipo.trim(),
          p_nombre_equipo: nombreEquipo.trim()
        }
      );

      if (error) throw error;
      if (!data?.[0]?.sala_id) {
        throw new Error('No se recibió la sala creada.');
      }

      setSalaCreada(data[0]);
    } catch (error) {
      setErrorSala(error.message || 'No se pudo crear la sala.');
    } finally {
      setCreandoSala(false);
    }
  }

  async function unirseSalaPrivada() {
    if (registrandoInvitado || !codigoInvitacion ||
        !nombreInvitado.trim() || !equipoInvitado.trim()) return;

    setRegistrandoInvitado(true);
    setMensajeInvitado('');

    try {
      const { data: sesion, error: errorSesion } =
        await supabase.auth.getUser();

      if (errorSesion &&
          errorSesion.name !== 'AuthSessionMissingError') {
        throw errorSesion;
      }

      if (!sesion?.user) {
        const { error: errorLogin } =
          await supabase.auth.signInAnonymously();

        if (errorLogin) throw errorLogin;
      }

      const { data, error } = await supabase.rpc(
        'fantasy_unirse_sala',
        {
          p_codigo: codigoInvitacion,
          p_nombre_participante: nombreInvitado.trim(),
          p_nombre_equipo: equipoInvitado.trim()
        }
      );

      if (error) throw error;

      setMensajeInvitado(
        '✅ Equipo registrado. Participantes: ' +
        data[0].equipos_inscritos + ' de 10.'
      );
    } catch (error) {
      setMensajeInvitado(
        '⚠️ ' + (error.message || 'No se pudo registrar.')
      );
    } finally {
      setRegistrandoInvitado(false);
    }
  }

  function guardarEquipo() {
    if (!nombreEquipo.trim() || !campeonato) return;
    localStorage.setItem('fantasy-generales-' + campeonato.id, nombreEquipo.trim());
    setGuardado(true);
  }

  return (
    <main
      className={`fantasy-generales ${!campeonato ? "fantasy-portada-activa" : ""}`}
    >
      <button className="fantasy-volver" onClick={onCerrar}>← VOLVER AL INICIO</button>
      <header className="fantasy-encabezado">
        <span className="fantasy-etiqueta">TEMPORADA 2028</span>
        <h1>⚾ FANTASY GENERALES</h1>
        <p>Tu equipo. Tus decisiones. Tu campeonato.</p>
      </header>

      {codigoInvitacion ? (
        <section className="fantasy-panel fantasy-formulario-invitado">
          <h2>🏆 INVITACIÓN A SALA PRIVADA</h2>
          <p>Registra tu equipo para participar en Fantasy Generales 2028.</p>

          <label htmlFor="fantasy-invitado-nombre">TU NOMBRE</label>
          <input
            id="fantasy-invitado-nombre"
            maxLength={60}
            value={nombreInvitado}
            onChange={e => setNombreInvitado(e.target.value)}
            placeholder="Ejemplo: Carlos Pérez"
          />

          <label htmlFor="fantasy-invitado-equipo">
            NOMBRE DE TU EQUIPO
          </label>
          <input
            id="fantasy-invitado-equipo"
            maxLength={35}
            value={equipoInvitado}
            onChange={e => setEquipoInvitado(e.target.value)}
            placeholder="Ejemplo: Los Campeones"
          />

          <button
            type="button"
            className="fantasy-guardar"
            disabled={
              registrandoInvitado ||
              !nombreInvitado.trim() ||
              !equipoInvitado.trim()
            }
            onClick={unirseSalaPrivada}
          >
            {registrandoInvitado
              ? '⏳ REGISTRANDO...'
              : '🏆 UNIRME A LA SALA'}
          </button>

          {mensajeInvitado && (
            <p role="status" className="fantasy-aviso">
              {mensajeInvitado}
            </p>
          )}
        </section>
      ) : salaDraftOpen && campeonato ? (
        <SalaDraft
          isAdmin={isAdmin}
          usuario={usuario}
          key={campeonato.id}
          campeonato={campeonato.id}
          nombreEquipo={nombreEquipo}
          salaId={
            campeonato.id === 'softbol-veteranos'
              ? salaCreada?.sala_id ?? null
              : undefined
          }
          onVolver={() => setSalaDraftOpen(false)}
        />
      ) : !campeonato ? (
        <>
          <h2 className="fantasy-seleccion-titulo">ELIGE TU CAMPEONATO</h2>
          <div className="fantasy-campeonatos">
            {campeonatos.map(c => (
              <button key={c.id} className={`fantasy-campeonato fantasy-campeonato-${c.id}`} onClick={() => {
                setCampeonato(c);
                setNombreEquipo(localStorage.getItem('fantasy-generales-' + c.id) || '');
                setGuardado(false);
              }}>
                <img
                  className="fantasy-tarjeta-imagen"
                loading={c.id === 'juvenil' ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={c.id === 'juvenil' ? 'high' : 'auto'}
                  src={`${import.meta.env.BASE_URL}fantasy-${c.id === 'softbol-veteranos' ? 'softbol' : c.id}-2028.webp`}
                  alt={`${c.nombre} - Fantasy Generales 2028`}
                />
                <span className="fantasy-icono">{c.icono}</span>
                <strong>{c.nombre}</strong>
                <small>{c.descripcion}</small>
                <span className="fantasy-entrar">ENTRAR →</span>
              </button>
            ))}
          </div>
          
        </>
      ) : (
        <section className="fantasy-panel">
          <button className="fantasy-regresar" onClick={() => setCampeonato(null)}>← Cambiar campeonato</button>
          <span className="fantasy-icono">{campeonato.icono}</span>
          <h2>{campeonato.nombre}</h2>
          <p>¡Crea tu equipo y prepárate para competir!</p>
          <label htmlFor="fantasy-nombre">NOMBRE DE TU EQUIPO</label>
          <input id="fantasy-nombre" maxLength={35} value={nombreEquipo} onChange={e => {
            setNombreEquipo(e.target.value);
            setGuardado(false);
          }} placeholder="Ejemplo: Generales Campeones" />
          <button className="fantasy-guardar" onClick={guardarEquipo} disabled={!nombreEquipo.trim()}>
            GUARDAR MI EQUIPO
          </button>
          <button
            type="button"
            className="fantasy-guardar"
            onClick={() => setCrearSalaOpen(actual => !actual)}
          >
            🏆 {crearSalaOpen ? 'CERRAR FORMULARIO' : 'CREAR SALA PRIVADA'}
          </button>

          {crearSalaOpen && (
            <div className="fantasy-alineacion">
              <h3>🏆 CONFIGURAR SALA PRIVADA</h3>

              <label htmlFor="fantasy-sala-nombre">NOMBRE DE LA SALA</label>
              <input
                id="fantasy-sala-nombre"
                value={nombreSala}
                maxLength={50}
                onChange={e => setNombreSala(e.target.value)}
                placeholder="Ejemplo: Amigos de Chitré"
              />

              <label htmlFor="fantasy-sala-fecha">FECHA DEL DRAFT</label>
              <input
                id="fantasy-sala-fecha"
                type="date"
                value={fechaDraft}
                onChange={e => setFechaDraft(e.target.value)}
              />

              <label htmlFor="fantasy-sala-hora">HORA DE INICIO (PANAMÁ)</label>
              <input
                id="fantasy-sala-hora"
                type="time"
                value={horaDraft}
                onChange={e => setHoraDraft(e.target.value)}
              />

              <p className="fantasy-aviso">
                👥 Capacidad: 10 equipos.
                El organizador ocupará el primer cupo.
              </p>

              <button
                type="button"
                className="fantasy-guardar"
                disabled={
                  creandoSala ||
                  Boolean(salaCreada) ||
                  !nombreSala.trim() ||
                  !nombreEquipo.trim() ||
                  !fechaDraft ||
                  !horaDraft
                }
                onClick={crearSalaPrivada}
              >
                {creandoSala ? '⏳ CREANDO SALA...' :
                  salaCreada ? '✅ SALA CREADA' :
                  '💾 GUARDAR CONFIGURACIÓN'}
              </button>

              {errorSala && (
                <p role="alert" className="fantasy-aviso">
                  ⚠️ {errorSala}
                </p>
              )}

              {salaCreada && (
                <div className="fantasy-exito">
                  <p>✅ Sala creada correctamente.</p>
                  <p>Primer equipo registrado: 1 de 10.</p>
                  <p>Comparte esta invitación con tus amigos.</p>

                  <button
                    type="button"
                    className="fantasy-guardar"
                    onClick={() => {
                      const url = new URL(
                        import.meta.env.BASE_URL,
                        window.location.origin
                      );

                      url.searchParams.set(
                        'fantasy_invite',
                        salaCreada.codigo_invitacion
                      );

                      const mensaje =
                        '⚾🏆 FANTASY GENERALES 2028\n\n' +
                        'Te invito a participar en mi sala privada.\n' +
                        'Registra tu equipo desde este enlace:\n' +
                        url.toString();

                      window.open(
                        'https://wa.me/?text=' +
                        encodeURIComponent(mensaje),
                        '_blank',
                        'noopener,noreferrer'
                      );
                    }}
                  >
                    📲 COMPARTIR POR WHATSAPP
                  </button>
                </div>
              )}
            </div>
          )}

          {guardado && <p className="fantasy-exito">✅ Equipo guardado en este dispositivo.</p>}
          <button
            className="fantasy-guardar"
            onClick={() => setSalaDraftOpen(true)}
            disabled={!nombreEquipo.trim()}
          >
            🏆 ENTRAR AL DRAFT
          </button>
          {campeonato.id === 'softbol-veteranos' && (
            <PanelEquiposSoftbol />
          )}
          <div className="fantasy-progreso">
            <strong>MI ALINEACIÓN</strong>
            <span>
              0 / {campeonato.id === 'softbol-veteranos' ? 18 : 10} jugadores
            </span>
          </div>
          {(guardado || Boolean(localStorage.getItem('fantasy-generales-' + campeonato.id))) && (
            <div className="fantasy-alineacion">
              <h3>⚾ SELECCIONA TUS PELOTEROS</h3>
              {(campeonato.id === 'softbol-veteranos'
                ? [
                    ...posicionesFantasy,
                    ...Array.from({ length: 8 }, (_, i) => ({
                      id: `SUP${i + 1}`,
                      nombre: `Suplente ${i + 1}`
                    }))
                  ]
                : posicionesFantasy
              ).map(posicion => (
                <div className="fantasy-posicion" key={posicion.id}>
                  <span className="fantasy-posicion-codigo">{posicion.id}</span>
                  <span className="fantasy-posicion-nombre">{posicion.nombre}</span>
                  <span className="fantasy-posicion-vacia">Sin jugador</span>
                </div>
              ))}
              <p className="fantasy-aviso">Próximo paso: conectar los jugadores disponibles de cada campeonato.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
