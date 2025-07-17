# Manual Testing Steps - Resend Email Integration

## 🧪 Manual Testing Steps

### 1. Test Password Reset Email
1. Ve a tu app en desarrollo: `npm run dev`
2. Ve a la página de login
3. Haz clic en "¿Olvidaste tu contraseña?"
4. Ingresa tu email: `emaleo0522@gmail.com`
5. Revisa tu bandeja de entrada
6. **Esperado**: Email enviado desde `onboarding@resend.dev` via Resend

### 2. Test Signup Confirmation Email
1. Ve a la página de registro
2. Registra un nuevo usuario con email temporal
3. Revisa la bandeja de entrada
4. **Esperado**: Email de confirmación enviado desde `onboarding@resend.dev`

### 3. Test Family Invitation Email
1. Inicia sesión con tu cuenta
2. Ve a la sección "Family"
3. Invita a un nuevo miembro con email que no esté registrado
4. **Esperado**: Email de invitación enviado desde `onboarding@resend.dev`

## 🔧 Troubleshooting

### Si Password Reset falla:
1. Verificar configuración SMTP en Supabase Dashboard
2. Verificar que el dominio `onboarding@resend.dev` esté disponible
3. Verificar que la API key sea válida: `re_8s2yjVhU_3MGttPwTJaZCcJu8YSTSnj5G`

### Si Invitations fallan:
1. Verificar que las Edge Functions estén desplegadas
2. Verificar que `RESEND_API_KEY` esté configurada como secreto
3. Verificar logs en Supabase Functions dashboard

## 📋 Verification Checklist

### In Supabase Dashboard:
- [ ] SMTP enabled with Resend credentials
- [ ] Email templates updated with custom HTML
- [ ] Redirect URLs configured correctly
- [ ] Site URL set to production domain

### In Resend Dashboard:
- [ ] API key is active and valid
- [ ] No rate limits exceeded
- [ ] Domain verification if needed

### In Code:
- [ ] Edge Functions deployed with latest code
- [ ] RESEND_API_KEY configured as Supabase secret
- [ ] Email addresses use `onboarding@resend.dev`

## 🎯 Expected Results

All emails should:
1. Send successfully without errors
2. Arrive from `onboarding@resend.dev`
3. Have proper HTML formatting
4. Contain working links for actions
5. Be tracked in Resend dashboard

## 📞 Support

If issues persist:
1. Check Supabase Functions logs
2. Check Resend dashboard for delivery status
3. Verify all credentials are correct
4. Test with curl commands for debugging