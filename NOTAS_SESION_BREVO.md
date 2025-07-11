# 📝 Notas de Sesión - Migración de Resend a Brevo

**Fecha**: 2025-01-11  
**Estado**: Migración completada, pendiente configuración y pruebas

## 🎯 **Contexto de la Sesión**

### Problema Original
- El proyecto tenía configurado **Resend** en Edge Functions
- El usuario tiene **Brevo configurado en Supabase SMTP**
- Había errores 404/500 por discrepancia entre servicios
- El usuario nunca usó Resend, solo Brevo

### Solución Aplicada
- **Migración completa** de Resend a Brevo en todo el proyecto
- **Configuración híbrida**: Supabase nativo + Edge Functions
- **Documentación actualizada** para Brevo

## ✅ **Cambios Realizados**

### 1. **Edge Functions Actualizadas**
- `supabase/functions/send-invitation-email/index.ts` - ✅ Migrado a Brevo API
- `supabase/functions/send-password-reset-email/index.ts` - ✅ Migrado a Brevo API
- `CODIGO_RESET_PASSWORD.ts` - ✅ Migrado a Brevo API

### 2. **Variables de Entorno**
- `.env.example` - ✅ Actualizado con `BREVO_API_KEY`
- Cambio: `RESEND_API_KEY` → `BREVO_API_KEY`

### 3. **Configuración de API**
- **Endpoint**: `https://api.brevo.com/v3/smtp/email`
- **Autenticación**: Header `api-key` (no Bearer)
- **Payload**: Formato Brevo con `sender`, `to`, `htmlContent`

### 4. **AuthContext Mejorado**
- `src/context/AuthContextHybrid.tsx` - ✅ Híbrido Supabase + Edge Function
- Intenta Supabase nativo primero (usa SMTP de Brevo)
- Fallback a Edge Function si falla

### 5. **Documentación**
- `FAMILY_INVITATIONS_IMPLEMENTATION.md` - ✅ Actualizado para Brevo
- `DEPLOYMENT.md` - ✅ Variables de entorno corregidas
- `BREVO_CONFIGURATION.md` - ✅ Nueva guía completa

## 🚀 **Próximos Pasos (Para Nueva Sesión)**

### 1. **Configurar API Key de Brevo**
```bash
# Obtener de https://app.brevo.com > Settings > API Keys
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxx
```

### 2. **Configurar Variables de Entorno**
```bash
# Local (.env)
BREVO_API_KEY=xkeysib-tu-api-key-aqui
VITE_SUPABASE_URL=https://pqhlpfsdtgbldgbzatpf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_URL=https://tu-dominio.vercel.app

# Vercel Dashboard
- Agregar BREVO_API_KEY en Environment Variables
```

### 3. **Desplegar Edge Functions**
```bash
supabase functions deploy send-invitation-email
supabase functions deploy send-password-reset-email
```

### 4. **Probar Funcionalidad**
- [ ] Registro de usuario nuevo
- [ ] Confirmación por email
- [ ] Reset de contraseña
- [ ] Invitaciones familiares
- [ ] Verificar logs en Supabase Functions

## 🔧 **Configuración de Brevo Dashboard**

### API Key
1. Ir a https://app.brevo.com
2. Settings > API Keys
3. Crear nueva API Key con permisos:
   - Send emails
   - Manage templates
   - Access to stats

### SMTP (Ya configurado en Supabase)
```
SMTP Host: smtp-relay.brevo.com
SMTP Port: 587
SMTP User: tu-email@dominio.com
SMTP Password: tu-brevo-smtp-password
```

## 🐛 **Troubleshooting**

### Errores Comunes
- **401**: API Key inválida o mal configurada
- **404**: Endpoint incorrecto (verificar `api.brevo.com/v3/smtp/email`)
- **400**: Formato de payload incorrecto
- **500**: Variables de entorno no configuradas

### Logs para Revisar
- Supabase Functions logs
- Brevo dashboard statistics
- Browser console para errores frontend

## 📂 **Archivos Modificados**

### Edge Functions
- `supabase/functions/send-invitation-email/index.ts`
- `supabase/functions/send-password-reset-email/index.ts`
- `CODIGO_RESET_PASSWORD.ts`

### Frontend
- `src/context/AuthContextHybrid.tsx`

### Configuración
- `.env.example`

### Documentación
- `FAMILY_INVITATIONS_IMPLEMENTATION.md`
- `DEPLOYMENT.md`
- `BREVO_CONFIGURATION.md` (nuevo)

## 💡 **Notas Importantes**

1. **Supabase SMTP**: El usuario ya tiene Brevo configurado en Supabase SMTP
2. **Híbrido**: AuthContext intenta Supabase nativo primero, luego Edge Function
3. **API Format**: Brevo usa formato diferente a Resend
4. **Headers**: Usar `api-key` no `Authorization: Bearer`
5. **Testing**: Probar tanto flujo nativo como Edge Functions

## 🔄 **Estado Actual**

- ✅ **Código migrado** completamente a Brevo
- ✅ **Documentación actualizada**
- ❌ **API Key no configurada** (pendiente)
- ❌ **Edge Functions no desplegadas** (pendiente)
- ❌ **Pruebas no realizadas** (pendiente)

## 📞 **Comandos Útiles para Retomar**

```bash
# Verificar configuración actual
cat .env.example

# Ver Edge Functions
ls supabase/functions/

# Desplegar cuando tengas API Key
supabase functions deploy send-invitation-email
supabase functions deploy send-password-reset-email

# Verificar logs
supabase functions logs send-invitation-email
supabase functions logs send-password-reset-email

# Build y deploy
npm run build
vercel --prod
```

---

**Próxima sesión**: Configurar BREVO_API_KEY y probar funcionalidad completa.