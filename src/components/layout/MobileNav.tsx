import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Focus, DollarSign, Users } from 'lucide-react';

const MobileNav: React.FC = () => {
  const navigation = [
    { name: 'Panel', href: '/', icon: LayoutDashboard },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Enfoque', href: '/focus', icon: Focus },
    { name: 'Finanzas', href: '/finance', icon: DollarSign },
    { name: 'Familia', href: '/family', icon: Users },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-around px-2 z-10">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-2 py-1 rounded-md transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
            <span className="text-xs mt-1">{item.name}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default MobileNav;