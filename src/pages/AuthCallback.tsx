import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AuthCallback = () => {
  const navigate = useNavigate();

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
          navigate('/dashboard');
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
  }, [navigate]);

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