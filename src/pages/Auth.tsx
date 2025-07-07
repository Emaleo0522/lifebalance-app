import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from "../context/AuthContextSimple";
import { 
  SignUpData, 
  FamilyRole, 
  AvatarIcon, 
  FAMILY_ROLE_LABELS, 
  AVATAR_ICON_SYMBOLS, 
  AVATAR_ICON_LABELS 
} from '../types/database';
import { safeStorage } from '../lib/storage';

const Auth: React.FC = () => {
  const { signIn, signUp, loading, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'auth' | 'profile'>(isSignUp ? 'auth' : 'auth');
  const [rememberMe, setRememberMe] = useState(false);

  // Formulario de autenticación
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Formulario de perfil (solo para registro)
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    display_name: '',
    family_role: 'member' as FamilyRole,
    avatar_icon: 'user' as AvatarIcon,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Cargar email guardado al inicializar el componente
  useEffect(() => {
    const savedEmail = safeStorage.getItem('remembered-email', '');
    if (savedEmail) {
      setAuthData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleAuthInputChange = (field: 'email' | 'password' | 'confirmPassword', value: string) => {
    setAuthData(prev => ({ ...prev, [field]: value }));
    clearError();
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProfileInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateAuthForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!authData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authData.email)) {
      errors.email = 'Ingresa un email válido';
    }

    if (!authData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (isSignUp) {
      // Validaciones más estrictas para registro
      if (authData.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/(?=.*[a-z])/.test(authData.password)) {
        errors.password = 'Debe contener al menos una letra minúscula';
      } else if (!/(?=.*[A-Z])/.test(authData.password)) {
        errors.password = 'Debe contener al menos una letra mayúscula';
      } else if (!/(?=.*\d)/.test(authData.password)) {
        errors.password = 'Debe contener al menos un número';
      }
    }

    // Validación de confirmación de contraseña solo para registro
    if (isSignUp) {
      if (!authData.confirmPassword) {
        errors.confirmPassword = 'Confirma tu contraseña';
      } else if (authData.password !== authData.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfileForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!profileData.display_name.trim()) {
      errors.display_name = 'El nombre para mostrar es requerido';
    }

    if (profileData.username && profileData.username.length < 3) {
      errors.username = 'Mínimo 3 caracteres';
    }

    if (profileData.username && !/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      errors.username = 'Solo letras, números y guiones bajos';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAuthForm()) return;

    try {
      // Guardar o eliminar email según el checkbox
      if (rememberMe) {
        safeStorage.setItem('remembered-email', authData.email);
      } else {
        safeStorage.removeItem('remembered-email');
      }
      
      await signIn(authData.email, authData.password);
    } catch {
      // Error se maneja en el context
    }
  };

  const handleSignUpStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAuthForm()) return;
    
    // Guardar o eliminar email según el checkbox
    if (rememberMe) {
      safeStorage.setItem('remembered-email', authData.email);
    } else {
      safeStorage.removeItem('remembered-email');
    }
    
    setStep('profile');
  };

  const handleSignUpComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    try {
      const signUpData: SignUpData = {
        ...authData,
        ...profileData,
        username: profileData.username.trim() || undefined,
      };

      await signUp(signUpData);
    } catch {
      // Error se maneja en el context
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setStep('auth');
    clearError();
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Mantener email si está guardado, sino limpiar todo
    const savedEmail = safeStorage.getItem('remembered-email', '');
    if (savedEmail) {
      setAuthData({ email: savedEmail, password: '', confirmPassword: '' });
      setRememberMe(true);
    } else {
      setAuthData({ email: '', password: '', confirmPassword: '' });
      setRememberMe(false);
    }
    
    setProfileData({
      name: '',
      username: '',
      display_name: '',
      family_role: 'member',
      avatar_icon: 'user',
    });
  };

  const goBackToAuth = () => {
    setStep('auth');
    setFormErrors({});
  };

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
            {step === 'auth' 
              ? (isSignUp ? 'Crea tu cuenta' : 'Bienvenido de vuelta')
              : 'Configura tu perfil'
            }
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error.message}</p>
            </div>
          )}

          {/* Step 1: Authentication */}
          {step === 'auth' && (
            <form onSubmit={isSignUp ? handleSignUpStep1 : handleSignIn}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={authData.email}
                    onChange={(e) => handleAuthInputChange('email', e.target.value)}
                    className={`input ${formErrors.email ? 'input-error' : ''}`}
                    placeholder="tu@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="label">
                    <Lock className="w-4 h-4 mr-2" />
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={authData.password}
                      onChange={(e) => handleAuthInputChange('password', e.target.value)}
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
                  {isSignUp && !formErrors.password && (
                    <p className="text-gray-500 text-xs mt-1">
                      Mínimo 8 caracteres, incluye mayúscula, minúscula y número
                    </p>
                  )}
                </div>

                {/* Confirmar contraseña - Solo para registro */}
                {isSignUp && (
                  <div>
                    <label className="label">
                      <Lock className="w-4 h-4 mr-2" />
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={authData.confirmPassword}
                        onChange={(e) => handleAuthInputChange('confirmPassword', e.target.value)}
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
                )}

                {/* Checkbox Recordarme */}
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Recordar mi email
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : isSignUp ? (
                    <UserPlus className="h-4 w-4 mr-2" />
                  ) : (
                    <LogIn className="h-4 w-4 mr-2" />
                  )}
                  {isSignUp ? 'Continuar' : 'Iniciar Sesión'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Profile Setup (solo para registro) */}
          {step === 'profile' && isSignUp && (
            <form onSubmit={handleSignUpComplete}>
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  type="button"
                  onClick={goBackToAuth}
                  className="text-primary-600 dark:text-primary-400 text-sm flex items-center hover:underline"
                >
                  ← Volver
                </button>

                {/* Avatar Selection */}
                <div>
                  <label className="label">Elige tu avatar</label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {(['user', 'father', 'mother', 'boy', 'girl', 'star', 'crown', 'heart', 'home', 'work'] as AvatarIcon[]).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => handleProfileInputChange('avatar_icon', icon)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          profileData.avatar_icon === icon 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                        title={AVATAR_ICON_LABELS[icon]}
                      >
                        <span className="text-2xl">{AVATAR_ICON_SYMBOLS[icon]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="label label-required">Nombre completo</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleProfileInputChange('name', e.target.value)}
                    className={`input ${formErrors.name ? 'input-error' : ''}`}
                    placeholder="Tu nombre completo"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Display Name */}
                <div>
                  <label className="label label-required">¿Cómo quieres que te llamen?</label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => handleProfileInputChange('display_name', e.target.value)}
                    className={`input ${formErrors.display_name ? 'input-error' : ''}`}
                    placeholder="Nombre para mostrar"
                  />
                  {formErrors.display_name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.display_name}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="label">Nombre de usuario (opcional)</label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => handleProfileInputChange('username', e.target.value)}
                    className={`input ${formErrors.username ? 'input-error' : ''}`}
                    placeholder="usuario_unico"
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>
                  )}
                </div>

                {/* Family Role */}
                <div>
                  <label className="label">Tu rol en la familia</label>
                  <select
                    value={profileData.family_role}
                    onChange={(e) => handleProfileInputChange('family_role', e.target.value)}
                    className="input"
                  >
                    {(Object.keys(FAMILY_ROLE_LABELS) as FamilyRole[]).map((role) => (
                      <option key={role} value={role}>
                        {FAMILY_ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  Crear cuenta
                </button>
              </div>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              <button
                onClick={toggleMode}
                className="ml-1 text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                {isSignUp ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;