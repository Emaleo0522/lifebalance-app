import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  invitationId: string;
  email: string;
  inviterName: string;
  familyGroupName: string;
  role: string;
  invitationToken: string;
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
    const { invitationId, email, inviterName, familyGroupName, role, invitationToken }: InvitationRequest = await req.json();

    // Validate required fields
    if (!invitationId || !email || !inviterName || !familyGroupName || !invitationToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get app URL from environment or default
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    
    // Create invitation link
    const invitationLink = `${appUrl}/family/invitation?token=${invitationToken}`;

    // Prepare email content
    const roleLabels = {
      'admin': 'administrador',
      'member': 'miembro',
      'child': 'hijo/a'
    };

    const roleLabel = roleLabels[role as keyof typeof roleLabels] || 'miembro';

    const emailSubject = `Invitación al grupo familiar "${familyGroupName}" en LifeBalance`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin-bottom: 10px;">🏠 LifeBalance</h1>
          <h2 style="color: #374151; margin-bottom: 20px;">¡Te han invitado al grupo familiar!</h2>
        </div>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
            Hola,
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">
            <strong>${inviterName}</strong> te ha invitado a unirte al grupo familiar 
            <strong>"${familyGroupName}"</strong> en LifeBalance como <strong>${roleLabel}</strong>.
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Con LifeBalance podrás gestionar las finanzas familiares, organizar tareas y 
            mantener a toda la familia conectada y organizada.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" 
             style="display: inline-block; background-color: #3B82F6; color: white; 
                    padding: 12px 30px; text-decoration: none; border-radius: 6px; 
                    font-size: 16px; font-weight: 500;">
            Unirme al grupo familiar
          </a>
        </div>

        <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="color: #92400E; font-size: 14px; margin: 0;">
            <strong>⏰ Importante:</strong> Esta invitación expirará en 7 días.
          </p>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
            Si tienes problemas con el botón, puedes copiar y pegar este enlace en tu navegador:
          </p>
          <p style="color: #3B82F6; font-size: 14px; word-break: break-all; margin-bottom: 15px;">
            ${invitationLink}
          </p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.5; margin-bottom: 5px;">
            Si no solicitaste esta invitación, puedes ignorar este email.
          </p>
          <p style="color: #6B7280; font-size: 14px; line-height: 1.5;">
            ¡Saludos!<br>
            El equipo de LifeBalance
          </p>
        </div>
      </div>
    `;

    // Send email using Supabase Edge Function or third-party service
    // For now, we'll use a simple email service (you can integrate with SendGrid, Resend, etc.)
    
    // Example with Resend (you would need to add Resend to your project)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (resendApiKey) {
      // Send email using Resend
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LifeBalance <invitations@lifebalance.app>',
          to: [email],
          subject: emailSubject,
          html: emailBody,
        }),
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error('Error sending email:', errorText);
        throw new Error(`Failed to send email: ${errorText}`);
      }
      
      const emailResult = await emailResponse.json();
      console.log('Email sent successfully:', emailResult);
    } else {
      // Log the email content for development/testing
      console.log('Email would be sent to:', email);
      console.log('Subject:', emailSubject);
      console.log('Body:', emailBody);
    }

    // Update invitation status in database
    const { error: updateError } = await supabaseClient
      .from('pending_invitations')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('Error updating invitation status:', updateError);
      throw new Error(`Failed to update invitation status: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation email sent successfully',
        invitationLink 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-invitation-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});