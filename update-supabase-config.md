# Configuración Requerida para Emails

## 1. En Supabase Dashboard > Auth > SMTP Settings:

```
Host: smtp-relay.brevo.com
Port: 587
Username: 91afdb001@smtp-brevo.com
Password: [Contraseña SMTP de Brevo - no API key]
Sender email: soportelifebalance@gmail.com
Sender name: LifeBalance Soporte
```

## 2. Comandos para actualizar secrets:

```bash
# Obtener la API key real de Brevo dashboard
supabase secrets set BREVO_API_KEY=xkeysib-[tu-api-key-completa-aqui]

# URL correcta para desarrollo y producción
supabase secrets set APP_URL=https://mylifebalanceapp.vercel.app
```

## 3. En Brevo Dashboard verificar:

- ✅ Remitente `soportelifebalance@gmail.com` verificado
- ✅ SMTP username: `91afdb001@smtp-brevo.com`  
- ✅ API Key activa con permisos de "Send emails"

## 4. Redeploy Edge Functions:

```bash
supabase functions deploy send-password-reset-email
supabase functions deploy send-invitation-email
```

## Problema identificado:
El username SMTP en Supabase está configurado como `emaleo0522@gmail.com` pero debería ser `91afdb001@smtp-brevo.com` según tu configuración de Brevo.