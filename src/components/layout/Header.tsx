import React from 'react';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type HeaderProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-1 justify-between px-4 md:px-6">
        <div className="flex flex-1 items-center">
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Search */}
          <div className="relative w-full max-w-xs ml-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input !pl-10 text-sm !py-1.5"
              placeholder="Buscar tareas, eventos, etc..."
            />
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 space-x-3">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="user-menu-button"
            >
              <span className="sr-only">Abrir menú de usuario</span>
              <div className="h-8 w-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-primary-200 font-semibold text-sm">
                JD
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;