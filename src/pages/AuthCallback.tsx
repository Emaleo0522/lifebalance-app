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
        // Manejar el callback de autenticación
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error en callback de autenticación:', error);
          navigate('/auth?error=callback_error');
          return;
        }

        if (data?.session) {
          // Usuario autenticado correctamente
          console.log('Usuario autenticado exitosamente');
          
          // Verificar si hay parámetros de invitación a grupo
          const invitedToGroup = searchParams.get('invited_to_group');
          const role = searchParams.get('role');
          
          if (invitedToGroup && role) {
            // El usuario fue invitado a un grupo, procesarlo
            try {
              await supabase
                .from('family_members')
                .insert([{
                  group_id: invitedToGroup,
                  user_id: data.session.user.id,
                  role: role
                }]);
              
              console.log('Usuario agregado al grupo familiar exitosamente');
              navigate('/family?joined=true');
            } catch (groupError) {
              console.error('Error al agregar usuario al grupo:', groupError);
              navigate('/family?error=group_join_error');
            }
          } else {
            // Navegación normal después de confirmación de email
            navigate('/');
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
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Verificando autenticación...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;