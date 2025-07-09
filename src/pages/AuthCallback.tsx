import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // DEBUG: Log todos los parámetros que llegan
        console.log('AuthCallback - All URL params:', Object.fromEntries(searchParams.entries()));
        
        // Verificar si es un callback de recovery (reset password)
        const type = searchParams.get('type');
        console.log('AuthCallback - Type:', type);
        
        if (type === 'recovery') {
          console.log('AuthCallback - Handling recovery flow');
          // Redirigir a la página de reset password con todos los parámetros
          const token = searchParams.get('token') || searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          
          console.log('AuthCallback - Tokens:', { token: !!token, refreshToken: !!refreshToken });
          
          const params = new URLSearchParams();
          if (token) params.set('access_token', token);
          if (refreshToken) params.set('refresh_token', refreshToken);
          params.set('type', 'recovery');
          
          const redirectUrl = `/auth/reset-password?${params.toString()}`;
          console.log('AuthCallback - Redirecting to:', redirectUrl);
          
          navigate(redirectUrl);
          return;
        }

        // Verificar si es confirmación de email
        if (type === 'signup' || type === 'email_change') {
          console.log('AuthCallback - Handling email confirmation');
          // Supabase maneja automáticamente la confirmación de email
          // Solo necesitamos verificar que la sesión esté activa
        }

        // Manejar el callback de autenticación normal
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error en callback de autenticación:', error);
          navigate('/auth?error=callback_error');
          return;
        }

        if (data?.session) {
          // Usuario autenticado correctamente
          console.log('Usuario autenticado exitosamente');
          
          // Verificar si es confirmación de email exitosa
          if (type === 'signup') {
            console.log('AuthCallback - Email confirmed successfully');
            // Mostrar mensaje de bienvenida y redirigir al dashboard
            navigate('/?confirmed=true');
            return;
          }
          
          // Verificar si hay parámetros de invitación a grupo
          const invitationId = searchParams.get('invitation_id');
          const groupId = searchParams.get('group_id');
          const role = searchParams.get('role');
          
          if (invitationId && groupId && role) {
            // El usuario fue invitado a un grupo, procesarlo
            try {
              // Verificar si ya es miembro del grupo
              const { data: existingMember } = await supabase
                .from('family_members')
                .select('id')
                .eq('group_id', groupId)
                .eq('user_id', data.session.user.id)
                .maybeSingle();
              
              if (!existingMember) {
                // Agregar usuario al grupo familiar
                await supabase
                  .from('family_members')
                  .insert([{
                    group_id: groupId,
                    user_id: data.session.user.id,
                    role: role
                  }]);
              }
              
              // Marcar invitación como aceptada
              await supabase
                .from('pending_invitations')
                .update({ 
                  status: 'accepted',
                  accepted_at: new Date().toISOString()
                })
                .eq('id', invitationId);
              
              console.log('Usuario agregado al grupo familiar exitosamente');
              navigate('/family?joined=true');
            } catch (groupError) {
              console.error('Error al agregar usuario al grupo:', groupError);
              navigate('/family?error=group_join_error');
            }
          } else {
            // Verificar si hay invitaciones pendientes para este email
            try {
              const { data: pendingInvites } = await supabase
                .from('pending_invitations')
                .select('*')
                .eq('email', data.session.user.email)
                .in('status', ['pending', 'sent'])
                .not('expires_at', 'lt', new Date().toISOString());
              
              if (pendingInvites && pendingInvites.length > 0) {
                // Procesar todas las invitaciones pendientes válidas
                for (const invite of pendingInvites) {
                  try {
                    // Verificar si ya es miembro del grupo
                    const { data: existingMember } = await supabase
                      .from('family_members')
                      .select('id')
                      .eq('group_id', invite.group_id)
                      .eq('user_id', data.session.user.id)
                      .maybeSingle();
                    
                    if (!existingMember) {
                      // Agregar usuario al grupo familiar
                      await supabase
                        .from('family_members')
                        .insert([{
                          group_id: invite.group_id,
                          user_id: data.session.user.id,
                          role: invite.role
                        }]);
                    }
                    
                    // Marcar invitación como aceptada
                    await supabase
                      .from('pending_invitations')
                      .update({ 
                        status: 'accepted',
                        accepted_at: new Date().toISOString()
                      })
                      .eq('id', invite.id);
                    
                    console.log('Usuario agregado al grupo desde invitación pendiente:', invite.family_group_name);
                  } catch (inviteProcessError) {
                    console.error('Error procesando invitación individual:', inviteProcessError);
                    // Continuar con otras invitaciones
                  }
                }
                
                // Redirigir al grupo familiar después de procesar invitaciones
                navigate('/family?joined=true');
              } else {
                // Navegación normal después de confirmación de email
                navigate('/');
              }
            } catch (inviteError) {
              console.error('Error al procesar invitaciones pendientes:', inviteError);
              // Continuar con navegación normal
              navigate('/');
            }
          }
        } else {
          // No hay sesión, redirigir a login
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error procesando callback:', error);
        navigate('/auth?error=callback_error');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Verificando autenticación...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;