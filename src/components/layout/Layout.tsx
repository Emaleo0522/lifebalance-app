import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();
  
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
    </div>
  );
};

export default Layout;