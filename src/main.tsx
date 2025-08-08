import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { logger, ErrorCategory } from './lib/logger';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContextClerk';
import ErrorBoundary from './components/ErrorBoundary';

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key")
}

// Función para ocultar el loading screen
const hideLoadingScreen = () => {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.remove();
    }, 300);
  }
};

// Timeout de seguridad para evitar carga infinita
const safetyTimeout = setTimeout(() => {
  logger.warn('App taking too long to load, forcing hide loading screen', { timeout: 10000 });
  hideLoadingScreen();
}, 10000); // 10 segundos máximo

// Verificar que el DOM esté listo
const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    const error = logger.createError(
      'Root element not found in DOM',
      ErrorCategory.UI,
      'ROOT_ELEMENT_MISSING'
    );
    logger.error('Failed to initialize app', error);
    return;
  }

  // Crear la aplicación
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <ClerkProvider 
        publishableKey={clerkPubKey}
        signInUrl="/auth"
        signUpUrl="/auth?mode=sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      >
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <AuthProvider>
            <ErrorBoundary>
              <ThemeProvider>
                <App />
              </ThemeProvider>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </ClerkProvider>
    </StrictMode>
  );

  // Ocultar loading screen después de que React termine de renderizar
  clearTimeout(safetyTimeout);
  setTimeout(hideLoadingScreen, 100);
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}