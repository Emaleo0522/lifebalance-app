# Configuración de Brevo para LifeBalance

## 🔧 Configuración Completa de Brevo

### 1. Configuración en Brevo Dashboard

#### A. Crear Cuenta y API Key
1. **Crear cuenta** en https://app.brevo.com
2. **Ir a Settings** > **API Keys**
3. **Crear nueva API Key** con permisos para:
   - Send emails
   - Manage templates
   - Access to stats

#### B. Configurar Dominio (Recomendado)
1. **Ir a Settings** > **Domains**
2. **Agregar dominio**: `lifebalance.app` (o tu dominio)
3. **Verificar dominio** con los registros DNS requeridos
4. **Configurar DKIM** para mejor deliverability

### 2. Configuración en Supabase

#### A. Configurar SMTP en Supabase
1. **Ir a Supabase Dashboard** > **Settings** > **Auth**
2. **Scroll down a SMTP Settings**
3. **Configurar con datos de Brevo**:
   ```
   SMTP Host: smtp-relay.brevo.com
   SMTP Port: 587
   SMTP User: tu-email@dominio.com
   SMTP Password: tu-brevo-smtp-password
   ```

#### B. Templates de Email en Supabase
Actualizar los templates usando la interfaz de Supabase:

**Confirm signup template:**
```html
<h2>¡Bienvenido a LifeBalance!</h2>
<p>Confirma tu cuenta haciendo clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
```

**Reset password template:**
```html
<h2>Restablecer contraseña</h2>
<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
```

### 3. Variables de Entorno

#### A. Variables requeridas
```bash
# .env
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxx
VITE_SUPABASE_URL=https://pqhlpfsdtgbldgbzatpf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_URL=https://tu-dominio.vercel.app
```

#### B. Variables para Vercel
En Vercel Dashboard > Settings > Environment Variables:
- `BREVO_API_KEY`: Tu API key de Brevo
- `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio para Edge Functions
- `APP_URL`: URL de tu aplicación

### 4. Configuración de Edge Functions

Las Edge Functions ya están configuradas para usar Brevo:

#### A. Invitaciones Familiares
- **Archivo**: `supabase/functions/send-invitation-email/index.ts`
- **Endpoint**: `https://api.brevo.com/v3/smtp/email`
- **Autenticación**: Header `api-key`

#### B. Reset de Contraseña
- **Archivo**: `supabase/functions/send-password-reset-email/index.ts`
- **Endpoint**: `https://api.brevo.com/v3/smtp/email`
- **Autenticación**: Header `api-key`

### 5. Testeo de Configuración

#### A. Probar Supabase Native Auth
1. **Registrar usuario** nuevo
2. **Verificar email** en bandeja de entrada
3. **Confirmar** que el email viene de Brevo

#### B. Probar Edge Functions
1. **Enviar invitación** familiar
2. **Verificar logs** en Supabase Functions
3. **Confirmar entrega** del email

### 6. Troubleshooting

#### A. Errores Comunes

**Error 401 - API Key inválida**
```bash
# Verificar que la API key esté correcta
# Debe empezar con "xkeysib-"
```

**Error 404 - Endpoint no encontrado**
```bash
# Verificar que el endpoint sea correcto:
# https://api.brevo.com/v3/smtp/email
```

**Error 400 - Formato de email inválido**
```bash
# Verificar estructura del payload:
{
  "sender": {
    "name": "LifeBalance",
    "email": "noreply@lifebalance.app"
  },
  "to": [
    {
      "email": "usuario@dominio.com",
      "name": "Usuario"
    }
  ],
  "subject": "Asunto",
  "htmlContent": "<html>...</html>"
}
```

#### B. Verificar Configuración
1. **Logs de Supabase**: Ver errores en Functions
2. **Logs de Brevo**: Ver estadísticas de envío
3. **DNS**: Verificar registros de dominio

### 7. Migración de Resend a Brevo

#### A. Cambios realizados
- ✅ **Edge Functions**: Actualizadas para usar Brevo API
- ✅ **Variables de entorno**: Cambiadas de `RESEND_API_KEY` a `BREVO_API_KEY`
- ✅ **Endpoints**: Cambiados de `api.resend.com` a `api.brevo.com`
- ✅ **Autenticación**: Cambiada de `Authorization: Bearer` a `api-key`
- ✅ **Payload**: Adaptado al formato de Brevo

#### B. Archivos modificados
- `supabase/functions/send-invitation-email/index.ts`
- `supabase/functions/send-password-reset-email/index.ts`
- `CODIGO_RESET_PASSWORD.ts`
- `src/context/AuthContextHybrid.tsx`
- `.env.example`
- Documentación

### 8. Siguiente Pasos

1. **Configurar API Key** de Brevo en variables de entorno
2. **Desplegar Edge Functions** actualizadas
3. **Probar flujo completo** de emails
4. **Configurar dominio** en Brevo (opcional)
5. **Monitorear logs** para verificar funcionamiento

## 📧 Contacto

Si tienes problemas con la configuración:
- Revisa los logs de Supabase Functions
- Verifica la configuración de Brevo
- Consulta la documentación de Brevo API