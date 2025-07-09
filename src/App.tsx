import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContextHybrid';
import { FocusProvider } from './context/FocusContext';
import { Helmet, HelmetProvider } from 'react-helmet-async';

// Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading de páginas para mejor performance
const Auth = React.lazy(() => import('./pages/Auth'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const ResetPassword = React.lazy(() => import('./pages/ResetPasswordNative'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const FocusMode = React.lazy(() => import('./pages/FocusMode'));
const Finance = React.lazy(() => import('./pages/Finance'));
const Family = React.lazy(() => import('./pages/Family'));
const Settings = React.lazy(() => import('./pages/Settings'));

// Componente de carga mejorado
const PageWrapper: React.FC<{ 
  children: React.ReactNode;
  title: string;
  description?: string;
}> = ({ children, title, description }) => (
  <>
    <Helmet>
      <title>{title} - LifeBalance</title>
      {description && <meta name="description" content={description} />}
    </Helmet>
    <Suspense fallback={<LoadingSpinner />}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Suspense>
  </>
);

// Componente de ruta privada mejorado
const PrivateRoute: React.FC<{ 
  children: React.ReactNode;
  title: string;
  description?: string;
}> = ({ children, title, description }) => {
  const { user, loading } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Redirigir a auth si no está autenticado
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <PageWrapper title={title} description={description}>
      <Layout>
        {children}
      </Layout>
    </PageWrapper>
  );
};

// Componente de ruta pública
const PublicRoute: React.FC<{ 
  children: React.ReactNode;
  title: string;
  description?: string;
}> = ({ children, title, description }) => {
  const { user, loading } = useAuth();
  
  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Redirigir al dashboard si ya está autenticado
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <PageWrapper title={title} description={description}>
      {children}
    </PageWrapper>
  );
};

function App() {
  return (
    <HelmetProvider>
      <FocusProvider>
        <Routes>
        {/* Ruta pública - Autenticación */}
        <Route 
          path="/auth" 
          element={
            <PublicRoute 
              title="Iniciar Sesión"
              description="Accede a tu cuenta de LifeBalance para gestionar tu economía familiar"
            >
              <Auth />
            </PublicRoute>
          } 
        />
        
        {/* Ruta de callback de autenticación */}
        <Route 
          path="/auth/callback" 
          element={
            <PageWrapper title="Verificando autenticación">
              <AuthCallback />
            </PageWrapper>
          } 
        />
        
        {/* Ruta de reset password */}
        <Route 
          path="/auth/reset-password" 
          element={
            <PageWrapper title="Restablecer contraseña">
              <ResetPassword />
            </PageWrapper>
          } 
        />
        
        {/* Rutas privadas - Aplicación principal */}
        <Route 
          path="/" 
          element={
            <PrivateRoute 
              title="Dashboard"
              description="Panel principal de LifeBalance - Resumen de tu economía y organización familiar"
            >
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/calendar" 
          element={
            <PrivateRoute 
              title="Calendario"
              description="Organiza tu tiempo y eventos familiares con el calendario de LifeBalance"
            >
              <Calendar />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/focus" 
          element={
            <PrivateRoute 
              title="Modo Enfoque"
              description="Mejora tu productividad con las herramientas de enfoque de LifeBalance"
            >
              <FocusMode />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/finance" 
          element={
            <PrivateRoute 
              title="Finanzas"
              description="Gestiona tu economía familiar, gastos e ingresos con LifeBalance"
            >
              <Finance />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/family" 
          element={
            <PrivateRoute 
              title="Familia"
              description="Organiza y gestiona las actividades de tu familia con LifeBalance"
            >
              <Family />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <PrivateRoute 
              title="Configuración"
              description="Personaliza tu experiencia en LifeBalance"
            >
              <Settings />
            </PrivateRoute>
          } 
        />
        
        {/* Ruta por defecto - redirige según el estado de autenticación */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FocusProvider>
    </HelmetProvider>
  );
}

export default App;