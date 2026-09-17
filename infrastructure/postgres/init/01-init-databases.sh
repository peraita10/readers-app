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

  db=$2
  user=$3
  passvar=$4
  eval pass=\$$passvar

  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -v db="$db" -v usr="$user" -v pwd="$pass" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'usr', :'pwd')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'usr')\gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'db', :'usr')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db')\gexec
SQL
done

# A fresh database uses exactly the same versioned migration path as an
# existing one. This prevents bootstrap and upgrade schemas from drifting.
/migrate.sh
