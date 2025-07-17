# Configuración de Resend con Supabase - LifeBalance

## 🎯 Objetivo
Configurar Resend como proveedor SMTP en Supabase para que todos los emails se envíen a través de Resend en lugar del servicio gratuito limitado de Supabase.

## 🔧 Configuración SMTP en Supabase Dashboard

### 1. Acceder a configuración SMTP
1. Ve a: https://supabase.com/dashboard/project/pqhlpfsdtgbldgbzatpf/auth/settings
2. Scroll hasta **"SMTP Settings"**
3. Habilita **"Enable custom SMTP"**

### 2. Configurar credenciales SMTP de Resend
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Password: re_8s2yjVhU_3MGttPwTJaZCcJu8YSTSnj5G
Sender email: onboarding@resend.dev
Sender name: LifeBalance
```

### 3. Configurar templates de email

#### A. Confirmación de registro
**Ruta:** `Authentication → Email Templates → Confirm signup`

**Subject:** `Confirma tu cuenta en LifeBalance`

**Body:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu cuenta - LifeBalance</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #3B82F6; margin: 0; }
        .content { line-height: 1.6; color: #333; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 LifeBalance</h1>
            <p>Gestión familiar inteligente</p>
        </div>
        
        <div class="content">
            <h2>¡Bienvenido a LifeBalance!</h2>
            
            <p>Gracias por registrarte en LifeBalance. Para activar tu cuenta y comenzar a gestionar tu vida familiar, haz clic en el siguiente botón:</p>
            
            <p style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">✅ Confirmar mi cuenta</a>
            </p>
            
            <p><strong>Con LifeBalance podrás:</strong></p>
            <ul>
                <li>📊 Gestionar las finanzas familiares</li>
                <li>✅ Organizar tareas y responsabilidades</li>
                <li>👥 Conectar con toda tu familia</li>
                <li>⏰ Administrar el tiempo efectivamente</li>
            </ul>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                {{ .ConfirmationURL }}
            </p>
            
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
        </div>
        
        <div class="footer">
            <p>Si no te registraste en LifeBalance, puedes ignorar este email.</p>
            <p><strong>LifeBalance</strong> - Tu vida familiar organizada</p>
        </div>
    </div>
</body>
</html>
```

#### B. Reset de contraseña
**Ruta:** `Authentication → Email Templates → Reset password`

**Subject:** `Restablece tu contraseña - LifeBalance`

**Body:**
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña - LifeBalance</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #3B82F6; margin: 0; }
        .content { line-height: 1.6; color: #333; }
        .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 LifeBalance</h1>
            <p>Gestión familiar inteligente</p>
        </div>
        
        <div class="content">
            <h2>Restablecer tu contraseña</h2>
            
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en LifeBalance.</p>
            
            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <p style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">🔒 Restablecer contraseña</a>
            </p>
            
            <p><strong>Información de seguridad:</strong></p>
            <ul>
                <li>Este enlace es válido por 1 hora</li>
                <li>Solo funciona una vez</li>
                <li>Si no solicitaste este cambio, puedes ignorar este email</li>
            </ul>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                {{ .ConfirmationURL }}
            </p>
        </div>
        
        <div class="footer">
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email.</p>
            <p><strong>LifeBalance</strong> - Tu vida familiar organizada</p>
        </div>
    </div>
</body>
</html>
```

## 📋 Checklist de configuración

### En Supabase Dashboard:
- [ ] Habilitar custom SMTP
- [ ] Configurar credenciales SMTP de Resend
- [ ] Actualizar template de confirmación de registro
- [ ] Actualizar template de reset de contraseña
- [ ] Configurar redirect URLs correctas

### URLs de redirección:
- Site URL: `https://mylifebalanceapp.vercel.app`
- Redirect URLs:
  - `https://mylifebalanceapp.vercel.app/auth/callback`
  - `https://mylifebalanceapp.vercel.app/auth/reset-password`
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/auth/reset-password`

## 🧪 Pruebas
Una vez configurado, probar:
1. Registro de nuevo usuario
2. Confirmación de email
3. Reset de contraseña
4. Invitación familiar (ya funcionando con Edge Function)

## 📞 Comandos útiles
```bash
# Ver logs de Edge Functions
supabase functions logs send-invitation-email
supabase functions logs send-password-reset-email

# Probar Edge Functions localmente
supabase functions serve
```

---

**Resultado esperado:** Todos los emails (confirmación, reset, invitaciones) se enviarán a través de Resend en lugar del servicio gratuito de Supabase.