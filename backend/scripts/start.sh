#!/bin/sh
set -e

# Applies SQL migrations against DATABASE_URL, then starts the server.
# Safe to run on every deploy — a container with nothing new to apply just
# moves on. Requires DATABASE_URL to be set (Dokploy's Postgres connection string).
psql "$DATABASE_URL" -f scripts/migrate.sql

exec node dist/index.js
