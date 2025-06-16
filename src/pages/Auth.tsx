import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react';

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp 
              ? 'Crea una cuenta para gestionar tu tiempo y finanzas'
              : 'Inicia sesión para continuar con tu progreso'
            }
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-error-50 dark:bg-error-900/20 text-error-800 dark:text-error-200 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Crear cuenta
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {isSignUp
                ? '¿Ya tienes una cuenta? Inicia sesión'
                : '¿No tienes una cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;