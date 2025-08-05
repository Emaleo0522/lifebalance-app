import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom';

const AuthClerk: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'sign-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            LifeBalance
          </h1>
          <p className="text-gray-600">
            Organiza tu familia, gestiona tu tiempo
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {mode === 'sign-up' ? (
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
                  card: 'shadow-none',
                  headerTitle: 'text-lg font-semibold text-gray-900',
                  headerSubtitle: 'text-gray-600',
                  socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                  formFieldInput: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                }
              }}
              afterSignUpUrl="/dashboard"
              signInUrl="/auth?mode=sign-in"
            />
          ) : (
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
                  card: 'shadow-none',
                  headerTitle: 'text-lg font-semibold text-gray-900',
                  headerSubtitle: 'text-gray-600',
                  socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                  formFieldInput: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                }
              }}
              afterSignInUrl="/dashboard"
              signUpUrl="/auth?mode=sign-up"
            />
          )}
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          {mode === 'sign-up' ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <a href="/auth?mode=sign-in" className="text-indigo-600 hover:text-indigo-700">
                Inicia sesión
              </a>
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <a href="/auth?mode=sign-up" className="text-indigo-600 hover:text-indigo-700">
                Regístrate
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthClerk;