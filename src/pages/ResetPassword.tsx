import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Verificar que tenemos los parámetros necesarios
  useEffect(() => {
    // DEBUG: Log todos los parámetros que llegan
    console.log('ResetPassword - All URL params:', Object.fromEntries(searchParams.entries()));
    
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    console.log('ResetPassword - Token exists:', !!token);
    console.log('ResetPassword - Type:', type);
    
    if (!token || type !== 'recovery') {
      console.log('ResetPassword - Invalid link detected');
      setError('Enlace de recuperación inválido o expirado');
    } else {
      console.log('ResetPassword - Valid recovery link');
    }
  }, [searchParams]);

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

    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');
    
    if (!token) {
      setError('Token de recuperación no encontrado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Primero establecer la sesión usando el token de recuperación
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken || ''
      });

      if (sessionError) {
        console.error('Error setting session:', sessionError);
        throw new Error('Token de recuperación inválido o expirado');
      }

      // Ahora actualizar la contraseña
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) throw error;

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/auth');
      }, 3000);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
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

export default ResetPassword;