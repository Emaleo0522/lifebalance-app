# Guía de Configuración de Supabase para LifeBalance

## 🔧 Configuración Requerida en Supabase Dashboard

### 1. Acceso al Dashboard
- Ve a https://app.supabase.com/
- Selecciona tu proyecto: `pqhlpfsdtgbldgbzatpf`

### 2. Configuración de Authentication

#### A. Authentication Settings
**Ruta:** `Authentication → Settings`

**Configuraciones requeridas:**
- **Site URL:** `https://tu-dominio.vercel.app`
- **Redirect URLs:** Agregar estas URLs:
  ```
  https://tu-dominio.vercel.app/auth/callback
  https://tu-dominio.vercel.app/
  http://localhost:5173/auth/callback
  http://localhost:5173/
  ```

#### B. Email Settings
**Ruta:** `Authentication → Settings → Email`

**Configuraciones:**
- **Enable email confirmations:** ✅ Activado
- **Enable email change confirmations:** ✅ Activado
- **Secure email change:** ✅ Activado

### 3. Templates de Email

#### A. Confirm signup
**Ruta:** `Authentication → Email Templates → Confirm signup`

**Subject:** `Confirma tu cuenta en LifeBalance`

**Body:**
```html
<h2>¡Bienvenido a LifeBalance!</h2>
<p>Hola,</p>
<p>Gracias por registrarte en LifeBalance. Para activar tu cuenta y comenzar a gestionar tu vida familiar, haz clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar mi cuenta</a></p>
<p>Si no puedes hacer clic en el enlace, copia y pega la siguiente URL en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este enlace expirará en 24 horas.</p>
<p>Si no te registraste en LifeBalance, puedes ignorar este email.</p>
<p>¡Saludos!<br>El equipo de LifeBalance</p>
```

#### B. Reset password
**Ruta:** `Authentication → Email Templates → Reset password`

**Subject:** `Restablecer contraseña - LifeBalance`

**Body:**
```html
<h2>Restablecer tu contraseña</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en LifeBalance.</p>
<p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Restablecer contraseña</a></p>
<p>Si no puedes hacer clic en el enlace, copia y pega la siguiente URL en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este enlace expirará en 1 hora.</p>
<p>Si no solicitaste restablecer tu contraseña, puedes ignorar este email.</p>
<p>¡Saludos!<br>El equipo de LifeBalance</p>
```

#### C. Email change
**Ruta:** `Authentication → Email Templates → Email change`

**Subject:** `Confirma tu nuevo email - LifeBalance`

**Body:**
```html
<h2>Confirma tu nuevo email</h2>
<p>Hola,</p>
<p>Recibimos una solicitud para cambiar el email de tu cuenta en LifeBalance.</p>
<p>Para confirmar tu nuevo email, haz clic en el siguiente enlace:</p>
<p><a href="{{ .ConfirmationURL }}">Confirmar nuevo email</a></p>
<p>Si no puedes hacer clic en el enlace, copia y pega la siguiente URL en tu navegador:</p>
<p>{{ .ConfirmationURL }}</p>
<p>Este enlace expirará en 24 horas.</p>
<p>Si no solicitaste este cambio, contacta inmediatamente con nuestro soporte.</p>
<p>¡Saludos!<br>El equipo de LifeBalance</p>
```

### 4. Configuración de Providers

#### A. Email Provider
**Ruta:** `Authentication → Providers → Email`

**Configuraciones:**
- **Enable email provider:** ✅ Activado
- **Enable email confirmations:** ✅ Activado
- **Enable email change confirmations:** ✅ Activado

### 5. Configuración de URLs de Producción

Una vez que tengas tu dominio de Vercel, reemplaza `tu-dominio.vercel.app` con tu URL real en:
- Site URL
- Redirect URLs
- Templates de email (si los personalizas)

### 6. Verificación de Configuración

Para verificar que todo está configurado correctamente:

1. **Probar registro:** Registra un nuevo usuario
2. **Revisar inbox:** Verifica que llegue el email de confirmación
3. **Probar confirmación:** Haz clic en el enlace del email
4. **Verificar redirección:** Asegúrate de que redirija correctamente a tu app

### 7. Troubleshooting

#### Problema: No llegan emails
**Soluciones:**
- Verifica que las URLs estén configuradas correctamente
- Revisa la carpeta de spam
- Asegúrate de que el proveedor de email esté activado

#### Problema: Error de redirección
**Soluciones:**
- Verifica que la URL esté en la lista de Redirect URLs
- Asegúrate de que Site URL esté configurada correctamente
- Revisa que no haya espacios extra en las URLs

#### Problema: Confirmación no funciona
**Soluciones:**
- Verifica que `detectSessionInUrl` esté activado en el cliente
- Asegúrate de que AuthCallback esté manejando correctamente los parámetros
- Revisa que las variables de entorno estén correctas

## 🎯 Próximos pasos

1. ✅ Aplicar esta configuración en el dashboard de Supabase
2. ✅ Reemplazar las URLs de ejemplo con tu dominio real
3. ✅ Probar el flujo completo de registro
4. ✅ Verificar que los emails se envíen correctamente
5. ✅ Confirmar que la redirección funcione

## 📞 Soporte

Si tienes problemas con esta configuración, puedes:
- Revisar los logs de Supabase en Authentication → Logs
- Verificar la configuración en Settings → General
- Contactar al soporte de Supabase si es necesario