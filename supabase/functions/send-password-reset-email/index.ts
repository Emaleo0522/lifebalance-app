import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
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

    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing password reset for:', email);

    // Check if user exists
    const { data: existingUser, error: userCheckError } = await supabaseClient.auth.admin.getUserByEmail(email);
    
    if (userCheckError || !existingUser.user) {
      console.log('User not found for email:', email);
      // Return success for security (don't reveal if email exists)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If the email exists in our system, a password reset link has been sent.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate password reset token
    const { data: resetData, error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (resetError || !resetData) {
      console.error('Error generating reset link:', resetError);
      throw new Error('Failed to generate reset link');
    }

    // Extract tokens from the generated link
    const resetUrl = new URL(resetData.properties.action_link);
    const token = resetUrl.searchParams.get('token');
    const refreshToken = resetUrl.searchParams.get('refresh_token');

    if (!token) {
      throw new Error('Failed to extract token from reset link');
    }

    // Get user's name for personalization
    const userName = existingUser.user.user_metadata?.first_name || 
                     existingUser.user.user_metadata?.name || 
                     email.split('@')[0];

    // Create custom reset link
    const appUrl = Deno.env.get('APP_URL') || 'https://mylifebalanceapp.vercel.app';
    const customResetLink = `${appUrl}/auth/reset-password?access_token=${token}&refresh_token=${refreshToken}&type=recovery`;

    // Send email using Brevo API directly
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY not configured');
    }

    const emailData = {
      sender: {
        name: 'LifeBalance Soporte',
        email: 'soportelifebalance@gmail.com'
      },
      to: [
        {
          email: email,
          name: userName
        }
      ],
      subject: 'Restablece tu contraseña - LifeBalance',
      htmlContent: `
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
              <h2>¡Hola ${userName}!</h2>
              
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en LifeBalance.</p>
              
              <p>Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo:</p>
              
              <p style="text-align: center;">
                <a href="${customResetLink}" class="button">🔒 Restablecer mi contraseña</a>
              </p>
              
              <p><strong>Información de seguridad:</strong></p>
              <ul>
                <li>Este enlace es válido por 24 horas</li>
                <li>Solo funciona una vez</li>
                <li>Si no solicitaste este cambio, puedes ignorar este email</li>
              </ul>
              
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
                ${customResetLink}
              </p>
            </div>
            
            <div class="footer">
              <p><strong>LifeBalance</strong> - Tu vida familiar organizada</p>
              <p>Este email fue enviado porque solicitaste restablecer tu contraseña.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('Sending email via Brevo API...');

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error('Brevo API error:', errorText);
      throw new Error(`Failed to send email via Brevo: ${brevoResponse.status} - ${errorText}`);
    }

    const brevoResult = await brevoResponse.json();
    console.log('Email sent successfully via Brevo:', brevoResult.messageId);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password reset email sent successfully',
        emailId: brevoResult.messageId
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send password reset email',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});