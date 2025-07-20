# 🧹 Limpieza Manual de Supabase - Sistema de Correos

## Tareas a realizar en el Dashboard de Supabase

### 1. 🚀 Eliminar Edge Functions

Ve a **Edge Functions** en el dashboard y elimina estas funciones:

- ✅ `send-confirmation-email`
- ✅ `send-email-confirm-hook` 
- ✅ `send-invitation-email`
- ✅ `send-password-reset-email`
- ✅ `test-secrets`

### 2. 🔧 Ejecutar Migraciones de Limpieza

En **SQL Editor**, ejecuta estas migraciones en orden:

```bash
# Desde terminal local
supabase db push
```

O manualmente en el SQL Editor:

1. Ejecuta: `supabase/migrations/20250720000001_rollback_custom_email_system.sql`
2. Ejecuta: `supabase/migrations/20250720000002_cleanup_auth_hooks.sql`

### 3. 🔐 Configuración de Authentication

Ve a **Authentication > Settings**:

#### Email Settings:
- ✅ **Enable email confirmations**: `true` 
- ✅ **Enable email change confirmations**: `true`
- ✅ **Secure email change**: `true` (requiere re-autenticación)

#### Templates (usar predeterminados):
- ✅ **Confirm signup**: Usar template nativo de Supabase
- ✅ **Invite user**: Usar template nativo de Supabase  
- ✅ **Magic link**: Usar template nativo de Supabase
- ✅ **Change email address**: Usar template nativo de Supabase
- ✅ **Reset password**: Usar template nativo de Supabase

#### URLs de Redirección:
- ✅ **Site URL**: `https://tu-dominio.com` (producción)
- ✅ **Redirect URLs**: 
  - `https://tu-dominio.com/auth/callback`
  - `http://localhost:3000/auth/callback` (desarrollo)

### 4. 🧹 Limpiar Secrets/Variables

Ve a **Project Settings > API** y elimina estas variables:

- ❌ `RESEND_API_KEY`
- ❌ `BREVO_API_KEY` 
- ❌ `SMTP_*` (cualquier configuración SMTP personalizada)

### 5. 📧 Configurar SMTP (Opcional)

Si quieres usar tu propio SMTP en lugar del limitado de Supabase:

Ve a **Authentication > Settings > SMTP Settings**:

```
Host: tu-smtp-provider.com
Port: 587
User: tu-usuario-smtp
Password: tu-contraseña-smtp
Sender name: LifeBalance App
Sender email: noreply@tu-dominio.com
```

### 6. 🧪 Verificar Funcionamiento

Prueba estos flujos:

- ✅ **Registro de usuario**: Debe enviar email de confirmación
- ✅ **Reset de contraseña**: Debe enviar email de reset
- ✅ **Cambio de email**: Debe enviar confirmación a ambos emails
- ✅ **Invitaciones familiares**: Deben crearse en `pending_invitations` (sin email automático)

### 7. 🗑️ Verificar Tablas Eliminadas

En **Table Editor**, verifica que estas tablas **NO** existan:

- ❌ `pending_invitations` 
- ❌ `invitation_notifications`

Y que estas tablas **SÍ** existan (son necesarias):

- ✅ `family_groups`
- ✅ `family_members` 
- ✅ `shared_tasks`
- ✅ `shared_expenses`
- ✅ `users` (tabla de perfiles)

## 🎯 Resultado Esperado

Después de la limpieza:

1. **Sistema nativo de Supabase** maneja todos los correos
2. **No hay Edge Functions** personalizadas
3. **Templates nativos** de Supabase para todos los correos
4. **Invitaciones familiares** funcionan sin email automático (el usuario debe registrarse para ver invitaciones)
5. **Configuración limpia** lista para implementar el tutorial de YouTube

## ⚠️ Notas Importantes

- Las **invitaciones familiares** ahora requieren que el usuario se registre primero
- Los **correos de confirmación** serán enviados por Supabase nativo
- Puedes personalizar **templates de correo** desde el dashboard
- Para correos masivos, considera implementar **el tutorial que viste** desde cero