-- Fantasy Sóftbol Veteranos 2028
-- Estructura independiente para el Draft multijugador.
-- No modifica Juvenil, Mayor ni MLB.

CREATE TABLE IF NOT EXISTS public.fantasy_veteranos_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sala_id uuid NOT NULL UNIQUE
    REFERENCES public.fantasy_salas(id) ON DELETE CASCADE,
  estado text NOT NULL DEFAULT 'preparado'
    CHECK (estado IN ('preparado', 'activo', 'finalizado')),
  seleccion_actual integer NOT NULL DEFAULT 0
    CHECK (seleccion_actual >= 0),
  turno_vence_en timestamptz,
  iniciado_en timestamptz,
  finalizado_en timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fantasy_veteranos_drafts
ENABLE ROW LEVEL SECURITY;

-- Selecciones del Draft de Sóftbol Veteranos 2028.
-- Cada equipo podrá seleccionar 18 jugadores.

CREATE TABLE IF NOT EXISTS public.fantasy_veteranos_selecciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  draft_id uuid NOT NULL
    REFERENCES public.fantasy_veteranos_drafts(id)
    ON DELETE CASCADE,

  participante_id uuid NOT NULL
    REFERENCES public.fantasy_participantes(id),

  jugador_id uuid NOT NULL,

  ronda integer NOT NULL
    CHECK (ronda BETWEEN 1 AND 18),

  numero_turno integer NOT NULL
    CHECK (numero_turno > 0),

  posicion text NOT NULL,

  seleccion_automatica boolean NOT NULL DEFAULT false,

  seleccionado_en timestamptz NOT NULL DEFAULT now(),

  UNIQUE (draft_id, numero_turno),
  UNIQUE (draft_id, participante_id, ronda),
  UNIQUE (draft_id, participante_id, jugador_id)
);

ALTER TABLE public.fantasy_veteranos_selecciones
ENABLE ROW LEVEL SECURITY;

-- Administradores autorizados exclusivamente para Fantasy Veteranos.
-- Los permisos se verificarán en Supabase, no mediante isAdmin.

CREATE TABLE IF NOT EXISTS public.fantasy_veteranos_admins (
  usuario_id uuid PRIMARY KEY
    REFERENCES auth.users(id),
  creado_en timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fantasy_veteranos_admins
ENABLE ROW LEVEL SECURITY;

-- No se conceden permisos de escritura a los usuarios.
-- La administración se realizará mediante operaciones autorizadas.
REVOKE ALL ON public.fantasy_veteranos_admins
FROM anon, authenticated;

-- Comprueba permisos para administrar una sala de Veteranos.
-- No utiliza la variable isAdmin del navegador.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_puede_administrar(
  p_sala_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.fantasy_salas s
      WHERE s.id = p_sala_id
        AND s.campeonato = 'softbol-veteranos'
        AND (
          s.organizador_id = auth.uid()
          OR EXISTS (
            SELECT 1
            FROM public.fantasy_veteranos_admins a
            WHERE a.usuario_id = auth.uid()
          )
        )
    );
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_puede_administrar(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_puede_administrar(uuid)
TO authenticated;


-- Autorización exclusiva para administrar el catálogo de Monagrillo.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_puede_editar_catalogo()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.fantasy_veteranos_admins a
      WHERE a.usuario_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_puede_editar_catalogo()
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_puede_editar_catalogo()
TO authenticated;

-- Impide vincular un Draft de Veteranos a otro campeonato.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_validar_sala()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.fantasy_salas
    WHERE id = NEW.sala_id
      AND campeonato = 'softbol-veteranos'
  ) THEN
    RAISE EXCEPTION
      'El Draft debe pertenecer a una sala de Sóftbol Veteranos';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER fantasy_veteranos_validar_sala_trigger
BEFORE INSERT OR UPDATE OF sala_id
ON public.fantasy_veteranos_drafts
FOR EACH ROW
EXECUTE FUNCTION public.fantasy_veteranos_validar_sala();


-- Verifica si una sala de Veteranos puede iniciar su Draft.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_puede_iniciar(
  p_sala_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    public.fantasy_veteranos_puede_administrar(p_sala_id)
    AND EXISTS (
      SELECT 1
      FROM public.fantasy_salas s
      WHERE s.id = p_sala_id
        AND s.campeonato = 'softbol-veteranos'
        AND s.estado IN ('abierta', 'confirmada')
    )
    AND (
      SELECT COUNT(*)
      FROM public.fantasy_participantes p
      WHERE p.sala_id = p_sala_id
    ) = 10;
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_puede_iniciar(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_puede_iniciar(uuid)
TO authenticated;


-- Orden oficial de turnos del Draft de Veteranos.
-- Cada equipo participa una vez por ronda, durante 18 rondas.

CREATE TABLE IF NOT EXISTS public.fantasy_veteranos_turnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  draft_id uuid NOT NULL
    REFERENCES public.fantasy_veteranos_drafts(id)
    ON DELETE CASCADE,

  participante_id uuid NOT NULL
    REFERENCES public.fantasy_participantes(id),

  ronda integer NOT NULL
    CHECK (ronda BETWEEN 1 AND 18),

  numero_turno integer NOT NULL
    CHECK (numero_turno > 0),

  posicion_requerida text NOT NULL,

  UNIQUE (draft_id, numero_turno),
  UNIQUE (draft_id, participante_id, ronda)
);

ALTER TABLE public.fantasy_veteranos_turnos
ENABLE ROW LEVEL SECURITY;


-- Genera los turnos rotativos para 18 rondas.
-- Debe ejecutarse desde una operación autorizada del servidor.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_generar_turnos(
  p_draft_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total integer;
  v_ronda integer;
  v_indice integer;
  v_participantes uuid[];
  v_posiciones text[] := ARRAY[
    'P', 'C', '1B', '2B', '3B', 'SS',
    'OF', 'OF', 'OF', 'DH'
  ];
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.fantasy_veteranos_drafts d
    WHERE d.id = p_draft_id
      AND d.estado = 'preparado'
      AND public.fantasy_veteranos_puede_administrar(d.sala_id)
  ) THEN
    RAISE EXCEPTION 'No autorizado para generar turnos';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.fantasy_veteranos_turnos
    WHERE draft_id = p_draft_id
  ) THEN
    RAISE EXCEPTION 'Este Draft ya tiene turnos generados';
  END IF;

  SELECT array_agg(p.id ORDER BY p.fecha_registro, p.id)
  INTO v_participantes
  FROM public.fantasy_participantes p
  JOIN public.fantasy_veteranos_drafts d
    ON d.sala_id = p.sala_id
  WHERE d.id = p_draft_id;

  v_total := COALESCE(array_length(v_participantes, 1), 0);

  IF v_total <> 10 THEN
    RAISE EXCEPTION 'Se requieren exactamente 10 equipos Fantasy';
  END IF;

  FOR v_ronda IN 1..18 LOOP
    FOR v_indice IN 0..(v_total - 1) LOOP
      INSERT INTO public.fantasy_veteranos_turnos (
        draft_id,
        participante_id,
        ronda,
        numero_turno,
        posicion_requerida
      )
      VALUES (
        p_draft_id,
        v_participantes[
          ((v_ronda - 1 + v_indice) % v_total) + 1
        ],
        v_ronda,
        ((v_ronda - 1) * v_total) + v_indice + 1,
        CASE
          WHEN v_ronda <= 10
          THEN v_posiciones[v_ronda]
          ELSE 'LIBRE'
        END
      );
    END LOOP;
  END LOOP;
END;
$$;

-- No permitir su ejecución directa desde el navegador.
REVOKE ALL ON FUNCTION
public.fantasy_veteranos_generar_turnos(uuid)
FROM PUBLIC, anon, authenticated;


-- Consultar equipos inscritos en una sala de Veteranos.
-- Acceso exclusivo para participantes de la misma sala.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_equipos_sala(
  p_sala_id uuid
)
RETURNS TABLE (
  participante_id uuid,
  nombre_equipo text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.fantasy_salas s
    WHERE s.id = p_sala_id
      AND s.campeonato = 'softbol-veteranos'
      AND (
        s.organizador_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.fantasy_participantes p
          WHERE p.sala_id = s.id
            AND p.usuario_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1
          FROM public.fantasy_veteranos_admins a
          WHERE a.usuario_id = auth.uid()
        )
      )
  ) THEN
    RAISE EXCEPTION 'No tienes acceso a esta sala';
  END IF;

  RETURN QUERY
  SELECT p.id, p.nombre_equipo::text
  FROM public.fantasy_participantes p
  WHERE p.sala_id = p_sala_id
  ORDER BY p.fecha_registro, p.id;
END;
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_equipos_sala(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_equipos_sala(uuid)
TO authenticated;


-- Inicio autorizado del Draft de Sóftbol Veteranos 2028.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_iniciar_draft(
  p_sala_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft_id uuid;
  v_estado text;
BEGIN
  -- Bloquear la sala para evitar inicios simultáneos.
  PERFORM 1
  FROM public.fantasy_salas
  WHERE id = p_sala_id
    AND campeonato = 'softbol-veteranos'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sala de Veteranos no encontrada';
  END IF;

  IF NOT public.fantasy_veteranos_puede_iniciar(p_sala_id) THEN
    RAISE EXCEPTION 'No autorizado o faltan equipos inscritos';
  END IF;

  SELECT id, estado
  INTO v_draft_id, v_estado
  FROM public.fantasy_veteranos_drafts
  WHERE sala_id = p_sala_id
  FOR UPDATE;

  IF v_draft_id IS NOT NULL THEN
    RAISE EXCEPTION 'Esta sala ya tiene un Draft registrado';
  END IF;

  INSERT INTO public.fantasy_veteranos_drafts (sala_id)
  VALUES (p_sala_id)
  RETURNING id INTO v_draft_id;

  PERFORM public.fantasy_veteranos_generar_turnos(v_draft_id);

  UPDATE public.fantasy_veteranos_drafts
  SET estado = 'activo',
      iniciado_en = now(),
      turno_vence_en = now() + interval '20 seconds'
  WHERE id = v_draft_id;

  UPDATE public.fantasy_salas
  SET estado = 'en_draft'
  WHERE id = p_sala_id;

  RETURN v_draft_id;
END;
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_iniciar_draft(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_iniciar_draft(uuid)
TO authenticated;


-- Catálogo compartido de peloteros de Sóftbol Veteranos 2028.
-- Inicialmente se utilizarán los jugadores reales de Monagrillo.

CREATE TABLE IF NOT EXISTS public.fantasy_veteranos_peloteros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  equipo_real text NOT NULL DEFAULT 'Monagrillo'
    CHECK (equipo_real = 'Monagrillo'),

  nombre text NOT NULL
    CHECK (length(trim(nombre)) > 0),

  posicion text NOT NULL
    CHECK (posicion IN (
      'P', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH'
    )),

  activo boolean NOT NULL DEFAULT true,

  creado_en timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fantasy_veteranos_peloteros
ENABLE ROW LEVEL SECURITY;


-- Vincular las selecciones al catálogo oficial de Monagrillo.

ALTER TABLE public.fantasy_veteranos_selecciones
ADD CONSTRAINT fantasy_veteranos_selecciones_pelotero_fkey
FOREIGN KEY (jugador_id)
REFERENCES public.fantasy_veteranos_peloteros(id)
ON DELETE RESTRICT;


-- Garantizar que cada selección corresponda a un turno oficial.
-- El participante y la ronda deben coincidir con el turno registrado.

ALTER TABLE public.fantasy_veteranos_turnos
ADD CONSTRAINT fantasy_veteranos_turno_identidad_unica
UNIQUE (draft_id, numero_turno, participante_id, ronda);

ALTER TABLE public.fantasy_veteranos_selecciones
ADD CONSTRAINT fantasy_veteranos_seleccion_turno_fkey
FOREIGN KEY (
  draft_id,
  numero_turno,
  participante_id,
  ronda
)
REFERENCES public.fantasy_veteranos_turnos (
  draft_id,
  numero_turno,
  participante_id,
  ronda
)
ON DELETE RESTRICT;


-- Proteger las tablas del Draft contra escrituras directas.
-- Las operaciones se realizarán mediante funciones autorizadas.

REVOKE INSERT, UPDATE, DELETE
ON public.fantasy_veteranos_drafts,
   public.fantasy_veteranos_turnos,
   public.fantasy_veteranos_selecciones
FROM PUBLIC, anon, authenticated;

-- Mantener las tablas protegidas mediante RLS.
ALTER TABLE public.fantasy_veteranos_drafts
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fantasy_veteranos_turnos
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fantasy_veteranos_selecciones
ENABLE ROW LEVEL SECURITY;


-- Proteger el catálogo oficial de Monagrillo.
-- Los jugadores se administrarán mediante operaciones autorizadas.

REVOKE INSERT, UPDATE, DELETE
ON public.fantasy_veteranos_peloteros
FROM PUBLIC, anon, authenticated;

-- Impedir cambios directos en la lista de administradores.
REVOKE INSERT, UPDATE, DELETE
ON public.fantasy_veteranos_admins
FROM PUBLIC, anon, authenticated;

-- Mantener ambas tablas protegidas por RLS.
ALTER TABLE public.fantasy_veteranos_peloteros
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fantasy_veteranos_admins
ENABLE ROW LEVEL SECURITY;


-- Selección segura de peloteros en Fantasy Veteranos.

CREATE OR REPLACE FUNCTION public.fantasy_veteranos_seleccionar(
  p_draft_id uuid,
  p_jugador_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.fantasy_veteranos_drafts%ROWTYPE;
  v_turno public.fantasy_veteranos_turnos%ROWTYPE;
  v_jugador public.fantasy_veteranos_peloteros%ROWTYPE;
  v_total integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión';
  END IF;

  SELECT * INTO v_draft
  FROM public.fantasy_veteranos_drafts
  WHERE id = p_draft_id
  FOR UPDATE;

  IF NOT FOUND OR v_draft.estado <> 'activo' THEN
    RAISE EXCEPTION 'El Draft no está activo';
  END IF;

  IF v_draft.turno_vence_en IS NULL
     OR clock_timestamp() >= v_draft.turno_vence_en THEN
    RAISE EXCEPTION 'El tiempo de selección ha terminado';
  END IF;

  SELECT * INTO v_turno
  FROM public.fantasy_veteranos_turnos
  WHERE draft_id = p_draft_id
    AND numero_turno = v_draft.seleccion_actual + 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe el turno actual';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.fantasy_participantes p
    WHERE p.id = v_turno.participante_id
      AND p.sala_id = v_draft.sala_id
      AND p.usuario_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'No es tu turno';
  END IF;

  SELECT * INTO v_jugador
  FROM public.fantasy_veteranos_peloteros
  WHERE id = p_jugador_id
    AND activo = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pelotero no disponible';
  END IF;

  IF v_turno.posicion_requerida <> 'LIBRE'
     AND v_jugador.posicion <> v_turno.posicion_requerida THEN
    RAISE EXCEPTION 'Posición incorrecta para esta ronda';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.fantasy_veteranos_selecciones
    WHERE draft_id = p_draft_id
      AND participante_id = v_turno.participante_id
      AND jugador_id = p_jugador_id
  ) THEN
    RAISE EXCEPTION 'Este equipo ya seleccionó al pelotero';
  END IF;

  -- Máximo cinco equipos Fantasy por pelotero y por Draft.
  -- El bloqueo FOR UPDATE del Draft serializa las selecciones.
  IF (
    SELECT COUNT(DISTINCT participante_id)
    FROM public.fantasy_veteranos_selecciones
    WHERE draft_id = p_draft_id
      AND jugador_id = p_jugador_id
  ) >= 5 THEN
    RAISE EXCEPTION
      'CUPO COMPLETO: este pelotero ya pertenece a 5 equipos Fantasy';
  END IF;

  INSERT INTO public.fantasy_veteranos_selecciones (
    draft_id, participante_id, jugador_id,
    ronda, numero_turno, posicion
  )
  VALUES (
    p_draft_id, v_turno.participante_id, p_jugador_id,
    v_turno.ronda, v_turno.numero_turno, v_jugador.posicion
  );

  SELECT COUNT(*) INTO v_total
  FROM public.fantasy_veteranos_turnos
  WHERE draft_id = p_draft_id;

  UPDATE public.fantasy_veteranos_drafts
  SET seleccion_actual = seleccion_actual + 1,
      estado = CASE
        WHEN seleccion_actual + 1 >= v_total
        THEN 'finalizado'
        ELSE 'activo'
      END,
      turno_vence_en = CASE
        WHEN seleccion_actual + 1 >= v_total
        THEN NULL
        ELSE clock_timestamp() + interval '20 seconds'
      END,
      finalizado_en = CASE
        WHEN seleccion_actual + 1 >= v_total
        THEN clock_timestamp()
        ELSE NULL
      END
  WHERE id = p_draft_id;

  IF v_draft.seleccion_actual + 1 >= v_total THEN
    UPDATE public.fantasy_salas
    SET estado = 'finalizada'
    WHERE id = v_draft.sala_id
      AND campeonato = 'softbol-veteranos';
  END IF;

  RETURN v_draft.seleccion_actual + 1;
END;
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_seleccionar(uuid, uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_seleccionar(uuid, uuid)
TO authenticated;


-- Resolver automáticamente un turno vencido.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_resolver_vencido(
  p_draft_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.fantasy_veteranos_drafts%ROWTYPE;
  v_turno public.fantasy_veteranos_turnos%ROWTYPE;
  v_jugador uuid;
  v_posicion text;
  v_total integer;
BEGIN
  -- Solo puede ejecutarse desde el servicio del servidor.
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'Operación reservada al servidor';
  END IF;

  SELECT * INTO v_draft
  FROM public.fantasy_veteranos_drafts
  WHERE id = p_draft_id
  FOR UPDATE;

  IF NOT FOUND OR v_draft.estado <> 'activo' THEN
    RETURN false;
  END IF;

  IF v_draft.turno_vence_en IS NULL
     OR clock_timestamp() < v_draft.turno_vence_en THEN
    RETURN false;
  END IF;

  SELECT * INTO v_turno
  FROM public.fantasy_veteranos_turnos
  WHERE draft_id = p_draft_id
    AND numero_turno = v_draft.seleccion_actual + 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Turno no encontrado';
  END IF;

  SELECT p.id, p.posicion
  INTO v_jugador, v_posicion
  FROM public.fantasy_veteranos_peloteros p
  WHERE p.activo = true
    AND (
      v_turno.posicion_requerida = 'LIBRE'
      OR p.posicion = v_turno.posicion_requerida
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.fantasy_veteranos_selecciones s
      WHERE s.draft_id = p_draft_id
        AND s.participante_id = v_turno.participante_id
        AND s.jugador_id = p.id
    )
    AND (
      SELECT COUNT(DISTINCT s.participante_id)
      FROM public.fantasy_veteranos_selecciones s
      WHERE s.draft_id = p_draft_id
        AND s.jugador_id = p.id
    ) < 5
  ORDER BY p.id
  LIMIT 1;

  IF v_jugador IS NULL THEN
    RAISE EXCEPTION 'No hay peloteros elegibles para este turno';
  END IF;

  INSERT INTO public.fantasy_veteranos_selecciones (
    draft_id, participante_id, jugador_id,
    ronda, numero_turno, posicion, seleccion_automatica
  )
  VALUES (
    p_draft_id, v_turno.participante_id, v_jugador,
    v_turno.ronda, v_turno.numero_turno, v_posicion, true
  );

  SELECT COUNT(*) INTO v_total
  FROM public.fantasy_veteranos_turnos
  WHERE draft_id = p_draft_id;

  UPDATE public.fantasy_veteranos_drafts
  SET seleccion_actual = seleccion_actual + 1,
      estado = CASE
        WHEN seleccion_actual + 1 >= v_total
        THEN 'finalizado' ELSE 'activo'
      END,
      turno_vence_en = CASE
        WHEN seleccion_actual + 1 >= v_total
        THEN NULL
        ELSE clock_timestamp() + interval '20 seconds'
      END,
      finalizado_en = CASE
        WHEN seleccion_actual + 1 >= v_total
        THEN clock_timestamp() ELSE NULL
      END
  WHERE id = p_draft_id;

  IF v_draft.seleccion_actual + 1 >= v_total THEN
    UPDATE public.fantasy_salas
    SET estado = 'finalizada'
    WHERE id = v_draft.sala_id
      AND campeonato = 'softbol-veteranos';
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_resolver_vencido(uuid)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_resolver_vencido(uuid)
TO service_role;


-- Consulta segura del estado del Draft.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_estado_draft(
  p_sala_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_draft public.fantasy_veteranos_drafts%ROWTYPE;
  v_resultado jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión';
  END IF;

  IF NOT (
    public.fantasy_veteranos_puede_administrar(p_sala_id)
    OR EXISTS (
      SELECT 1
      FROM public.fantasy_participantes p
      WHERE p.sala_id = p_sala_id
        AND p.usuario_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'No tienes acceso a esta sala';
  END IF;

  SELECT * INTO v_draft
  FROM public.fantasy_veteranos_drafts
  WHERE sala_id = p_sala_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'estado', 'sin_iniciar',
      'equipos', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'nombre', p.nombre_equipo
          ) ORDER BY p.fecha_registro, p.id
        ), '[]'::jsonb)
        FROM public.fantasy_participantes p
        WHERE p.sala_id = p_sala_id
      )
    );
  END IF;

  SELECT jsonb_build_object(
    'draft_id', v_draft.id,
    'estado', v_draft.estado,
    'seleccion_actual', v_draft.seleccion_actual,
    'turno_vence_en', v_draft.turno_vence_en,
    'equipos', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'nombre', p.nombre_equipo
        ) ORDER BY p.fecha_registro, p.id
      ), '[]'::jsonb)
      FROM public.fantasy_participantes p
      WHERE p.sala_id = p_sala_id
    ),
    'turno', (
      SELECT to_jsonb(t)
      FROM public.fantasy_veteranos_turnos t
      WHERE t.draft_id = v_draft.id
        AND t.numero_turno = v_draft.seleccion_actual + 1
    ),
    'selecciones', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'participante_id', s.participante_id,
          'jugador_id', s.jugador_id,
          'ronda', s.ronda,
          'numero_turno', s.numero_turno,
          'posicion', s.posicion,
          'automatica', s.seleccion_automatica
        ) ORDER BY s.numero_turno
      ), '[]'::jsonb)
      FROM public.fantasy_veteranos_selecciones s
      WHERE s.draft_id = v_draft.id
    )
  )
  INTO v_resultado;

  RETURN v_resultado;
END;
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_estado_draft(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_estado_draft(uuid)
TO authenticated;


-- Validar el catálogo antes de iniciar un Draft de Veteranos.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_catalogo_listo()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    COUNT(*) = 40
    AND COUNT(*) FILTER (WHERE posicion = 'P') >= 2
    AND COUNT(*) FILTER (WHERE posicion = 'C') >= 2
    AND COUNT(*) FILTER (WHERE posicion = '1B') >= 2
    AND COUNT(*) FILTER (WHERE posicion = '2B') >= 2
    AND COUNT(*) FILTER (WHERE posicion = '3B') >= 2
    AND COUNT(*) FILTER (WHERE posicion = 'SS') >= 2
    AND COUNT(*) FILTER (WHERE posicion = 'OF') >= 6
    AND COUNT(*) FILTER (WHERE posicion = 'DH') >= 2
  FROM public.fantasy_veteranos_peloteros
  WHERE activo = true
    AND equipo_real = 'Monagrillo';
$$;

REVOKE ALL ON FUNCTION
public.fantasy_veteranos_catalogo_listo()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
public.fantasy_veteranos_catalogo_listo()
TO authenticated;

-- Exigir un catálogo válido antes de iniciar el Draft.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_exigir_catalogo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.estado = 'activo'
     AND OLD.estado IS DISTINCT FROM 'activo'
     AND NOT public.fantasy_veteranos_catalogo_listo()
  THEN
    RAISE EXCEPTION
      'El catálogo de Monagrillo no tiene suficientes jugadores o posiciones';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER fantasy_veteranos_exigir_catalogo_trigger
BEFORE UPDATE OF estado
ON public.fantasy_veteranos_drafts
FOR EACH ROW
EXECUTE FUNCTION public.fantasy_veteranos_exigir_catalogo();


-- Proteger el catálogo mientras exista un Draft activo.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_proteger_catalogo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.fantasy_veteranos_drafts
    WHERE estado = 'activo'
  ) THEN
    RAISE EXCEPTION
      'No se puede modificar el catálogo mientras exista un Draft activo';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER fantasy_veteranos_proteger_catalogo_trigger
BEFORE UPDATE OR DELETE
ON public.fantasy_veteranos_peloteros
FOR EACH ROW
EXECUTE FUNCTION public.fantasy_veteranos_proteger_catalogo();


-- Impedir nuevas inscripciones en salas de Veteranos
-- cuando el Draft ya comenzó.
CREATE OR REPLACE FUNCTION public.fantasy_veteranos_bloquear_ingreso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.fantasy_salas
    WHERE id = NEW.sala_id
      AND campeonato = 'softbol-veteranos'
      AND estado IN ('en_draft', 'finalizada')
  ) THEN
    RAISE EXCEPTION
      'No puedes ingresar: el Draft de Veteranos ya comenzó o finalizó';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER fantasy_veteranos_bloquear_ingreso_trigger
BEFORE INSERT
ON public.fantasy_participantes
FOR EACH ROW
EXECUTE FUNCTION public.fantasy_veteranos_bloquear_ingreso();

