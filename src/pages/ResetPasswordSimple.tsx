import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ResetPasswordSimple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Primero verificar si ya hay una sesión (Supabase maneja automáticamente el token del link)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('ResetPassword - Session check:', { 
          hasSession: !!session, 
          error: error?.message,
          allParams: Object.fromEntries(searchParams.entries())
        });

        if (error) {
          console.error('Error getting session:', error);
          setError('Error al verificar la sesión');
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Session found, user authenticated for password reset');
          setSessionReady(true);
          setIsLoading(false);
        } else {
          // Si no hay sesión, intentar obtenerla desde la URL
          console.log('No session found, checking URL parameters');
          
          const accessToken = searchParams.get('access_token') || searchParams.get('token');
          const refreshToken = searchParams.get('refresh_token');
          
          if (accessToken) {
            console.log('Found tokens in URL, establishing session');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            if (sessionError) {
              console.error('Error setting session:', sessionError);
              setError('Token de recuperación inválido o expirado');
            } else {
              console.log('Session established from URL tokens');
              setSessionReady(true);
            }
          } else {
            setError('No se encontró un token de recuperación válido');
          }
          
          setIsLoading(false);
        }

      } catch (error) {
        console.error('Error in session check:', error);
        setError('Error al procesar link de recuperación');
        setIsLoading(false);
      }
    };

    checkSession();
  }, [searchParams]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
      }
      
      if (event === 'USER_UPDATED') {
        console.log('Password updated successfully');
        setIsCompleted(true);
        
        setTimeout(() => {
          navigate('/auth');
        }, 3000);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¡Contraseña cambiada!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Redirigiendo en 3 segundos...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Procesando link de recuperación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="btn btn-primary"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Preparando formulario...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <span className="text-2xl text-white">🏠</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            LifeBalance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Restablecer contraseña
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#3B82F6',
                    brandAccent: '#2563EB',
                  },
                },
              },
            }}
            view="update_password"
            showLinks={false}
            providers={[]}
            localization={{
              variables: {
                update_password: {
                  password_label: 'Nueva contraseña',
                  password_input_placeholder: 'Tu nueva contraseña',
                  button_label: 'Actualizar contraseña',
                  loading_button_label: 'Actualizando...',
                },
              },
            }}
          />
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSimple;