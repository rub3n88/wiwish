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

# Corregir importaciones para ESM antes de compilar
RUN find ./server -name "*.ts" -exec sed -i 's/from "\.\([^"]*\)";/from ".\1.js";/g' {} \;

# Construir la aplicación (backend y frontend)
# Esto ejecuta "tsc && vite build" según tu package.json
RUN npm run build

# Verificar que los archivos existan
RUN ls -la dist/server/

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

# Instalar dependencias de producción
# IMPORTANTE: Instalar las mismas dependencias que en desarrollo para asegurar compatibilidad
# de drizzle-kit con drizzle.config.ts
RUN npm ci

# Copiar la configuración de Drizzle necesaria para las migraciones
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/db ./db

# Copiar la aplicación construida desde la etapa de construcción
# Esto asume que 'npm run build' crea una carpeta 'dist' 
# con el servidor compilado y los activos del cliente.
COPY --from=builder /app/dist ./dist

# Copiar la carpeta 'public' si tu servidor Express la sirve directamente
# y no está completamente manejada por la compilación de Vite dentro de 'dist'.
# Si Vite incluye todo desde 'public/' en su salida 'dist/', esta línea podría no ser necesaria.
COPY --from=builder /app/public ./public

# Copiar el script entrypoint y darle permisos de ejecución
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Exponer el puerto en el que se ejecuta la aplicación dentro del contenedor
# Asegúrate de que tu servidor Express escuche en process.env.PORT || 5000
EXPOSE 5000

# Comando para iniciar la aplicación usando el entrypoint
CMD ["./entrypoint.sh"] 