import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onClose }) => {
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
      console.log('Updating password from modal...');
      
      const { error } = await supabase.auth.updateUser({
        password: passwords.password
      });

      if (error) {
        console.error('Error updating password:', error);
        throw error;
      }

      console.log('Password updated successfully from modal');
      setSuccess(true);
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        // Reset form
        setPasswords({ password: '', confirmPassword: '' });
        setSuccess(false);
        setFormErrors({});
        setError(null);
      }, 2000);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      console.error('Password update failed:', message);
      setError((message));
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

  const handleClose = () => {
    if (loading) return; // No cerrar si está procesando
    
    setPasswords({ password: '', confirmPassword: '' });
    setFormErrors({});
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md transform rounded-xl bg-white dark:bg-gray-800 shadow-xl transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Lock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                Cambiar contraseña
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              /* Success State */
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  ¡Contraseña actualizada!
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Tu contraseña ha sido cambiada exitosamente.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Establece una nueva contraseña para tu cuenta.
                  </p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Nueva contraseña */}
                  <div>
                    <label className="label">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.password}
                        onChange={(e) => handlePasswordChange('password', e.target.value)}
                        className={`input pr-10 ${formErrors.password ? 'input-error' : ''}`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                    )}
                    {!formErrors.password && (
                      <p className="mt-1 text-xs text-gray-500">
                        Mínimo 8 caracteres, incluye mayúscula, minúscula y número
                      </p>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div>
                    <label className="label">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className={`input pr-10 ${formErrors.confirmPassword ? 'input-error' : ''}`}
                        placeholder="••••••••"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary flex-1 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;