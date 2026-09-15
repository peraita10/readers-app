#!/bin/sh
set -eu
create_service_db() {
  db="$1"; user="$2"; password="$3"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER $user WITH PASSWORD '$password';
    CREATE DATABASE $db OWNER $user;
    REVOKE CONNECT ON DATABASE $db FROM PUBLIC;
    GRANT CONNECT ON DATABASE $db TO $user;
EOSQL
}
create_service_db "$IDENTITY_DB" "$IDENTITY_DB_USER" "$IDENTITY_DB_PASSWORD"
create_service_db "$CATALOG_DB" "$CATALOG_DB_USER" "$CATALOG_DB_PASSWORD"
create_service_db "$READING_DB" "$READING_DB_USER" "$READING_DB_PASSWORD"
create_service_db "$COMMUNITY_DB" "$COMMUNITY_DB_USER" "$COMMUNITY_DB_PASSWORD"
