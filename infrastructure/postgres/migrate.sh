#!/bin/sh
set -eu

for spec in \
  "identity:identity_db:identity_user:IDENTITY_DB_PASSWORD" \
  "catalog:catalog_db:catalog_user:CATALOG_DB_PASSWORD" \
  "reading:reading_db:reading_user:READING_DB_PASSWORD" \
  "community:community_db:community_user:COMMUNITY_DB_PASSWORD"
do
  oldIFS="$IFS"
  IFS=:
  set -- $spec
  IFS="$oldIFS"

  name=$1
  db=$2
  user=$3
  passvar=$4
  eval pass=\$$passvar

  PGPASSWORD="$pass" psql -v ON_ERROR_STOP=1 --username "$user" --dbname "$db" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations(
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
SQL

  for migration in /migrations/$name/*.sql
  do
    [ -f "$migration" ] || continue
    version=$(basename "$migration")
    applied=$(PGPASSWORD="$pass" psql -At --username "$user" --dbname "$db" -v version="$version" -c "SELECT 1 FROM schema_migrations WHERE version=:'version'" 2>/dev/null || true)
    [ "$applied" = "1" ] && continue

    echo "Applying $name/$version"
    PGPASSWORD="$pass" psql -v ON_ERROR_STOP=1 --username "$user" --dbname "$db" -f "$migration"
    PGPASSWORD="$pass" psql -v ON_ERROR_STOP=1 --username "$user" --dbname "$db" -v version="$version" -c "INSERT INTO schema_migrations(version) VALUES (:'version')"
  done
done
