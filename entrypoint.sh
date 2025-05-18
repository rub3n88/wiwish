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

# Corregir las importaciones en los archivos compilados
echo "Corrigiendo las importaciones en los archivos compilados..."
sed -i 's|import \* as schema from "../shared/schema";|import * as schema from "../shared/schema.js";|g' /app/dist/db/index.js

# Corregir la ruta de los archivos estáticos en vite.js
echo "Corrigiendo la ruta de los archivos estáticos..."
sed -i 's|const distPath = path.resolve(import.meta.dirname, "public");|const distPath = path.resolve(import.meta.dirname, "..", "public");|g' /app/dist/server/vite.js
echo "Importaciones y rutas corregidas."

# Ejecutar migraciones de base de datos
echo "Ejecutando migraciones de base de datos..."
echo "Usando DATABASE_URL: ${DATABASE_URL//:*@/:***@}" # Ocultar contraseña al mostrar
npm run db:push
echo "Migraciones completadas."

# Iniciar la aplicación principal
echo "Iniciando la aplicación..."
exec npm run start 