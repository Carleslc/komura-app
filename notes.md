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