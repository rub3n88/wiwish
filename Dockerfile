# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder

LABEL maintainer="wiwish-dev-team"
LABEL description="Etapa de construcción para la aplicación Wiwish"

WORKDIR /app

# Copiar archivos de manifiesto de paquetes e instalar dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Copiar el resto del código de la aplicación
COPY . .

# Ya no modificamos las importaciones con sed aquí.
# Dejamos que tsc y la configuración de tsconfig.json manejen la resolución de módulos.

# Construir la aplicación (backend y frontend)
# Esto ejecuta "tsc && vite build" según tu package.json
RUN npm run build

# Verificar que los archivos existan (opcional, para depuración)
RUN ls -la dist/server/
RUN ls -la dist/db/ # Si esperas archivos en dist/db/
RUN ls -la dist/shared/ # Si esperas archivos en dist/shared/

# Etapa 2: Producción
FROM node:20-alpine

LABEL maintainer="wiwish-dev-team"
LABEL description="Imagen de producción para la aplicación Wiwish"

WORKDIR /app

# Las variables de entorno se configuran en Dokploy y se pasan al contenedor
# ENV NODE_ENV production
# No fijamos variables aquí para que Dokploy pueda inyectarlas

# Copiar archivos de manifiesto de paquetes
COPY --from=builder /app/package.json /app/package-lock.json* ./

# Instalar todas las dependencias (incluidas devDeps para drizzle-kit, etc.)
RUN npm ci

# Copiar la configuración de Drizzle y los esquemas/archivos necesarios
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/db ./db

# Copiar la aplicación construida desde la etapa de builder
# Asegúrate de que tsc coloque los archivos de server, db, shared en las subcarpetas correctas dentro de /app/dist en el builder
COPY --from=builder /app/dist ./dist

# Copiar la carpeta 'public' de Vite (que debería estar dentro de /app/dist/public en el builder)
# Esta línea podría ser redundante si la anterior "COPY --from=builder /app/dist ./dist" ya incluye public/ correctamente.
# Si tu `vite.config.ts` tiene `build: { outDir: path.resolve(import.meta.dirname, "dist/public") }`
# y el outDir de tsc es también 'dist', entonces la estructura será dist/public (frontend) y dist/server, dist/db, etc. (backend)
# COPY --from=builder /app/dist/public ./dist/public # Esto sería más específico si esa es la estructura

# Copiar el script entrypoint y darle permisos de ejecución
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Exponer el puerto en el que se ejecuta la aplicación dentro del contenedor
# Asegúrate de que tu servidor Express escuche en process.env.PORT || 5000
EXPOSE 5000

# Comando para iniciar la aplicación usando el entrypoint
CMD ["./entrypoint.sh"] 