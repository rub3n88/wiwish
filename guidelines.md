"# Guidelines para el Proyecto Wiwish

Este documento proporciona un contexto rápido sobre el proyecto Wiwish para que agentes de inteligencia artificial puedan entender y modificar el código de manera efectiva. Wiwish es una aplicación web para crear y compartir listas de regalos para bebés, permitiendo a usuarios autenticados gestionar listas y a invitados reservar regalos.

## Propósito General

- Permite a padres crear listas de regalos personalizadas para sus bebés.
- Invitados pueden reservar regalos sin duplicados, recibiendo confirmaciones por email.
- Incluye dashboard de admin para gestionar listas, ver actividades y estadísticas.

## Estructura del Proyecto

- **client/**: Código frontend (React con Vite).
  - **src/**: Componentes, hooks, páginas, tipos.
  - Páginas principales: home-page.tsx, auth-page.tsx, admin-dashboard.tsx, gift-list.tsx.
- **server/**: Código backend (Express.js).
  - Archivos clave: index.ts (servidor principal), routes.ts (rutas API), auth.ts (autenticación), storage.ts (interacciones con DB), email.ts (envío de emails).
- **db/**: Configuración de base de datos.
  - index.ts: Conexión a PostgreSQL con Drizzle ORM.
  - seed.ts: Script para seed de datos iniciales.
- **shared/**: Esquemas compartidos entre frontend y backend (schema.ts).
- **public/**: Archivos estáticos, como uploads de imágenes.
- Archivos de configuración: package.json, vite.config.ts, tailwind.config.ts, Dockerfile, docker-compose.yml.

## Tecnologías Principales

- **Frontend**: React 18, Vite, Tanstack Query (para API calls), Wouter (routing), Shadcn UI (componentes), Tailwind CSS, Lucide Icons, Recharts (gráficos).
- **Backend**: Node.js con Express, Passport (autenticación), Multer (uploads), Nodemailer (emails), Drizzle ORM (DB).
- **Base de Datos**: PostgreSQL (usando Neon serverless).
- **Otros**: TypeScript, Zod (validación), Drizzle Kit (migraciones), Docker para despliegue.

## Cómo Correr el Proyecto

- **Desarrollo**: `npm run dev` (inicia servidor Express con TSX y sirve frontend via Vite).
- **Build**: `npm run build` (compila TS y construye frontend con Vite).
- **Producción**: `npm run start` (ejecuta el servidor compilado).
- **Base de Datos**:
  - Migraciones: `npm run db:push`.
  - Seed: `npm run db:seed` (crea usuario admin y datos demo).
- **Docker**: Usa `docker-compose up` para entorno de producción (requiere .env con DATABASE_URL y SESSION_SECRET).
- Entorno: Requiere .env con variables como DATABASE_URL, SESSION_SECRET, y credenciales para emails.

## Flujos Clave

- **Autenticación**:
  - Registro/login via /api/register y /api/login (Passport Local).
  - Sesiones almacenadas en PostgreSQL.
- **Registries (Listas)**: Creadas por usuarios autenticados. Público/privado, con slug único.
- **Gifts (Regalos)**: Añadidos a registries con detalles (nombre, precio, imagen via upload). Reservas por invitados con email de confirmación/cancelación.
- **Actividades**: Log de acciones (creación, reserva, etc.) en dashboard de admin.
- **Emails**: Envío de confirmaciones y cancelaciones usando Nodemailer.
- **Frontend Routing**: Usa Wouter. Rutas protegidas con ProtectedRoute.

## Convenciones de Código

- **Lenguaje**: Todo en TypeScript. Usa tipos estrictos y Zod para validación.
- **Esquemas DB**: Definidos en shared/schema.ts con Drizzle ORM. Relaciones: users -> registries -> gifts -> reservations.
- **API**: Rutas en /api/ (e.g., /api/registries, /api/gifts). Usa JSON para requests/responses.
- **Estilos**: Tailwind CSS con clases personalizadas (e.g., baby-blue, baby-pink).
- **Errores**: Manejo con try-catch, respuestas JSON con mensajes.
- **Seguridad**: Hash de contraseñas con scrypt, tokens para cancelaciones.
- **Mejores Prácticas**: Código modular (hooks, componentes reutilizables). Queries cacheadas con Tanstack Query.

## Notas para Modificaciones

- Para cambios en DB: Actualiza schema.ts y corre migraciones.
- Asegura compatibilidad frontend-backend via shared types.
- Prueba autenticación y emails en dev (usa variables de entorno).
- Para despliegue: Verifica Dockerfile y entrypoint.sh para correcciones post-build.

Este documento se basa en una revisión del código actual. Si el proyecto evoluciona, actualízalo accordingly."
