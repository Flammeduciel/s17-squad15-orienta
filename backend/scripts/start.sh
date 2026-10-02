#!/bin/sh
set -e

# Applique les migrations SQL puis démarre l'API.
#
# La migration n'a lieu que si DATABASE_URL est fournie (c'est le cas en
# production, via Dokploy). Le serveur actuel ne lit pas encore la base : elle
# prépare donc le schéma pour les prochaines étapes sans bloquer le démarrage
# d'un conteneur qui n'a pas encore de base branchée.
if [ -n "$DATABASE_URL" ]; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/migrate.sql
fi

# `exec` remplace ce shell par le processus Node : les signaux d'arrêt (SIGTERM
# de Dokploy en fin de déploiement) parviennent directement à l'API.
exec node server.js
