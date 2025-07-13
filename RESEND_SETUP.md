# Configuración de Resend para Emails

## 🚀 Pasos para configurar Resend

### 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Añadir tu dominio (opcional pero recomendado)

1. En el dashboard de Resend, ve a "Domains"
2. Añade tu dominio (ej: `rubenleon.es`)
3. Configura los registros DNS que te proporcionen
4. Verifica el dominio

### 3. Obtener API Key

1. Ve a "API Keys" en el dashboard
2. Crea una nueva API key
3. Copia la clave (empieza con `re_`)

### 4. Variables de entorno necesarias

Reemplaza las variables SMTP actuales con estas:

```bash
# Resend Configuration
RESEND_API_KEY="re_tu_api_key_aqui"
FROM_EMAIL="contacto@rubenleon.es"  # Usa tu dominio verificado

# Opcional - URL de la aplicación
APP_URL="https://tu-dominio.com"
```

### 5. Variables que ya NO necesitas

Puedes eliminar estas variables de tu entorno de producción:

```bash
# Ya no necesarias
EMAIL_HOST
EMAIL_PORT
EMAIL_SECURE
EMAIL_USER
EMAIL_PASSWORD
```

## 📧 Ventajas de Resend

- ✅ **Sin problemas de firewall** - API HTTP en lugar de SMTP
- ✅ **Mejor deliverability** - Especializado en emails transaccionales
- ✅ **Plan gratuito generoso** - 3,000 emails/mes gratis
- ✅ **Fácil configuración** - Solo necesitas API key
- ✅ **Logs detallados** - Tracking de emails enviados
- ✅ **Moderno y confiable** - Usado por muchas startups

## 🔧 Configuración en producción

1. **En tu servidor/Dokploy**, actualiza las variables de entorno:

   ```bash
   RESEND_API_KEY=re_tu_api_key_real
   FROM_EMAIL=contacto@rubenleon.es
   ```

2. **Reinicia la aplicación** para que tome las nuevas variables
3. **Prueba enviando un email** (reserva o cancelación)

## 📊 Monitoreo

- Los logs de la aplicación mostrarán el proceso completo
- En el dashboard de Resend puedes ver todos los emails enviados
- Métricas de entrega, rebotes, etc.

## 🆘 Troubleshooting

Si sigues teniendo problemas:

1. **Verifica la API key** - Debe empezar con `re_`
2. **Verifica el dominio** - Si usas dominio personalizado, debe estar verificado
3. **Revisa los logs** - Busca mensajes con 📧 y ❌
4. **Prueba con email genérico** - Usa `onboarding@resend.dev` como FROM_EMAIL temporalmente
