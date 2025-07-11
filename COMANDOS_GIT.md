# 🚀 Comandos Git para Continuar en Otra PC

## 📝 **Estado Actual**
- ✅ Migración de Resend a Brevo completada
- ✅ Todos los archivos modificados
- ❌ Cambios sin commitear (necesitas hacer commit manual)

## 🔧 **Comandos para Ejecutar**

### 1. **Verificar Estado**
```bash
cd /home/lucasv/lifebalance-app
git status
```

### 2. **Agregar Todos los Cambios**
```bash
git add -A
```

### 3. **Crear Commit**
```bash
git commit -m "Migración completa de Resend a Brevo

- Actualizadas Edge Functions para usar Brevo API
- Cambiado endpoint de api.resend.com a api.brevo.com  
- Actualizada autenticación de Bearer a api-key header
- Adaptado payload al formato de Brevo
- AuthContext híbrido: Supabase nativo + Edge Functions
- Variables de entorno: RESEND_API_KEY → BREVO_API_KEY
- Documentación actualizada para Brevo
- Creada guía completa de configuración

Archivos modificados:
- supabase/functions/send-invitation-email/index.ts
- supabase/functions/send-password-reset-email/index.ts
- CODIGO_RESET_PASSWORD.ts
- src/context/AuthContextHybrid.tsx
- .env.example
- FAMILY_INVITATIONS_IMPLEMENTATION.md
- DEPLOYMENT.md
- BREVO_CONFIGURATION.md (nuevo)
- NOTAS_SESION_BREVO.md (nuevo)

Próximos pasos: Configurar BREVO_API_KEY y desplegar Edge Functions"
```

### 4. **Subir a Repositorio Remoto**
```bash
# Si ya tienes remote configurado
git push origin main

# Si necesitas agregar remote (reemplaza con tu repo)
git remote add origin https://github.com/tu-usuario/lifebalance-app.git
git branch -M main
git push -u origin main
```

## 📋 **Checklist de Archivos Modificados**

### ✅ **Edge Functions**
- `supabase/functions/send-invitation-email/index.ts`
- `supabase/functions/send-password-reset-email/index.ts`
- `CODIGO_RESET_PASSWORD.ts`

### ✅ **Frontend**
- `src/context/AuthContextHybrid.tsx`

### ✅ **Configuración**
- `.env.example`

### ✅ **Documentación**
- `FAMILY_INVITATIONS_IMPLEMENTATION.md`
- `DEPLOYMENT.md`
- `BREVO_CONFIGURATION.md` (nuevo)
- `NOTAS_SESION_BREVO.md` (nuevo)
- `COMANDOS_GIT.md` (este archivo)

## 🔄 **Para Continuar en Otra PC**

### 1. **Clonar Repositorio**
```bash
git clone https://github.com/tu-usuario/lifebalance-app.git
cd lifebalance-app
```

### 2. **Instalar Dependencias**
```bash
npm install --legacy-peer-deps
```

### 3. **Leer Notas de Sesión**
```bash
cat NOTAS_SESION_BREVO.md
```

### 4. **Configurar Variables de Entorno**
```bash
cp .env.example .env
# Editar .env con tu BREVO_API_KEY
```

### 5. **Continuar con Configuración**
- Obtener API Key de Brevo
- Desplegar Edge Functions
- Probar funcionalidad

## 🎯 **Próximos Pasos Críticos**

1. **BREVO_API_KEY**: Obtener de https://app.brevo.com
2. **Deploy Functions**: `supabase functions deploy`
3. **Probar Emails**: Registro, reset, invitaciones
4. **Verificar Logs**: Supabase Functions logs

---

**Importante**: Lee `NOTAS_SESION_BREVO.md` para contexto completo.