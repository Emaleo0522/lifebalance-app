import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import PersistentTimer from '../PersistentTimer';
import RealtimeStatus from '../RealtimeStatus';
import PasswordResetModal from '../PasswordResetModal';
import InvitationNotification from '../InvitationNotification';
import { Bell } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContextHybrid';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const { resolvedTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  // Detectar si el usuario llegó desde un link de recovery o confirmación de email
  useEffect(() => {
    if (user) {
      const searchParams = new URLSearchParams(location.search);
      const hash = location.hash;
      
      // Verificar si es confirmación de email exitosa
      if (searchParams.get('confirmed') === 'true') {
        console.log('Layout - Email confirmed successfully');
        toast.success('¡Tu email ha sido confirmado exitosamente! Bienvenido a LifeBalance 🎉', {
          duration: 5000,
          position: 'top-center',
        });
        
        // Limpiar la URL después de mostrar el mensaje
        if (window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        return;
      }
      
      // Verificar diferentes formas en que puede llegar el parámetro de recovery
      const hasRecoveryParam = 
        searchParams.get('type') === 'recovery' ||
        searchParams.has('access_token') ||
        searchParams.has('refresh_token') ||
        hash.includes('type=recovery') ||
        hash.includes('access_token');

      console.log('Layout - Checking recovery params:', {
        hasRecoveryParam,
        searchParams: Object.fromEntries(searchParams.entries()),
        hash,
        userLoggedIn: !!user
      });

      if (hasRecoveryParam) {
        console.log('Layout - Recovery detected, showing password reset modal');
        setShowPasswordResetModal(true);
        
        // Limpiar la URL después de detectar el recovery
        if (window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    }
  }, [user, location]);
  
  // Random motivational quote for notification example
  const quotes = [
    "¿Es este el mejor uso de tu tiempo ahora mismo?",
    "El progreso pequeño sigue siendo progreso.",
    "Enfócate en lo que más importa hoy.",
    "Tu atención es tu recurso más valioso.",
    "¿Cuál es la tarea más importante que puedes completar ahora?",
    "Recuerda tus metas financieras antes de gastar.",
    "Tómate un momento para respirar y reenfocarte.",
    "Las distracciones son temporales, el progreso es permanente."
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-200">
      {/* Sidebar for desktop */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            {/* Motivational notification */}
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-md shadow-sm animate-fade-in flex items-start">
              <Bell className="text-primary-500 mr-3 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-primary-800 dark:text-primary-200 text-sm">{randomQuote}</p>
            </div>
            
            {/* Page content */}
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
        
        {/* Mobile navigation */}
        <MobileNav />
      </div>
      
      {/* Persistent timer */}
      <PersistentTimer />
      
      {/* Realtime connection status */}
      <RealtimeStatus />
      
      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
      />

      {/* Invitation Notifications */}
      <InvitationNotification />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          duration: 4000,
          style: {
            background: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            color: resolvedTheme === 'dark' ? '#f9fafb' : '#111827',
            border: resolvedTheme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            boxShadow: resolvedTheme === 'dark' 
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)'
              : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontSize: '0.875rem',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            },
            style: {
              border: '1px solid #10b981',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            },
            style: {
              border: '1px solid #ef4444',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
            },
            style: {
              border: '1px solid #3b82f6',
            },
          },
        }}
      />
    </div>
  );
};

export default Layout;