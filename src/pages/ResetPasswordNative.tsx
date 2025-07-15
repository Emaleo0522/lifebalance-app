import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ResetPasswordNative: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Verificar si el usuario llegó desde un link de recovery
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        console.log('Checking recovery session...');
        
        const searchParams = new URLSearchParams(location.search);
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('URL params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
        
        // Si tenemos tokens en la URL, establecer la sesión
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Setting session with tokens from URL...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setError('Error al procesar el enlace de recuperación. Solicita un nuevo enlace.');
            return;
          }
          
          console.log('Session set successfully:', { user: data.user?.email });
          setIsReady(true);
          
          // Limpiar la URL
          window.history.replaceState({}, document.title, '/auth/reset-password');
          return;
        }
        
        // Si no hay tokens en URL, verificar sesión existente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Recovery session check:', { 
          hasSession: !!session, 
          userEmail: session?.user?.email,
          error: error?.message 
        });

        if (error) {
          console.error('Error checking session:', error);
          setError('Error al verificar la sesión de recuperación');
          return;
        }

        if (!session?.user) {
          setError('Sesión de recuperación inválida o expirada. Solicita un nuevo enlace de recuperación.');
          return;
        }

        console.log('Recovery session valid, user can reset password');
        setIsReady(true);

      } catch (error) {
        console.error('Error in recovery check:', error);
        setError('Error al procesar la solicitud de recuperación');
      }
    };

    checkRecoverySession();
  }, [location]);

  const validatePasswords = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwords.password) {
      errors.password = 'La contraseña es requerida';
    } else if (passwords.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])/.test(passwords.password)) {
      errors.password = 'Debe contener al menos una letra minúscula';
    } else if (!/(?=.*[A-Z])/.test(passwords.password)) {
      errors.password = 'Debe contener al menos una letra mayúscula';
    } else if (!/(?=.*\d)/.test(passwords.password)) {
      errors.password = 'Debe contener al menos un número';
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (passwords.password !== passwords.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Attempting to update password...');
      
      // Actualizar la contraseña usando Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      console.log('Password updated successfully');
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      console.error('Password update failed:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (field: 'password' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
    setError(null);
  };

  // Loading state
  if (!isReady && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verificando enlace de recuperación...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
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

  // Error state
  if (error && !isReady) {
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth')}
                className="w-full btn btn-primary"
              >
                Ir al inicio de sesión
              </button>
              <button
                onClick={() => navigate('/auth')}
                className="w-full text-primary-600 dark:text-primary-400 hover:underline text-sm"
              >
                Solicitar nuevo enlace de recuperación
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset password form
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
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="label">
                  <Lock className="w-4 h-4 mr-2" />
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.password}
                    onChange={(e) => handlePasswordChange('password', e.target.value)}
                    className={`input pr-10 ${formErrors.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
                )}
                {!formErrors.password && (
                  <p className="text-gray-500 text-xs mt-1">
                    Mínimo 8 caracteres, incluye mayúscula, minúscula y número
                  </p>
                )}
              </div>

              <div>
                <label className="label">
                  <Lock className="w-4 h-4 mr-2" />
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`input pr-10 ${formErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Cambiar contraseña
              </button>
            </div>
          </form>

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

export default ResetPasswordNative;