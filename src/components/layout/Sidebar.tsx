import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Focus, 
  DollarSign, 
  Users, 
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContextClerk';
import { AVATAR_ICON_SYMBOLS } from '../../types/database';
import { logger } from '../../lib/logger';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendario', href: '/calendar', icon: Calendar },
  { name: 'Modo Enfoque', href: '/focus', icon: Focus },
  { name: 'Finanzas', href: '/finance', icon: DollarSign },
  { name: 'Familia', href: '/family', icon: Users },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, userProfile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      logger.error('Error al cerrar sesión:', error);
    }
  };

  // Función para obtener las iniciales del usuario
  const getUserInitials = () => {
    if (userProfile?.display_name) {
      return userProfile.display_name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (userProfile?.name) {
      return userProfile.name
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    return userProfile?.display_name || 
           userProfile?.name || 
           user?.user_metadata?.name ||
           user?.email?.split('@')[0] || 
           'Usuario';
  };

  // Función para obtener el email
  const getUserEmail = () => {
    return user?.email || '';
  };

  // Función para obtener el avatar/emoji
  const getAvatarIcon = () => {
    if (userProfile?.avatar_icon && AVATAR_ICON_SYMBOLS[userProfile.avatar_icon]) {
      return AVATAR_ICON_SYMBOLS[userProfile.avatar_icon];
    }
    return null;
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-primary-600 dark:bg-primary-700">
            <div className="flex items-center">
              <span className="text-2xl">🏠</span>
              <span className="ml-2 text-xl font-bold text-white">LifeBalance</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
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
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1 min-w-0">
                <div className="h-9 w-9 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center text-primary-700 dark:text-primary-200 font-semibold">
                  {getAvatarIcon() || getUserInitials()}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {getUserEmail()}
                  </p>
                </div>
              </div>
              
              {/* Logout button */}
              <button
                onClick={handleSignOut}
                className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
