import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import PersistentTimer from '../PersistentTimer';
import RealtimeStatus from '../RealtimeStatus';
import { Bell } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  
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