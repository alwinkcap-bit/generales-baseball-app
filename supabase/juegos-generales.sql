BEGIN;
CREATE TABLE public.perfiles_juegos (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 nickname text NOT NULL CHECK(nickname ~ '^[A-Za-z0-9_]{3,20}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX perfiles_juegos_nickname_unico ON public.perfiles_juegos(lower(nickname));
CREATE TABLE public.duelos_juegos (
 codigo text PRIMARY KEY CHECK(codigo ~ '^[A-F0-9]{8}$'),
 creador_id uuid NOT NULL REFERENCES public.perfiles_juegos(user_id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.resultados_juegos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.perfiles_juegos(user_id) ON DELETE CASCADE,
 modo text NOT NULL CHECK(modo IN ('diario','jugada','duelo','jonrones')),
 clave text NOT NULL CHECK(length(clave) BETWEEN 1 AND 80),
 aciertos integer NOT NULL DEFAULT 0,
 total integer NOT NULL DEFAULT 0,
 jonrones integer NOT NULL DEFAULT 0 CHECK(jonrones BETWEEN 0 AND 10000),
 puntos integer NOT NULL DEFAULT 0 CHECK(puntos BETWEEN 0 AND 100000000),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(aciertos BETWEEN 0 AND total AND total BETWEEN 0 AND 10),
 CHECK((modo='jonrones' AND total=0) OR (modo='diario' AND total=5) OR (modo='jugada' AND total=1) OR (modo='duelo' AND total=10)),
 UNIQUE(user_id,modo,clave)
);
CREATE INDEX resultados_juegos_semana ON public.resultados_juegos(modo,created_at);
CREATE INDEX resultados_juegos_duelo ON public.resultados_juegos(modo,clave);
ALTER TABLE public.perfiles_juegos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duelos_juegos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_juegos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.perfiles_juegos,public.duelos_juegos,public.resultados_juegos FROM anon,authenticated;
GRANT SELECT ON public.perfiles_juegos,public.duelos_juegos,public.resultados_juegos TO anon,authenticated;
GRANT INSERT ON public.perfiles_juegos,public.duelos_juegos,public.resultados_juegos TO authenticated;
GRANT UPDATE(nickname) ON public.perfiles_juegos TO authenticated;
CREATE POLICY juegos_perfiles_lectura ON public.perfiles_juegos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY juegos_perfiles_crear ON public.perfiles_juegos FOR INSERT TO authenticated WITH CHECK((SELECT auth.uid())=user_id);
CREATE POLICY juegos_perfiles_editar ON public.perfiles_juegos FOR UPDATE TO authenticated USING((SELECT auth.uid())=user_id) WITH CHECK((SELECT auth.uid())=user_id);
CREATE POLICY juegos_duelos_lectura ON public.duelos_juegos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY juegos_duelos_crear ON public.duelos_juegos FOR INSERT TO authenticated WITH CHECK((SELECT auth.uid())=creador_id);
CREATE POLICY juegos_resultados_lectura ON public.resultados_juegos FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY juegos_resultados_crear ON public.resultados_juegos FOR INSERT TO authenticated WITH CHECK(
 (SELECT auth.uid())=user_id AND
 CASE
 WHEN modo IN ('diario','jugada') THEN clave=to_char(now() AT TIME ZONE 'America/Panama','YYYY-MM-DD')
 WHEN modo='duelo' THEN EXISTS(SELECT 1 FROM public.duelos_juegos d WHERE d.codigo=clave)
 ELSE true END
);
CREATE FUNCTION public.clasificacion_jonrones_generales()
RETURNS TABLE(nickname text,jonrones integer,puntos integer)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=''
AS $$
 SELECT p.nickname, r.jonrones,r.puntos
 FROM (
  SELECT DISTINCT ON(user_id) user_id,jonrones,puntos
  FROM public.resultados_juegos
  WHERE modo='jonrones' AND created_at >=
   (date_trunc('week',now() AT TIME ZONE 'America/Panama') AT TIME ZONE 'America/Panama')
  ORDER BY user_id,jonrones DESC,puntos DESC,created_at ASC
 ) r JOIN public.perfiles_juegos p ON p.user_id=r.user_id
 ORDER BY r.jonrones DESC,r.puntos DESC,p.nickname ASC LIMIT 50;
$$;
REVOKE ALL ON FUNCTION public.clasificacion_jonrones_generales() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clasificacion_jonrones_generales() TO anon,authenticated;
COMMIT;
-- Comprobación: deben aparecer tres tablas con RLS=true.
SELECT relname AS tabla,relrowsecurity AS rls FROM pg_class
WHERE oid IN('public.perfiles_juegos'::regclass,'public.duelos_juegos'::regclass,'public.resultados_juegos'::regclass);
