#!/bin/sh
# entrypoint.sh

# Abort on any error
set -e

# Ejecutar migraciones de base de datos
echo "Ejecutando migraciones de base de datos..."
npm run db:push
echo "Migraciones completadas."

# Iniciar la aplicación principal
echo "Iniciando la aplicación..."
exec npm run start 