import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LayoutDashboard, Calendar, Focus, DollarSign, Users, Settings } from 'lucide-react';

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigation = [
    { name: 'Panel de Control', href: '/', icon: LayoutDashboard },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Modo Enfoque', href: '/focus', icon: Focus },
    { name: 'Finanzas', href: '/finance', icon: DollarSign },
    { name: 'Familia', href: '/family', icon: Users },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar component */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform ease-in-out duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <span className="h-8 w-8 rounded-md flex items-center justify-center bg-primary-500 text-white">
                <Calendar size={20} />
              </span>
              <span className="ml-2 text-xl font-heading font-semibold text-gray-900 dark:text-white">LifeBalance</span>
            </div>
            <button
              type="button"
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <Icon
                    className="mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-primary-200 font-semibold">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">John Doe</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gestionar Cuenta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;