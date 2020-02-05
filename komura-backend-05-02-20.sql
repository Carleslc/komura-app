--
-- PostgreSQL database dump
--

-- Dumped from database version 11.6 (Ubuntu 11.6-1.pgdg16.04+1)
-- Dumped by pg_dump version 12.1 (Debian 12.1-1.pgdg90+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: hdb_catalog; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hdb_catalog;


--
-- Name: hdb_views; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA hdb_views;


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: email; Type: DOMAIN; Schema: public; Owner: -
--

CREATE DOMAIN public.email AS public.citext
	CONSTRAINT email_check CHECK ((VALUE OPERATOR(public.~) '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'::public.citext));


--
-- Name: hdb_schema_update_event_notifier(); Type: FUNCTION; Schema: hdb_catalog; Owner: -
--

CREATE FUNCTION hdb_catalog.hdb_schema_update_event_notifier() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    instance_id uuid;
    occurred_at timestamptz;
    curr_rec record;
  BEGIN
    instance_id = NEW.instance_id;
    occurred_at = NEW.occurred_at;
    PERFORM pg_notify('hasura_schema_update', json_build_object(
      'instance_id', instance_id,
      'occurred_at', occurred_at
      )::text);
    RETURN curr_rec;
  END;
$$;


--
-- Name: inject_table_defaults(text, text, text, text); Type: FUNCTION; Schema: hdb_catalog; Owner: -
--

CREATE FUNCTION hdb_catalog.inject_table_defaults(view_schema text, view_name text, tab_schema text, tab_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        r RECORD;
    BEGIN
      FOR r IN SELECT column_name, column_default FROM information_schema.columns WHERE table_schema = tab_schema AND table_name = tab_name AND column_default IS NOT NULL LOOP
          EXECUTE format('ALTER VIEW %I.%I ALTER COLUMN %I SET DEFAULT %s;', view_schema, view_name, r.column_name, r.column_default);
      END LOOP;
    END;
$$;


--
-- Name: insert_event_log(text, text, text, text, json); Type: FUNCTION; Schema: hdb_catalog; Owner: -
--

CREATE FUNCTION hdb_catalog.insert_event_log(schema_name text, table_name text, trigger_name text, op text, row_data json) RETURNS text
    LANGUAGE plpgsql
    AS $$
  DECLARE
    id text;
    payload json;
    session_variables json;
    server_version_num int;
  BEGIN
    id := gen_random_uuid();
    server_version_num := current_setting('server_version_num');
    IF server_version_num >= 90600 THEN
      session_variables := current_setting('hasura.user', 't');
    ELSE
      BEGIN
        session_variables := current_setting('hasura.user');
      EXCEPTION WHEN OTHERS THEN
                  session_variables := NULL;
      END;
    END IF;
    payload := json_build_object(
      'op', op,
      'data', row_data,
      'session_variables', session_variables
    );
    INSERT INTO hdb_catalog.event_log
                (id, schema_name, table_name, trigger_name, payload)
    VALUES
    (id, schema_name, table_name, trigger_name, payload);
    RETURN id;
  END;
$$;


--
-- Name: default_modules_setup(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.default_modules_setup() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN
  INSERT INTO chat_settings (group_id) VALUES (NEW.id);
  RETURN NEW;
END $$;


--
-- Name: delete_group_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_group_profile() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN
  DELETE FROM profiles WHERE id = OLD.profile_id;
  RETURN OLD;
END $$;


--
-- Name: delete_message_content(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_message_content() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN
  DELETE FROM messages WHERE id = OLD.message_id;
  RETURN OLD;
END $$;


--
-- Name: delete_personal_space(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_personal_space() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN
  DELETE FROM groups WHERE id = OLD.personal_space_id;
  RETURN OLD;
END $$;


--
-- Name: member_set_default_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.member_set_default_profile() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  user_profile_id integer;
BEGIN
  SELECT profile_id INTO user_profile_id FROM groups INNER JOIN users ON groups.id = users.personal_space_id WHERE users.id = NEW.user_id;
  NEW.profile_id := user_profile_id;
  RETURN NEW;
END $$;


--
-- Name: root_groups_set_root_id_to_self(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.root_groups_set_root_id_to_self() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN
  IF NEW.parent_id IS NULL THEN
  	NEW.root_id = NEW.id;
  END IF;
  RETURN NEW;
END $$;


--
-- Name: user_set_member_personal_space(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_set_member_personal_space() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN
 	INSERT INTO members (user_id, group_id, type) VALUES (NEW.id, NEW.personal_space_id, 'owner');
 	RETURN NEW;
END $$;


SET default_tablespace = '';

--
-- Name: event_invocation_logs; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.event_invocation_logs (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: event_log; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.event_log (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    trigger_name text NOT NULL,
    payload jsonb NOT NULL,
    delivered boolean DEFAULT false NOT NULL,
    error boolean DEFAULT false NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    locked boolean DEFAULT false NOT NULL,
    next_retry_at timestamp without time zone,
    archived boolean DEFAULT false NOT NULL
);


--
-- Name: event_triggers; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.event_triggers (
    name text NOT NULL,
    type text NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    configuration json,
    comment text
);


--
-- Name: hdb_allowlist; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_allowlist (
    collection_name text
);


--
-- Name: hdb_check_constraint; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_check_constraint AS
 SELECT (n.nspname)::text AS table_schema,
    (ct.relname)::text AS table_name,
    (r.conname)::text AS constraint_name,
    pg_get_constraintdef(r.oid, true) AS "check"
   FROM ((pg_constraint r
     JOIN pg_class ct ON ((r.conrelid = ct.oid)))
     JOIN pg_namespace n ON ((ct.relnamespace = n.oid)))
  WHERE (r.contype = 'c'::"char");


--
-- Name: hdb_foreign_key_constraint; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_foreign_key_constraint AS
 SELECT (q.table_schema)::text AS table_schema,
    (q.table_name)::text AS table_name,
    (q.constraint_name)::text AS constraint_name,
    (min(q.constraint_oid))::integer AS constraint_oid,
    min((q.ref_table_table_schema)::text) AS ref_table_table_schema,
    min((q.ref_table)::text) AS ref_table,
    json_object_agg(ac.attname, afc.attname) AS column_mapping,
    min((q.confupdtype)::text) AS on_update,
    min((q.confdeltype)::text) AS on_delete,
    json_agg(ac.attname) AS columns,
    json_agg(afc.attname) AS ref_columns
   FROM ((( SELECT ctn.nspname AS table_schema,
            ct.relname AS table_name,
            r.conrelid AS table_id,
            r.conname AS constraint_name,
            r.oid AS constraint_oid,
            cftn.nspname AS ref_table_table_schema,
            cft.relname AS ref_table,
            r.confrelid AS ref_table_id,
            r.confupdtype,
            r.confdeltype,
            unnest(r.conkey) AS column_id,
            unnest(r.confkey) AS ref_column_id
           FROM ((((pg_constraint r
             JOIN pg_class ct ON ((r.conrelid = ct.oid)))
             JOIN pg_namespace ctn ON ((ct.relnamespace = ctn.oid)))
             JOIN pg_class cft ON ((r.confrelid = cft.oid)))
             JOIN pg_namespace cftn ON ((cft.relnamespace = cftn.oid)))
          WHERE (r.contype = 'f'::"char")) q
     JOIN pg_attribute ac ON (((q.column_id = ac.attnum) AND (q.table_id = ac.attrelid))))
     JOIN pg_attribute afc ON (((q.ref_column_id = afc.attnum) AND (q.ref_table_id = afc.attrelid))))
  GROUP BY q.table_schema, q.table_name, q.constraint_name;


--
-- Name: hdb_primary_key; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_primary_key AS
 SELECT tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    json_agg(constraint_column_usage.column_name) AS columns
   FROM (information_schema.table_constraints tc
     JOIN ( SELECT x.tblschema AS table_schema,
            x.tblname AS table_name,
            x.colname AS column_name,
            x.cstrname AS constraint_name
           FROM ( SELECT DISTINCT nr.nspname,
                    r.relname,
                    a.attname,
                    c.conname
                   FROM pg_namespace nr,
                    pg_class r,
                    pg_attribute a,
                    pg_depend d,
                    pg_namespace nc,
                    pg_constraint c
                  WHERE ((nr.oid = r.relnamespace) AND (r.oid = a.attrelid) AND (d.refclassid = ('pg_class'::regclass)::oid) AND (d.refobjid = r.oid) AND (d.refobjsubid = a.attnum) AND (d.classid = ('pg_constraint'::regclass)::oid) AND (d.objid = c.oid) AND (c.connamespace = nc.oid) AND (c.contype = 'c'::"char") AND (r.relkind = ANY (ARRAY['r'::"char", 'p'::"char"])) AND (NOT a.attisdropped))
                UNION ALL
                 SELECT nr.nspname,
                    r.relname,
                    a.attname,
                    c.conname
                   FROM pg_namespace nr,
                    pg_class r,
                    pg_attribute a,
                    pg_namespace nc,
                    pg_constraint c
                  WHERE ((nr.oid = r.relnamespace) AND (r.oid = a.attrelid) AND (nc.oid = c.connamespace) AND (r.oid =
                        CASE c.contype
                            WHEN 'f'::"char" THEN c.confrelid
                            ELSE c.conrelid
                        END) AND (a.attnum = ANY (
                        CASE c.contype
                            WHEN 'f'::"char" THEN c.confkey
                            ELSE c.conkey
                        END)) AND (NOT a.attisdropped) AND (c.contype = ANY (ARRAY['p'::"char", 'u'::"char", 'f'::"char"])) AND (r.relkind = ANY (ARRAY['r'::"char", 'p'::"char"])))) x(tblschema, tblname, colname, cstrname)) constraint_column_usage ON ((((tc.constraint_name)::text = (constraint_column_usage.constraint_name)::text) AND ((tc.table_schema)::text = (constraint_column_usage.table_schema)::text) AND ((tc.table_name)::text = (constraint_column_usage.table_name)::text))))
  WHERE ((tc.constraint_type)::text = 'PRIMARY KEY'::text)
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name;


--
-- Name: hdb_column; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_column AS
 WITH primary_key_references AS (
         SELECT fkey.table_schema AS src_table_schema,
            fkey.table_name AS src_table_name,
            (fkey.columns ->> 0) AS src_column_name,
            json_agg(json_build_object('schema', fkey.ref_table_table_schema, 'name', fkey.ref_table)) AS ref_tables
           FROM (hdb_catalog.hdb_foreign_key_constraint fkey
             JOIN hdb_catalog.hdb_primary_key pkey ON ((((pkey.table_schema)::text = fkey.ref_table_table_schema) AND ((pkey.table_name)::text = fkey.ref_table) AND ((pkey.columns)::jsonb = (fkey.ref_columns)::jsonb))))
          WHERE (json_array_length(fkey.columns) = 1)
          GROUP BY fkey.table_schema, fkey.table_name, (fkey.columns ->> 0)
        )
 SELECT columns.table_schema,
    columns.table_name,
    columns.column_name AS name,
    columns.udt_name AS type,
    columns.is_nullable,
    columns.ordinal_position,
    COALESCE(pkey_refs.ref_tables, '[]'::json) AS primary_key_references,
    col_description(pg_class.oid, (columns.ordinal_position)::integer) AS description
   FROM (((information_schema.columns
     JOIN pg_class ON ((pg_class.relname = (columns.table_name)::name)))
     JOIN pg_namespace ON (((pg_namespace.oid = pg_class.relnamespace) AND (pg_namespace.nspname = (columns.table_schema)::name))))
     LEFT JOIN primary_key_references pkey_refs ON ((((columns.table_schema)::text = pkey_refs.src_table_schema) AND ((columns.table_name)::text = pkey_refs.src_table_name) AND ((columns.column_name)::text = pkey_refs.src_column_name))));


--
-- Name: hdb_computed_field; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_computed_field (
    table_schema text NOT NULL,
    table_name text NOT NULL,
    computed_field_name text NOT NULL,
    definition jsonb NOT NULL,
    comment text
);


--
-- Name: hdb_computed_field_function; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_computed_field_function AS
 SELECT hdb_computed_field.table_schema,
    hdb_computed_field.table_name,
    hdb_computed_field.computed_field_name,
        CASE
            WHEN (((hdb_computed_field.definition -> 'function'::text) ->> 'name'::text) IS NULL) THEN (hdb_computed_field.definition ->> 'function'::text)
            ELSE ((hdb_computed_field.definition -> 'function'::text) ->> 'name'::text)
        END AS function_name,
        CASE
            WHEN (((hdb_computed_field.definition -> 'function'::text) ->> 'schema'::text) IS NULL) THEN 'public'::text
            ELSE ((hdb_computed_field.definition -> 'function'::text) ->> 'schema'::text)
        END AS function_schema
   FROM hdb_catalog.hdb_computed_field;


--
-- Name: hdb_function; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_function (
    function_schema text NOT NULL,
    function_name text NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system_defined boolean DEFAULT false
);


--
-- Name: hdb_function_agg; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_function_agg AS
 SELECT (p.proname)::text AS function_name,
    (pn.nspname)::text AS function_schema,
    pd.description,
        CASE
            WHEN (p.provariadic = (0)::oid) THEN false
            ELSE true
        END AS has_variadic,
        CASE
            WHEN ((p.provolatile)::text = ('i'::character(1))::text) THEN 'IMMUTABLE'::text
            WHEN ((p.provolatile)::text = ('s'::character(1))::text) THEN 'STABLE'::text
            WHEN ((p.provolatile)::text = ('v'::character(1))::text) THEN 'VOLATILE'::text
            ELSE NULL::text
        END AS function_type,
    pg_get_functiondef(p.oid) AS function_definition,
    (rtn.nspname)::text AS return_type_schema,
    (rt.typname)::text AS return_type_name,
    (rt.typtype)::text AS return_type_type,
    p.proretset AS returns_set,
    ( SELECT COALESCE(json_agg(json_build_object('schema', q.schema, 'name', q.name, 'type', q.type)), '[]'::json) AS "coalesce"
           FROM ( SELECT pt.typname AS name,
                    pns.nspname AS schema,
                    pt.typtype AS type,
                    pat.ordinality
                   FROM ((unnest(COALESCE(p.proallargtypes, (p.proargtypes)::oid[])) WITH ORDINALITY pat(oid, ordinality)
                     LEFT JOIN pg_type pt ON ((pt.oid = pat.oid)))
                     LEFT JOIN pg_namespace pns ON ((pt.typnamespace = pns.oid)))
                  ORDER BY pat.ordinality) q) AS input_arg_types,
    to_json(COALESCE(p.proargnames, ARRAY[]::text[])) AS input_arg_names,
    p.pronargdefaults AS default_args,
    (p.oid)::integer AS function_oid
   FROM ((((pg_proc p
     JOIN pg_namespace pn ON ((pn.oid = p.pronamespace)))
     JOIN pg_type rt ON ((rt.oid = p.prorettype)))
     JOIN pg_namespace rtn ON ((rtn.oid = rt.typnamespace)))
     LEFT JOIN pg_description pd ON ((p.oid = pd.objoid)))
  WHERE (((pn.nspname)::text !~~ 'pg_%'::text) AND ((pn.nspname)::text <> ALL (ARRAY['information_schema'::text, 'hdb_catalog'::text, 'hdb_views'::text])) AND (NOT (EXISTS ( SELECT 1
           FROM pg_aggregate
          WHERE ((pg_aggregate.aggfnoid)::oid = p.oid)))));


--
-- Name: hdb_function_info_agg; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_function_info_agg AS
 SELECT hdb_function_agg.function_name,
    hdb_function_agg.function_schema,
    row_to_json(( SELECT e.*::record AS e
           FROM ( SELECT hdb_function_agg.description,
                    hdb_function_agg.has_variadic,
                    hdb_function_agg.function_type,
                    hdb_function_agg.return_type_schema,
                    hdb_function_agg.return_type_name,
                    hdb_function_agg.return_type_type,
                    hdb_function_agg.returns_set,
                    hdb_function_agg.input_arg_types,
                    hdb_function_agg.input_arg_names,
                    hdb_function_agg.default_args,
                    (EXISTS ( SELECT 1
                           FROM information_schema.tables
                          WHERE (((tables.table_schema)::text = hdb_function_agg.return_type_schema) AND ((tables.table_name)::text = hdb_function_agg.return_type_name)))) AS returns_table) e)) AS function_info
   FROM hdb_catalog.hdb_function_agg;


--
-- Name: hdb_permission; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_permission (
    table_schema text NOT NULL,
    table_name text NOT NULL,
    role_name text NOT NULL,
    perm_type text NOT NULL,
    perm_def jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false,
    CONSTRAINT hdb_permission_perm_type_check CHECK ((perm_type = ANY (ARRAY['insert'::text, 'select'::text, 'update'::text, 'delete'::text])))
);


--
-- Name: hdb_permission_agg; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_permission_agg AS
 SELECT hdb_permission.table_schema,
    hdb_permission.table_name,
    hdb_permission.role_name,
    json_object_agg(hdb_permission.perm_type, hdb_permission.perm_def) AS permissions
   FROM hdb_catalog.hdb_permission
  GROUP BY hdb_permission.table_schema, hdb_permission.table_name, hdb_permission.role_name;


--
-- Name: hdb_query_collection; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_query_collection (
    collection_name text NOT NULL,
    collection_defn jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false
);


--
-- Name: hdb_relationship; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_relationship (
    table_schema text NOT NULL,
    table_name text NOT NULL,
    rel_name text NOT NULL,
    rel_type text,
    rel_def jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false,
    CONSTRAINT hdb_relationship_rel_type_check CHECK ((rel_type = ANY (ARRAY['object'::text, 'array'::text])))
);


--
-- Name: hdb_schema_update_event; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_schema_update_event (
    instance_id uuid NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: hdb_table; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_table (
    table_schema text NOT NULL,
    table_name text NOT NULL,
    configuration jsonb,
    is_system_defined boolean DEFAULT false,
    is_enum boolean DEFAULT false NOT NULL
);


--
-- Name: hdb_table_info_agg; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_table_info_agg AS
 SELECT tables.table_name,
    tables.table_schema,
    descriptions.description,
    COALESCE(columns.columns, '[]'::json) AS columns,
    COALESCE(pk.columns, '[]'::json) AS primary_key_columns,
    COALESCE(constraints.constraints, '[]'::json) AS constraints,
    COALESCE(views.view_info, 'null'::json) AS view_info
   FROM (((((information_schema.tables tables
     LEFT JOIN ( SELECT c.table_name,
            c.table_schema,
            json_agg(json_build_object('name', c.name, 'type', c.type, 'is_nullable', (c.is_nullable)::boolean, 'references', c.primary_key_references, 'description', c.description)) AS columns
           FROM hdb_catalog.hdb_column c
          GROUP BY c.table_schema, c.table_name) columns ON ((((tables.table_schema)::text = (columns.table_schema)::text) AND ((tables.table_name)::text = (columns.table_name)::text))))
     LEFT JOIN ( SELECT hdb_primary_key.table_schema,
            hdb_primary_key.table_name,
            hdb_primary_key.constraint_name,
            hdb_primary_key.columns
           FROM hdb_catalog.hdb_primary_key) pk ON ((((tables.table_schema)::text = (pk.table_schema)::text) AND ((tables.table_name)::text = (pk.table_name)::text))))
     LEFT JOIN ( SELECT c.table_schema,
            c.table_name,
            json_agg(c.constraint_name) AS constraints
           FROM information_schema.table_constraints c
          WHERE (((c.constraint_type)::text = 'UNIQUE'::text) OR ((c.constraint_type)::text = 'PRIMARY KEY'::text))
          GROUP BY c.table_schema, c.table_name) constraints ON ((((tables.table_schema)::text = (constraints.table_schema)::text) AND ((tables.table_name)::text = (constraints.table_name)::text))))
     LEFT JOIN ( SELECT v.table_schema,
            v.table_name,
            json_build_object('is_updatable', ((v.is_updatable)::boolean OR (v.is_trigger_updatable)::boolean), 'is_deletable', ((v.is_updatable)::boolean OR (v.is_trigger_deletable)::boolean), 'is_insertable', ((v.is_insertable_into)::boolean OR (v.is_trigger_insertable_into)::boolean)) AS view_info
           FROM information_schema.views v) views ON ((((tables.table_schema)::text = (views.table_schema)::text) AND ((tables.table_name)::text = (views.table_name)::text))))
     LEFT JOIN ( SELECT pc.relname AS table_name,
            pn.nspname AS table_schema,
            pd.description
           FROM ((pg_class pc
             LEFT JOIN pg_namespace pn ON ((pn.oid = pc.relnamespace)))
             LEFT JOIN pg_description pd ON ((pd.objoid = pc.oid)))
          WHERE (pd.objsubid = 0)) descriptions ON ((((tables.table_schema)::name = descriptions.table_schema) AND ((tables.table_name)::name = descriptions.table_name))));


--
-- Name: hdb_unique_constraint; Type: VIEW; Schema: hdb_catalog; Owner: -
--

CREATE VIEW hdb_catalog.hdb_unique_constraint AS
 SELECT tc.table_name,
    tc.constraint_schema AS table_schema,
    tc.constraint_name,
    json_agg(kcu.column_name) AS columns
   FROM (information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu USING (constraint_schema, constraint_name))
  WHERE ((tc.constraint_type)::text = 'UNIQUE'::text)
  GROUP BY tc.table_name, tc.constraint_schema, tc.constraint_name;


--
-- Name: hdb_version; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.hdb_version (
    hasura_uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    version text NOT NULL,
    upgraded_on timestamp with time zone NOT NULL,
    cli_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    console_state jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: remote_schemas; Type: TABLE; Schema: hdb_catalog; Owner: -
--

CREATE TABLE hdb_catalog.remote_schemas (
    id bigint NOT NULL,
    name text,
    definition json,
    comment text
);


--
-- Name: remote_schemas_id_seq; Type: SEQUENCE; Schema: hdb_catalog; Owner: -
--

CREATE SEQUENCE hdb_catalog.remote_schemas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: remote_schemas_id_seq; Type: SEQUENCE OWNED BY; Schema: hdb_catalog; Owner: -
--

ALTER SEQUENCE hdb_catalog.remote_schemas_id_seq OWNED BY hdb_catalog.remote_schemas.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    user_id text NOT NULL,
    group_id integer NOT NULL,
    type text DEFAULT 'member'::text NOT NULL,
    profile_id integer NOT NULL,
    private_messages boolean DEFAULT true NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    last_exit timestamp with time zone DEFAULT now() NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "last seen is updated" CHECK (((joined_at <= last_exit) AND (last_seen >= last_exit)))
);


--
-- Name: active_members; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_members AS
 SELECT members.group_id,
    members.user_id,
    members.last_seen
   FROM public.members
  WHERE (members.last_seen >= (now() - '1 mon'::interval))
  ORDER BY members.last_seen DESC;


--
-- Name: active_groups; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_groups AS
 SELECT DISTINCT active_members.group_id
   FROM public.active_members;


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id integer NOT NULL,
    path text NOT NULL,
    type text DEFAULT 'group'::text NOT NULL,
    root_id integer NOT NULL,
    parent_id integer,
    is_accessible boolean DEFAULT true NOT NULL,
    profile_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "parent is not self" CHECK ((parent_id <> id))
);


--
-- Name: active_root_groups; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_root_groups AS
 SELECT active_groups.group_id,
    groups.path
   FROM (public.active_groups
     JOIN public.groups ON ((active_groups.group_id = groups.id)))
  WHERE ((groups.parent_id IS NULL) AND (groups.type <> 'user'::text));


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email public.citext NOT NULL,
    username public.citext NOT NULL,
    last_login timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    personal_space_id integer NOT NULL
);


--
-- Name: active_users; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_users AS
 SELECT users.id,
    users.username,
    users.last_login
   FROM public.users
  WHERE (users.last_login >= (now() - '1 mon'::interval))
  ORDER BY users.last_login DESC;


--
-- Name: chat_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_settings (
    group_id integer NOT NULL,
    is_public boolean DEFAULT false NOT NULL
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    group_id integer NOT NULL,
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL
);


--
-- Name: group_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_messages (
    message_id bigint NOT NULL,
    group_id integer NOT NULL,
    sender_id text NOT NULL,
    parent_id bigint
);


--
-- Name: group_topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_topics (
    group_id integer NOT NULL,
    topic text NOT NULL
);


--
-- Name: group_type_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_type_indicators (
    group_id integer NOT NULL,
    sender_id text NOT NULL
);


--
-- Name: group_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_types (
    name text NOT NULL
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.groups_id_seq OWNED BY public.groups.id;


--
-- Name: member_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_messages (
    message_id bigint NOT NULL,
    group_id integer NOT NULL,
    sender_id text NOT NULL,
    receiver_id text NOT NULL,
    read_at timestamp with time zone,
    parent_id bigint
);


--
-- Name: member_type_indicators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_type_indicators (
    group_id integer NOT NULL,
    sender_id text NOT NULL,
    receiver_id text NOT NULL
);


--
-- Name: member_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_types (
    name text NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    text text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: online_members; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.online_members AS
 SELECT members.group_id,
    members.user_id,
    members.last_seen
   FROM public.members
  WHERE (members.last_seen > members.last_exit);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    image text,
    banner text,
    is_public boolean DEFAULT true NOT NULL
);


--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    name text NOT NULL
);


--
-- Name: remote_schemas id; Type: DEFAULT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.remote_schemas ALTER COLUMN id SET DEFAULT nextval('hdb_catalog.remote_schemas_id_seq'::regclass);


--
-- Name: groups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups ALTER COLUMN id SET DEFAULT nextval('public.groups_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Data for Name: event_invocation_logs; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.event_invocation_logs (id, event_id, status, request, response, created_at) FROM stdin;
\.


--
-- Data for Name: event_log; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.event_log (id, schema_name, table_name, trigger_name, payload, delivered, error, tries, created_at, locked, next_retry_at, archived) FROM stdin;
\.


--
-- Data for Name: event_triggers; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.event_triggers (name, type, schema_name, table_name, configuration, comment) FROM stdin;
\.


--
-- Data for Name: hdb_allowlist; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_allowlist (collection_name) FROM stdin;
\.


--
-- Data for Name: hdb_computed_field; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_computed_field (table_schema, table_name, computed_field_name, definition, comment) FROM stdin;
\.


--
-- Data for Name: hdb_function; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_function (function_schema, function_name, configuration, is_system_defined) FROM stdin;
\.


--
-- Data for Name: hdb_permission; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_permission (table_schema, table_name, role_name, perm_type, perm_def, comment, is_system_defined) FROM stdin;
\.


--
-- Data for Name: hdb_query_collection; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_query_collection (collection_name, collection_defn, comment, is_system_defined) FROM stdin;
\.


--
-- Data for Name: hdb_relationship; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_relationship (table_schema, table_name, rel_name, rel_type, rel_def, comment, is_system_defined) FROM stdin;
hdb_catalog	hdb_table	detail	object	{"manual_configuration": {"remote_table": {"name": "tables", "schema": "information_schema"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	primary_key	object	{"manual_configuration": {"remote_table": {"name": "hdb_primary_key", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	columns	array	{"manual_configuration": {"remote_table": {"name": "columns", "schema": "information_schema"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	foreign_key_constraints	array	{"manual_configuration": {"remote_table": {"name": "hdb_foreign_key_constraint", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	relationships	array	{"manual_configuration": {"remote_table": {"name": "hdb_relationship", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	permissions	array	{"manual_configuration": {"remote_table": {"name": "hdb_permission_agg", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	check_constraints	array	{"manual_configuration": {"remote_table": {"name": "hdb_check_constraint", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	hdb_table	unique_constraints	array	{"manual_configuration": {"remote_table": {"name": "hdb_unique_constraint", "schema": "hdb_catalog"}, "column_mapping": {"table_name": "table_name", "table_schema": "table_schema"}}}	\N	t
hdb_catalog	event_log	trigger	object	{"manual_configuration": {"remote_table": {"name": "event_triggers", "schema": "hdb_catalog"}, "column_mapping": {"trigger_name": "name"}}}	\N	t
hdb_catalog	event_triggers	events	array	{"manual_configuration": {"remote_table": {"name": "event_log", "schema": "hdb_catalog"}, "column_mapping": {"name": "trigger_name"}}}	\N	t
hdb_catalog	event_invocation_logs	event	object	{"foreign_key_constraint_on": "event_id"}	\N	t
hdb_catalog	event_log	logs	array	{"foreign_key_constraint_on": {"table": {"name": "event_invocation_logs", "schema": "hdb_catalog"}, "column": "event_id"}}	\N	t
hdb_catalog	hdb_function_agg	return_table_info	object	{"manual_configuration": {"remote_table": {"name": "hdb_table", "schema": "hdb_catalog"}, "column_mapping": {"return_type_name": "table_name", "return_type_schema": "table_schema"}}}	\N	t
public	users	personal_space	object	{"foreign_key_constraint_on": "personal_space_id"}	\N	f
public	groups	root	object	{"foreign_key_constraint_on": "root_id"}	\N	f
public	groups	profile	object	{"foreign_key_constraint_on": "profile_id"}	\N	f
public	groups	parent	object	{"foreign_key_constraint_on": "parent_id"}	\N	f
public	groups	children	array	{"foreign_key_constraint_on": {"table": "groups", "column": "root_id"}}	\N	f
public	groups	subgroups	array	{"foreign_key_constraint_on": {"table": "groups", "column": "parent_id"}}	\N	f
public	groups	topics	array	{"foreign_key_constraint_on": {"table": "group_topics", "column": "group_id"}}	\N	f
public	groups	event	object	{"manual_configuration": {"remote_table": "events", "column_mapping": {"id": "group_id"}}}	\N	f
public	members	profile	object	{"foreign_key_constraint_on": "profile_id"}	\N	f
public	members	user	object	{"foreign_key_constraint_on": "user_id"}	\N	f
public	groups	members	array	{"foreign_key_constraint_on": {"table": "members", "column": "group_id"}}	\N	f
public	group_messages	message	object	{"foreign_key_constraint_on": "message_id"}	\N	f
public	group_messages	group	object	{"foreign_key_constraint_on": "group_id"}	\N	f
public	group_messages	sender	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"group_id": "group_id", "sender_id": "user_id"}}}	\N	f
public	group_messages	parent	object	{"foreign_key_constraint_on": "parent_id"}	\N	f
public	member_messages	message	object	{"foreign_key_constraint_on": "message_id"}	\N	f
public	member_messages	group	object	{"foreign_key_constraint_on": "group_id"}	\N	f
public	member_messages	sender	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"group_id": "group_id", "sender_id": "user_id"}}}	\N	f
public	member_messages	receiver	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"group_id": "group_id", "receiver_id": "user_id"}}}	\N	f
public	member_messages	parent	object	{"foreign_key_constraint_on": "parent_id"}	\N	f
public	groups	messages	array	{"foreign_key_constraint_on": {"table": "group_messages", "column": "group_id"}}	\N	f
public	group_type_indicators	sender	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"group_id": "group_id", "sender_id": "user_id"}}}	\N	f
public	member_type_indicators	sender	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"group_id": "group_id", "sender_id": "user_id"}}}	\N	f
public	member_type_indicators	receiver	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"group_id": "group_id", "receiver_id": "user_id"}}}	\N	f
public	users	members	array	{"foreign_key_constraint_on": {"table": "members", "column": "user_id"}}	\N	f
public	chat_settings	group	object	{"foreign_key_constraint_on": "group_id"}	\N	f
public	groups	chat_settings	object	{"manual_configuration": {"remote_table": "chat_settings", "column_mapping": {"id": "group_id"}}}	\N	f
public	members	group	object	{"foreign_key_constraint_on": "group_id"}	\N	f
public	online_members	group	object	{"manual_configuration": {"remote_table": "groups", "column_mapping": {"group_id": "id"}}}	\N	f
public	online_members	user	object	{"manual_configuration": {"remote_table": "users", "column_mapping": {"user_id": "id"}}}	\N	f
public	active_groups	group	object	{"manual_configuration": {"remote_table": "groups", "column_mapping": {"group_id": "id"}}}	\N	f
public	active_users	user	object	{"manual_configuration": {"remote_table": "users", "column_mapping": {"id": "id"}}}	\N	f
public	active_root_groups	group	object	{"manual_configuration": {"remote_table": "groups", "column_mapping": {"group_id": "id"}}}	\N	f
public	active_members	member	object	{"manual_configuration": {"remote_table": "members", "column_mapping": {"user_id": "user_id", "group_id": "group_id"}}}	\N	f
\.


--
-- Data for Name: hdb_schema_update_event; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_schema_update_event (instance_id, occurred_at) FROM stdin;
b5ce0d39-a845-46ca-a1ec-bc8d40330b6c	2020-02-05 20:54:44.943867+00
\.


--
-- Data for Name: hdb_table; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_table (table_schema, table_name, configuration, is_system_defined, is_enum) FROM stdin;
hdb_catalog	hdb_table	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
information_schema	tables	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
information_schema	schemata	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
information_schema	views	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_primary_key	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
information_schema	columns	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_foreign_key_constraint	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_relationship	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_permission_agg	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_check_constraint	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_unique_constraint	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	event_triggers	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	event_log	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	event_invocation_logs	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_function_agg	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_function	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	remote_schemas	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_version	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_query_collection	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
hdb_catalog	hdb_allowlist	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	t	f
public	users	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	profiles	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	messages	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	members	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	group_types	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	t
public	groups	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	topics	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	group_topics	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	events	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	chat_settings	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	group_messages	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	member_messages	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	group_type_indicators	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	member_type_indicators	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	member_types	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	t
public	online_members	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	active_members	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	active_groups	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	active_users	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
public	active_root_groups	{"custom_root_fields": {"delete": null, "insert": null, "select": null, "update": null, "select_by_pk": null, "select_aggregate": null}, "custom_column_names": {}}	f	f
\.


--
-- Data for Name: hdb_version; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.hdb_version (hasura_uuid, version, upgraded_on, cli_state, console_state) FROM stdin;
814fd0d5-54d8-4222-b935-7f0246ae2b3e	28	2020-01-21 18:34:52.316536+00	{}	{"telemetryNotificationShown": true}
\.


--
-- Data for Name: remote_schemas; Type: TABLE DATA; Schema: hdb_catalog; Owner: -
--

COPY hdb_catalog.remote_schemas (id, name, definition, comment) FROM stdin;
\.


--
-- Data for Name: chat_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chat_settings (group_id, is_public) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (group_id, start, "end") FROM stdin;
\.


--
-- Data for Name: group_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_messages (message_id, group_id, sender_id, parent_id) FROM stdin;
\.


--
-- Data for Name: group_topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_topics (group_id, topic) FROM stdin;
\.


--
-- Data for Name: group_type_indicators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_type_indicators (group_id, sender_id) FROM stdin;
\.


--
-- Data for Name: group_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_types (name) FROM stdin;
event
user
group
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, path, type, root_id, parent_id, is_accessible, profile_id, created_at) FROM stdin;
\.


--
-- Data for Name: member_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_messages (message_id, group_id, sender_id, receiver_id, read_at, parent_id) FROM stdin;
\.


--
-- Data for Name: member_type_indicators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_type_indicators (group_id, sender_id, receiver_id) FROM stdin;
\.


--
-- Data for Name: member_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_types (name) FROM stdin;
owner
admin
member
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (user_id, group_id, type, profile_id, private_messages, last_seen, last_exit, joined_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, text, created_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, name, description, image, banner, is_public) FROM stdin;
\.


--
-- Data for Name: topics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.topics (name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, username, last_login, created_at, personal_space_id) FROM stdin;
\.


--
-- Name: remote_schemas_id_seq; Type: SEQUENCE SET; Schema: hdb_catalog; Owner: -
--

SELECT pg_catalog.setval('hdb_catalog.remote_schemas_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.groups_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profiles_id_seq', 1, false);


--
-- Name: event_invocation_logs event_invocation_logs_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_pkey PRIMARY KEY (id);


--
-- Name: event_log event_log_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_log
    ADD CONSTRAINT event_log_pkey PRIMARY KEY (id);


--
-- Name: event_triggers event_triggers_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_triggers
    ADD CONSTRAINT event_triggers_pkey PRIMARY KEY (name);


--
-- Name: hdb_allowlist hdb_allowlist_collection_name_key; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_allowlist
    ADD CONSTRAINT hdb_allowlist_collection_name_key UNIQUE (collection_name);


--
-- Name: hdb_computed_field hdb_computed_field_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_computed_field
    ADD CONSTRAINT hdb_computed_field_pkey PRIMARY KEY (table_schema, table_name, computed_field_name);


--
-- Name: hdb_function hdb_function_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_function
    ADD CONSTRAINT hdb_function_pkey PRIMARY KEY (function_schema, function_name);


--
-- Name: hdb_permission hdb_permission_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_permission
    ADD CONSTRAINT hdb_permission_pkey PRIMARY KEY (table_schema, table_name, role_name, perm_type);


--
-- Name: hdb_query_collection hdb_query_collection_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_query_collection
    ADD CONSTRAINT hdb_query_collection_pkey PRIMARY KEY (collection_name);


--
-- Name: hdb_relationship hdb_relationship_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_relationship
    ADD CONSTRAINT hdb_relationship_pkey PRIMARY KEY (table_schema, table_name, rel_name);


--
-- Name: hdb_table hdb_table_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_table
    ADD CONSTRAINT hdb_table_pkey PRIMARY KEY (table_schema, table_name);


--
-- Name: hdb_version hdb_version_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_version
    ADD CONSTRAINT hdb_version_pkey PRIMARY KEY (hasura_uuid);


--
-- Name: remote_schemas remote_schemas_name_key; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.remote_schemas
    ADD CONSTRAINT remote_schemas_name_key UNIQUE (name);


--
-- Name: remote_schemas remote_schemas_pkey; Type: CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.remote_schemas
    ADD CONSTRAINT remote_schemas_pkey PRIMARY KEY (id);


--
-- Name: chat_settings chat_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_settings
    ADD CONSTRAINT chat_settings_pkey PRIMARY KEY (group_id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (group_id);


--
-- Name: group_messages group_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_pkey PRIMARY KEY (message_id);


--
-- Name: group_topics group_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_topics
    ADD CONSTRAINT group_topics_pkey PRIMARY KEY (group_id, topic);


--
-- Name: group_type_indicators group_type_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_type_indicators
    ADD CONSTRAINT group_type_indicators_pkey PRIMARY KEY (group_id, sender_id);


--
-- Name: group_types group_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_types
    ADD CONSTRAINT group_types_pkey PRIMARY KEY (name);


--
-- Name: groups groups_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_path_key UNIQUE (path);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: groups groups_profile_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_profile_key UNIQUE (profile_id);


--
-- Name: member_messages member_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_messages
    ADD CONSTRAINT member_messages_pkey PRIMARY KEY (message_id);


--
-- Name: member_type_indicators member_type_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_type_indicators
    ADD CONSTRAINT member_type_indicators_pkey PRIMARY KEY (group_id, sender_id, receiver_id);


--
-- Name: member_types member_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_types
    ADD CONSTRAINT member_types_pkey PRIMARY KEY (name);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (user_id, group_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_personal_space_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_personal_space_id_key UNIQUE (personal_space_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: event_invocation_logs_event_id_idx; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_invocation_logs_event_id_idx ON hdb_catalog.event_invocation_logs USING btree (event_id);


--
-- Name: event_log_delivered_idx; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_log_delivered_idx ON hdb_catalog.event_log USING btree (delivered);


--
-- Name: event_log_locked_idx; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_log_locked_idx ON hdb_catalog.event_log USING btree (locked);


--
-- Name: event_log_trigger_name_idx; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE INDEX event_log_trigger_name_idx ON hdb_catalog.event_log USING btree (trigger_name);


--
-- Name: hdb_schema_update_event_one_row; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE UNIQUE INDEX hdb_schema_update_event_one_row ON hdb_catalog.hdb_schema_update_event USING btree (((occurred_at IS NOT NULL)));


--
-- Name: hdb_version_one_row; Type: INDEX; Schema: hdb_catalog; Owner: -
--

CREATE UNIQUE INDEX hdb_version_one_row ON hdb_catalog.hdb_version USING btree (((version IS NOT NULL)));


--
-- Name: group_messages_group_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX group_messages_group_key ON public.group_messages USING btree (group_id);


--
-- Name: groups_root_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX groups_root_key ON public.groups USING btree (root_id);


--
-- Name: member_messages_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX member_messages_key ON public.member_messages USING btree (group_id, sender_id, receiver_id);


--
-- Name: hdb_schema_update_event hdb_schema_update_event_notifier; Type: TRIGGER; Schema: hdb_catalog; Owner: -
--

CREATE TRIGGER hdb_schema_update_event_notifier AFTER INSERT OR UPDATE ON hdb_catalog.hdb_schema_update_event FOR EACH ROW EXECUTE PROCEDURE hdb_catalog.hdb_schema_update_event_notifier();


--
-- Name: groups default_modules_setup; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER default_modules_setup AFTER INSERT ON public.groups FOR EACH ROW EXECUTE PROCEDURE public.default_modules_setup();


--
-- Name: groups delete_group_profile; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_group_profile AFTER DELETE ON public.groups FOR EACH ROW EXECUTE PROCEDURE public.delete_group_profile();


--
-- Name: group_messages delete_message_content; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_message_content AFTER DELETE ON public.group_messages FOR EACH ROW EXECUTE PROCEDURE public.delete_message_content();


--
-- Name: member_messages delete_message_content; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_message_content AFTER DELETE ON public.member_messages FOR EACH ROW EXECUTE PROCEDURE public.delete_message_content();


--
-- Name: users delete_personal_space; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER delete_personal_space AFTER DELETE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.delete_personal_space();


--
-- Name: members join_member_set_default_profile; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER join_member_set_default_profile BEFORE INSERT ON public.members FOR EACH ROW EXECUTE PROCEDURE public.member_set_default_profile();


--
-- Name: groups root_groups_set_root_id_to_self; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER root_groups_set_root_id_to_self BEFORE INSERT ON public.groups FOR EACH ROW EXECUTE PROCEDURE public.root_groups_set_root_id_to_self();


--
-- Name: users user_set_member_personal_space; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_set_member_personal_space AFTER INSERT ON public.users FOR EACH ROW EXECUTE PROCEDURE public.user_set_member_personal_space();


--
-- Name: event_invocation_logs event_invocation_logs_event_id_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.event_log(id);


--
-- Name: event_triggers event_triggers_schema_name_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.event_triggers
    ADD CONSTRAINT event_triggers_schema_name_fkey FOREIGN KEY (schema_name, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;


--
-- Name: hdb_allowlist hdb_allowlist_collection_name_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_allowlist
    ADD CONSTRAINT hdb_allowlist_collection_name_fkey FOREIGN KEY (collection_name) REFERENCES hdb_catalog.hdb_query_collection(collection_name);


--
-- Name: hdb_computed_field hdb_computed_field_table_schema_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_computed_field
    ADD CONSTRAINT hdb_computed_field_table_schema_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;


--
-- Name: hdb_permission hdb_permission_table_schema_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_permission
    ADD CONSTRAINT hdb_permission_table_schema_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;


--
-- Name: hdb_relationship hdb_relationship_table_schema_fkey; Type: FK CONSTRAINT; Schema: hdb_catalog; Owner: -
--

ALTER TABLE ONLY hdb_catalog.hdb_relationship
    ADD CONSTRAINT hdb_relationship_table_schema_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;


--
-- Name: chat_settings chat_settings_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_settings
    ADD CONSTRAINT chat_settings_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: events events_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_messages group_messages_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_messages group_messages_group_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_group_id_fkey1 FOREIGN KEY (group_id, sender_id) REFERENCES public.members(group_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_messages group_messages_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_messages group_messages_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_messages
    ADD CONSTRAINT group_messages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.group_messages(message_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_topics group_topics_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_topics
    ADD CONSTRAINT group_topics_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_topics group_topics_topic_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_topics
    ADD CONSTRAINT group_topics_topic_fkey FOREIGN KEY (topic) REFERENCES public.topics(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_type_indicators group_type_indicators_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_type_indicators
    ADD CONSTRAINT group_type_indicators_group_id_fkey FOREIGN KEY (group_id, sender_id) REFERENCES public.members(group_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups groups_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_parent_fkey FOREIGN KEY (parent_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups groups_profile_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_profile_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: groups groups_root_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_root_fkey FOREIGN KEY (root_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: groups groups_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_type_fkey FOREIGN KEY (type) REFERENCES public.group_types(name) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: member_messages member_messages_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_messages
    ADD CONSTRAINT member_messages_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_messages member_messages_group_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_messages
    ADD CONSTRAINT member_messages_group_id_fkey1 FOREIGN KEY (group_id, sender_id) REFERENCES public.members(group_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_messages member_messages_group_id_fkey2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_messages
    ADD CONSTRAINT member_messages_group_id_fkey2 FOREIGN KEY (group_id, receiver_id) REFERENCES public.members(group_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_messages member_messages_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_messages
    ADD CONSTRAINT member_messages_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_messages member_messages_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_messages
    ADD CONSTRAINT member_messages_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.member_messages(message_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_type_indicators member_type_indicators_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_type_indicators
    ADD CONSTRAINT member_type_indicators_group_id_fkey FOREIGN KEY (group_id, sender_id) REFERENCES public.members(group_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: member_type_indicators member_type_indicators_group_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_type_indicators
    ADD CONSTRAINT member_type_indicators_group_id_fkey1 FOREIGN KEY (group_id, receiver_id) REFERENCES public.members(group_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: members members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: members members_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;


--
-- Name: members members_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_type_fkey FOREIGN KEY (type) REFERENCES public.member_types(name) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: members members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_personal_space_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_personal_space_id_fkey FOREIGN KEY (personal_space_id) REFERENCES public.groups(id) ON UPDATE RESTRICT ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--

