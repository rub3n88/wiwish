#!/bin/sh
# entrypoint.sh

# Abort on any error
set -e

# Verificar que DATABASE_URL esté definido
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL no está definida."
  echo "Debes proporcionar DATABASE_URL en las variables de entorno o en tu archivo .env.production."
  echo "Ejemplo: DATABASE_URL=postgresql://usuario:contraseña@host:puerto/bd"
  exit 1
fi

# Verificar que el puerto coincida con el expuesto
if [ -z "$PORT" ]; then
  echo "AVISO: PORT no está definido. Usando el puerto predeterminado 5000."
  export PORT=5000
elif [ "$PORT" != "5000" ]; then
  echo "AVISO: PORT=$PORT no coincide con el puerto expuesto en el Dockerfile (5000)."
  echo "Esto podría causar problemas para acceder a la aplicación."
fi

# Ejecutar migraciones de base de datos
echo "Ejecutando migraciones de base de datos..."
echo "Usando DATABASE_URL: ${DATABASE_URL//:*@/:***@}" # Ocultar contraseña al mostrar
npm run db:push
echo "Migraciones completadas."

# Iniciar la aplicación principal
echo "Iniciando la aplicación..."
exec npm run start 