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

# Construir la aplicación (backend y frontend)
# Esto ejecuta "tsc && vite build" según tu package.json
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine

LABEL maintainer="wiwish-dev-team"
LABEL description="Imagen de producción para la aplicación Wiwish"

WORKDIR /app

ENV NODE_ENV production

# Copiar archivos de manifiesto de paquetes
COPY --from=builder /app/package.json /app/package-lock.json* ./

# Instalar dependencias de producción Y TAMBIÉN drizzle-kit específicamente
# ya que es necesario para las migraciones en el entrypoint.
RUN npm ci --omit=dev && npm install drizzle-kit

# Copiar la configuración de Drizzle necesaria para las migraciones
COPY --from=builder /app/drizzle.config.ts ./
# Si Drizzle necesita tsconfig.json en tiempo de ejecución (generalmente no para push), también lo copiarías:
# COPY --from=builder /app/tsconfig.json ./

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