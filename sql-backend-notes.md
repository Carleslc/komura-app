## Heroku postgres dump

```bash
heroku run 'pg_dump -xO $DATABASE_URL' -a komura-backend > komura-backend-02-02-20.sql
```

The addition of `-xO` avoids dumping `GRANT`, `REVOKE`, and `ALTER OWNER` statements, which probably don't apply to your local database server.

Get `$DATABASE_URL`:

```bash
heroku config:get DATABASE_URL -a komura-backend
```

## SQL email type

```sql
CREATE EXTENSION citext;
CREATE DOMAIN email AS citext
  CHECK ( value ~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' );
```

- Avoid case sensitive duplication (citext stands for case-insensitive text)
- Check email syntax

## SQL unique case insensitive

```sql
CREATE UNIQUE INDEX username_unique ON users (LOWER(username));
```

- Keep username column as case sensitive text

Otherwise create username as citext and unique.

## SQL replace first occurrence

```sql
UPDATE groups SET path = regexp_replace(path, 'A/a', 'A/u', 'q') -- subgroup a -> u
WHERE root_id = 1; -- 1 is A and id = root_id too
```

'q' stands for quote (literal pattern)

## SQL views

```sql
CREATE OR REPLACE VIEW "public"."online_members" AS 
  SELECT group_id, user_id, last_seen
  FROM members
  WHERE last_seen > last_exit;

CREATE OR REPLACE VIEW "public"."active_members" AS 
  SELECT group_id, user_id, last_seen
  FROM members
  WHERE last_seen >= (now() - '1 month'::interval)
  ORDER BY last_seen DESC;
  
CREATE OR REPLACE VIEW "public"."active_groups" AS 
  SELECT DISTINCT active_members.group_id
  FROM active_members;

CREATE OR REPLACE VIEW "public"."active_root_groups" AS 
  SELECT group_id, path
  FROM active_groups INNER JOIN groups ON active_groups.group_id = groups.id
  WHERE parent_id IS NULL AND type != 'user';

CREATE OR REPLACE VIEW "public"."active_users" AS 
  SELECT id, username, last_login
  FROM users
  WHERE last_login >= (now() - '1 month'::interval)
  ORDER BY last_login DESC;
```

## SQL Triggers

```plsql
SELECT * FROM information_schema.triggers;

-- root_groups_set_root_id_to_self

CREATE OR REPLACE FUNCTION root_groups_set_root_id_to_self() RETURNS TRIGGER AS $$ BEGIN
  IF NEW.parent_id IS NULL THEN
  	NEW.root_id = NEW.id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER root_groups_set_root_id_to_self BEFORE INSERT ON groups FOR EACH ROW EXECUTE PROCEDURE root_groups_set_root_id_to_self();

-- default_modules_setup

CREATE OR REPLACE FUNCTION default_modules_setup() RETURNS TRIGGER AS $$ BEGIN
  INSERT INTO chat_settings (group_id) VALUES (NEW.id);
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER default_modules_setup AFTER INSERT ON groups FOR EACH ROW EXECUTE PROCEDURE default_modules_setup();

-- delete_personal_space

CREATE OR REPLACE FUNCTION delete_personal_space() RETURNS TRIGGER AS $$ BEGIN
  DELETE FROM groups WHERE id = OLD.personal_space_id;
  RETURN OLD;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER delete_personal_space AFTER DELETE ON users FOR EACH ROW EXECUTE PROCEDURE delete_personal_space();

-- delete_group_profile

CREATE OR REPLACE FUNCTION delete_group_profile() RETURNS TRIGGER AS $$ BEGIN
  DELETE FROM profiles WHERE id = OLD.profile_id;
  RETURN OLD;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER delete_group_profile AFTER DELETE ON groups FOR EACH ROW EXECUTE PROCEDURE delete_group_profile();

-- user_set_member_personal_space

CREATE OR REPLACE FUNCTION user_set_member_personal_space() RETURNS TRIGGER AS $$ BEGIN
 	INSERT INTO members (group_id, user_id, role) VALUES (NEW.personal_space_id, NEW.id, 'owner');
 	RETURN NEW;
END $$ LANGUAGE plpgsql;
 
CREATE TRIGGER user_set_member_personal_space AFTER INSERT ON users FOR EACH ROW EXECUTE PROCEDURE user_set_member_personal_space();

-- join_member_set_default_profile

CREATE OR REPLACE FUNCTION member_set_default_profile() RETURNS TRIGGER AS $$
DECLARE
  user_profile_id integer;
BEGIN
  SELECT profile_id INTO user_profile_id FROM groups INNER JOIN users ON groups.id = users.personal_space_id WHERE users.id = NEW.user_id;
  IF user_profile_id IS NULL THEN
    RAISE EXCEPTION 'User % does not exists', NEW.user_id;
  END IF;
  NEW.profile_id := user_profile_id;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER join_member_set_default_profile BEFORE INSERT ON members FOR EACH ROW EXECUTE PROCEDURE member_set_default_profile();

-- user_update_username_path

CREATE OR REPLACE FUNCTION user_update_username_path() RETURNS TRIGGER AS $$ BEGIN
	UPDATE groups SET path = regexp_replace(path, OLD.username, NEW.username, 'q') WHERE root_id = NEW.personal_space_id;
	RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER user_update_username_path AFTER UPDATE OF username ON users FOR EACH ROW WHEN (NEW.username IS DISTINCT FROM OLD.username) EXECUTE PROCEDURE user_update_username_path();

-- update_group_tree_path

CREATE OR REPLACE FUNCTION update_group_tree_path() RETURNS TRIGGER AS $$ BEGIN
	UPDATE groups SET path = regexp_replace(path, OLD.path, NEW.path, 'q') WHERE root_id = NEW.root_id AND id != NEW.id;
	IF NEW.type = 'user' THEN
		UPDATE users SET username = NEW.path WHERE personal_space_id = NEW.id;
	END IF;
	RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_tree_path AFTER UPDATE OF path ON groups FOR EACH ROW WHEN (NEW.path IS DISTINCT FROM OLD.path AND pg_trigger_depth() = 0) EXECUTE PROCEDURE update_group_tree_path();

--

DROP TRIGGER delete_personal_space ON users;

DROP FUNCTION delete_personal_space;
```

## SQL list table indices

```sql
SELECT
    t.relname AS table_name,
    i.relname AS index_name,
    a.attname AS column_name
FROM
    pg_class t,
    pg_class i,
    pg_index ix,
    pg_attribute a
WHERE
    t.oid = ix.indrelid
    AND i.oid = ix.indexrelid
    AND a.attrelid = t.oid
    AND a.attnum = ANY(ix.indkey)
    AND t.relkind = 'r'
    AND t.relname = 'group_messages'
ORDER BY
    t.relname,
    i.relname;
```

## SQL indices

```sql
CREATE INDEX groups_root_key ON groups(root_id);

EXPLAIN SELECT * FROM groups WHERE root_id = 1;

--

CREATE INDEX group_messages_group_key ON group_messages(group_id);

EXPLAIN SELECT * FROM group_messages WHERE group_id = 1;
EXPLAIN SELECT * FROM group_messages AS g INNER JOIN messages AS m ON g.message_id = m.id WHERE group_id = 1;

--

CREATE INDEX member_messages_key ON member_messages(group_id, sender_id, receiver_id);

EXPLAIN SELECT * FROM member_messages INNER JOIN messages ON member_messages.message_id = messages.id WHERE group_id = 1 AND (sender_id = 'a' AND receiver_id = 'b')
ORDER BY messages.created_at;

EXPLAIN SELECT * FROM member_messages INNER JOIN messages ON member_messages.message_id = messages.id WHERE group_id = 1 AND ((sender_id = 'a' AND receiver_id = 'b') OR (sender_id = 'b' AND receiver_id = 'a'))
ORDER BY messages.created_at;

EXPLAIN
SELECT DISTINCT receiver_id AS other_id FROM member_messages WHERE sender_id = 'a'
UNION
SELECT DISTINCT sender_id AS other_id FROM member_messages WHERE receiver_id = 'a';
```

To delete an index:

```sql
DROP INDEX member_messages_key;
```

## SQL Constraints

List constraints:

```sql
SELECT constraint_name, constraint_type, is_deferrable, initially_deferred, enforced
    FROM "information_schema"."table_constraints"
    WHERE table_schema='public' AND table_name='chat_settings';
```

Rename:

```sql
ALTER TABLE name RENAME CONSTRAINT constraint_name TO new_constraint_name;
```

Make constraints deferred:

```sql
ALTER TABLE ONLY public.chat_settings
    DROP CONSTRAINT chat_settings_pkey;

ALTER TABLE ONLY public.chat_settings
    ADD CONSTRAINT chat_settings_pkey PRIMARY KEY (group_id) DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE ONLY public.chat_settings
    ALTER CONSTRAINT chat_settings_group_id_fkey DEFERRABLE INITIALLY DEFERRED;

-- Restore
ALTER TABLE ONLY public.chat_settings
    ALTER CONSTRAINT chat_settings_group_id_fkey NOT DEFERRABLE;
```

## SQL reset autoincrement

```sql
ALTER SEQUENCE groups_id_seq RESTART WITH 1; -- column id from table groups
```

