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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { email }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if user exists
    const { data: existingUser, error: userCheckError } = await supabaseClient.auth.admin.getUserByEmail(email);
    
    if (userCheckError || !existingUser.user) {
      console.log('User not found for email:', email);
      // Return success even if user doesn't exist (security best practice)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'If the email exists in our system, a password reset link has been sent.' 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User found, generating reset token for:', email);

    // Generate password reset token using Supabase Admin API
    const { data: resetData, error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (resetError || !resetData) {
      console.error('Error generating reset link:', resetError);
      throw new Error('Failed to generate reset link');
    }

    console.log('Reset link generated successfully');

    // Extract the token from the generated link
    const resetUrl = new URL(resetData.properties.action_link);
    const token = resetUrl.searchParams.get('token');
    const refreshToken = resetUrl.searchParams.get('refresh_token');

    if (!token) {
      throw new Error('Failed to extract token from reset link');
    }

    // Get app URL from environment
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    
    // Create custom reset link that goes to our modal system
    const customResetLink = `${appUrl}/?type=recovery&access_token=${token}&refresh_token=${refreshToken}`;

    // Get user's first name for personalization
    const userName = existingUser.user.user_metadata?.first_name || 
                     existingUser.user.user_metadata?.name || 
                     email.split('@')[0];

    // Prepare email data for Resend
    const emailData = {
      from: 'LifeBalance <noreply@lifebalance.app>',
      to: [email],
      subject: 'Restablece tu contraseña - LifeBalance',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Restablecer contraseña - LifeBalance</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333333;
              background-color: #f8fafc;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .header .subtitle {
              margin: 8px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #2d3748;
            }
            .message {
              font-size: 16px;
              margin-bottom: 30px;
              color: #4a5568;
              line-height: 1.7;
            }
            .button-container {
              text-align: center;
              margin: 35px 0;
            }
            .reset-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
              transition: transform 0.2s;
            }
            .reset-button:hover {
              transform: translateY(-1px);
            }
            .security-note {
              background-color: #f7fafc;
              border-left: 4px solid #4299e1;
              padding: 16px;
              margin: 30px 0;
              border-radius: 0 8px 8px 0;
            }
            .security-note h3 {
              margin: 0 0 8px 0;
              color: #2b6cb0;
              font-size: 16px;
            }
            .security-note p {
              margin: 0;
              color: #4a5568;
              font-size: 14px;
            }
            .footer {
              background-color: #f8fafc;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer p {
              margin: 5px 0;
              color: #718096;
              font-size: 14px;
            }
            .footer a {
              color: #667eea;
              text-decoration: none;
            }
            .link-fallback {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              font-family: monospace;
              font-size: 12px;
              color: #4a5568;
              word-break: break-all;
            }
            @media (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 8px;
              }
              .header, .content, .footer {
                padding: 25px 20px;
              }
              .header h1 {
                font-size: 24px;
              }
              .reset-button {
                padding: 14px 28px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div style="background-color: #f8fafc; padding: 20px 0;">
            <div class="container">
              <div class="header">
                <h1>🏠 LifeBalance</h1>
                <p class="subtitle">Gestión familiar inteligente</p>
              </div>
              
              <div class="content">
                <div class="greeting">
                  ¡Hola ${userName}!
                </div>
                
                <div class="message">
                  Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en LifeBalance. 
                  Si fuiste tú quien hizo esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.
                </div>
                
                <div class="button-container">
                  <a href="${customResetLink}" class="reset-button">
                    🔒 Restablecer mi contraseña
                  </a>
                </div>
                
                <div class="security-note">
                  <h3>🛡️ Información de seguridad</h3>
                  <p>
                    • Este enlace es válido por 24 horas<br>
                    • Solo funciona una vez<br>
                    • Si no solicitaste este cambio, puedes ignorar este email
                  </p>
                </div>
                
                <div class="message">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:
                </div>
                
                <div class="link-fallback">
                  ${customResetLink}
                </div>
              </div>
              
              <div class="footer">
                <p><strong>LifeBalance</strong> - Tu vida familiar organizada</p>
                <p>
                  Si tienes problemas, contáctanos en 
                  <a href="mailto:support@lifebalance.app">support@lifebalance.app</a>
                </p>
                <p style="margin-top: 20px; font-size: 12px; color: #a0aec0;">
                  Este email fue enviado porque solicitaste restablecer tu contraseña en LifeBalance.
                  Si no fuiste tú, por favor ignora este mensaje.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email using Brevo API
    const brevoApiKey = Deno.env.get('BREVO_API_KEY');
    if (!brevoApiKey) {
      throw new Error('BREVO_API_KEY not configured');
    }

    console.log('Sending password reset email via Brevo...');

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
      throw new Error(`Failed to send email via Brevo: ${brevoResponse.status}`);
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