## Heroku postgres dump

```bash
heroku run 'pg_dump -xO $DATABASE_URL' -a komura-backend > komura-backend-02-02-20.sql
```

The addition of `-xO` avoids dumping `GRANT`, `REVOKE`, and `ALTER OWNER` statements, which probably don't apply to your local database server.

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
WHERE id = 1 OR root = 1; -- 1 is A
```

'q' stands for quote (literal pattern)

## SQL views

```sql
CREATE OR REPLACE VIEW "public"."active_members" AS 
  SELECT group_id, user_id, last_seen
  FROM members
  WHERE last_seen >= (now() - '1 month'::interval);d
```

## SQL Triggers

```plsql
CREATE FUNCTION delete_personal_space() RETURNS TRIGGER AS $$ BEGIN
  DELETE FROM groups WHERE id = OLD.personal_space_id;
  RETURN OLD;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER delete_personal_space AFTER DELETE ON users FOR EACH ROW EXECUTE PROCEDURE delete_personal_space();

DROP TRIGGER delete_personal_space ON users;

DROP FUNCTION delete_personal_space;
```

## SQL view table indices

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