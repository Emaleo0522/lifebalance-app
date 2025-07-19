import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthHookPayload {
  type: 'email_change_confirm' | 'signup_confirm'
  event: 'validate'
  session: any
  user: {
    id: string
    email: string
    user_metadata: {
      name?: string
      display_name?: string
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log headers para debug
    console.log('Headers received:', Object.fromEntries(req.headers.entries()))
    
    // Validar webhook secret - Supabase puede enviar esto en diferentes headers
    const authHookSecret = Deno.env.get('AUTH_HOOK_SECRET')
    if (authHookSecret) {
      const signature = req.headers.get('authorization') || 
                       req.headers.get('x-supabase-signature') || 
                       req.headers.get('webhook-signature')
      
      if (signature && !signature.includes(authHookSecret.split(',')[1])) {
        console.error('Invalid webhook signature')
        return new Response('Unauthorized', { status: 401 })
      }
    }

    const payload: AuthHookPayload = await req.json()
    
    // Solo procesar confirmaciones de signup
    if (payload.type !== 'signup_confirm') {
      return new Response(JSON.stringify({ decision: 'continue' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Auth Hook: Processing signup confirmation for:', payload.user.email)

    // Preparar datos para nuestro sistema de email
    const emailData = {
      email: payload.user.email,
      userId: payload.user.id,
      userName: payload.user.user_metadata.display_name || payload.user.user_metadata.name
    }

    // Llamar a nuestro sistema de email personalizado
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ decision: 'reject', message: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const displayName = emailData.userName || emailData.email.split('@')[0]
    const appUrl = Deno.env.get('APP_URL') || 'https://mylifebalanceapp.vercel.app'
    
    // Crear link de confirmación personalizado (simple, sin tokens complejos)
    const confirmLink = `${appUrl}/auth/callback?confirm=true&email=${encodeURIComponent(emailData.email)}&user_id=${emailData.userId}`

    const emailHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a LifeBalance</title>
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #667eea; margin: 0; }
    .content { line-height: 1.6; color: #333; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
      <h2>¡Hola ${displayName}!</h2>
      <p>¡Bienvenido a LifeBalance! Para completar tu registro, confirma tu email:</p>
      <p style="text-align: center;">
        <a href="${confirmLink}" class="button">✅ Confirmar mi cuenta</a>
      </p>
      <p>Si el botón no funciona, copia este enlace:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
        ${confirmLink}
      </p>
    </div>
    
    <div class="footer">
      <p><strong>LifeBalance</strong> - Tu vida familiar organizada</p>
    </div>
  </div>
</body>
</html>`

    const resendPayload = {
      from: 'LifeBalance <noreply@mylifebalanceapp.vercel.app>',
      to: [emailData.email],
      subject: '¡Bienvenido a LifeBalance! Confirma tu cuenta',
      html: emailHtml
    }

    console.log('Sending email via Resend API...')

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('Resend API error:', errorText)
      
      return new Response(JSON.stringify({ 
        decision: 'reject', 
        message: 'Failed to send confirmation email' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendResult = await resendResponse.json()
    console.log('Email sent successfully via Resend:', resendResult.id)

    // Indicar a Supabase que maneje la confirmación exitosamente
    return new Response(JSON.stringify({ 
      decision: 'continue',
      message: 'Custom email sent successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Auth Hook error:', error)
    
    return new Response(JSON.stringify({ 
      decision: 'reject',
      message: 'Auth hook processing failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})