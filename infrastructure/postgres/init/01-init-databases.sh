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

  # Create the service role and its database as the PostgreSQL
  # bootstrap superuser.
  psql \
    -v ON_ERROR_STOP=1 \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    -v db="$db" \
    -v usr="$user" \
    -v pwd="$pass" <<'SQL'

SELECT format(
  'CREATE ROLE %I LOGIN PASSWORD %L',
  :'usr',
  :'pwd'
)
WHERE NOT EXISTS (
  SELECT FROM pg_roles WHERE rolname = :'usr'
)\gexec

SELECT format(
  'CREATE DATABASE %I OWNER %I',
  :'db',
  :'usr'
)
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = :'db'
)\gexec

SQL

  # During Docker's initialization phase PostgreSQL is available
  # through its Unix socket. Do not force a TCP localhost connection.
  #
  # Running the migration as the domain user makes that user the
  # owner of the tables, indexes and sequences it creates.
  PGPASSWORD="$pass" psql \
    -v ON_ERROR_STOP=1 \
    --username "$user" \
    --dbname "$db" \
    -f "/migrations/$name/001.sql"
done