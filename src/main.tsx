import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContextHybrid';
import ErrorBoundary from './components/ErrorBoundary';

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
  console.warn('App taking too long to load, forcing hide loading screen');
  hideLoadingScreen();
}, 10000); // 10 segundos máximo

// Verificar que el DOM esté listo
const initializeApp = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // Crear la aplicación
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
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