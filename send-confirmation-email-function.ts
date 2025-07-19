import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmationRequest {
  email: string;
  userId: string;
  userName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, userId, userName }: ConfirmationRequest = await req.json();

    if (!email || !userId) {
      return new Response(
        JSON.stringify({ error: 'Email and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing email confirmation for:', email);

    const { data: confirmData, error: confirmError } = await supabaseClient.auth.admin.generateLink({
      type: 'signup',
      email: email,
    });

    if (confirmError || !confirmData) {
      console.error('Error generating confirmation link:', confirmError);
      throw new Error('Failed to generate confirmation link');
    }

    const confirmUrl = new URL(confirmData.properties.action_link);
    const token = confirmUrl.searchParams.get('token');
    const refreshToken = confirmUrl.searchParams.get('refresh_token');

    if (!token) {
      throw new Error('Failed to extract token from confirmation link');
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://mylifebalanceapp.vercel.app';
    const customConfirmLink = `${appUrl}/auth/callback?access_token=${token}&refresh_token=${refreshToken}&type=signup`;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const displayName = userName || email.split('@')[0];

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
    .feature { background: #f8f9ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
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
      
      <p>¡Bienvenido a LifeBalance! Estamos emocionados de tenerte en nuestra comunidad.</p>
      
      <p>Para completar tu registro y comenzar a organizar tu vida familiar, confirma tu dirección de email haciendo clic en el botón de abajo:</p>
      
      <p style="text-align: center;">
        <a href="${customConfirmLink}" class="button">✅ Confirmar mi cuenta</a>
      </p>
      
      <p><strong>¿Qué puedes hacer con LifeBalance?</strong></p>
      
      <div class="feature">
        <strong>📋 Gestión de Tareas Familiares</strong><br>
        Organiza y asigna tareas a todos los miembros de la familia
      </div>
      
      <div class="feature">
        <strong>💰 Control de Finanzas</strong><br>
        Lleva un registro de gastos e ingresos familiares
      </div>
      
      <div class="feature">
        <strong>📅 Calendario Compartido</strong><br>
        Sincroniza eventos y actividades de toda la familia
      </div>
      
      <div class="feature">
        <strong>⏰ Modo Enfoque</strong><br>
        Herramientas de productividad para aprovechar tu tiempo
      </div>
      
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
        ${customConfirmLink}
      </p>
      
      <p><strong>Nota:</strong> Este enlace es válido por 24 horas. Si no confirmaste tu cuenta, puedes solicitar un nuevo enlace desde la aplicación.</p>
    </div>
    
    <div class="footer">
      <p><strong>LifeBalance</strong> - Tu vida familiar organizada</p>
      <p>¡Gracias por unirte a nosotros!</p>
    </div>
  </div>
</body>
</html>`;

    const emailData = {
      from: 'LifeBalance <noreply@mylifebalanceapp.vercel.app>',
      to: [email],
      subject: '¡Bienvenido a LifeBalance! Confirma tu cuenta',
      html: emailHtml
    };

    console.log('Sending confirmation email via Resend API...');

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email via Resend: ${resendResponse.status} - ${errorText}`);
    }

    const resendResult = await resendResponse.json();
    console.log('Confirmation email sent successfully via Resend:', resendResult.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Confirmation email sent successfully',
        emailId: resendResult.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Confirmation email error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send confirmation email',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});