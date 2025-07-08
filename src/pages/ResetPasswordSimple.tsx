import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { CheckCircle } from 'lucide-react';

const ResetPasswordSimple: React.FC = () => {
  const navigate = useNavigate();
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Usuario ha llegado desde email de recuperación
        console.log('Password recovery event detected');
      }
      
      if (event === 'USER_UPDATED') {
        // Contraseña actualizada exitosamente
        console.log('Password updated successfully');
        setIsCompleted(true);
        
        // Redirigir después de 3 segundos
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