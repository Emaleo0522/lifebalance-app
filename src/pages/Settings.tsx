import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Bell, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    focusReminders: true,
    financialAlerts: true,
    motivationalQuotes: true,
  });
  
  // Handle notification toggle
  const handleNotificationToggle = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };
  
  // Save settings
  const handleSaveSettings = () => {
    // In a real app, this would persist settings to a backend
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    alert('¡Configuración guardada!');
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Personaliza tu experiencia en la aplicación
        </p>
      </div>
      
      {/* Appearance */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2 text-primary-500" />
          Apariencia
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tema</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Elige entre modo claro y oscuro
              </p>
            </div>
            
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <>
                  <Moon className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Oscuro</span>
                </>
              ) : (
                <>
                  <Sun className="h-5 w-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Claro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-primary-500" />
          Notificaciones
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recordatorios de Tareas</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recibe notificaciones para tareas próximas
              </p>
            </div>
            
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="taskReminders"
                checked={notifications.taskReminders}
                onChange={() => handleNotificationToggle('taskReminders')}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="taskReminders"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notifications.taskReminders ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recordatorios de Enfoque</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recibe notificaciones cuando sea hora de una sesión de enfoque
              </p>
            </div>
            
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="focusReminders"
                checked={notifications.focusReminders}
                onChange={() => handleNotificationToggle('focusReminders')}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="focusReminders"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notifications.focusReminders ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alertas Financieras</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Recibe alertas para próximos pagos de facturas
              </p>
            </div>
            
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="financialAlerts"
                checked={notifications.financialAlerts}
                onChange={() => handleNotificationToggle('financialAlerts')}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="financialAlerts"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notifications.financialAlerts ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Frases Motivacionales</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Muestra frases motivacionales para ayudar a mantener el enfoque
              </p>
            </div>
            
            <div className="relative inline-block w-12 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="motivationalQuotes"
                checked={notifications.motivationalQuotes}
                onChange={() => handleNotificationToggle('motivationalQuotes')}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="motivationalQuotes"
                className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notifications.motivationalQuotes ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Gestión de Datos
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={handleSaveSettings}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-5 w-5 mr-1" />
            Guardar Configuración
          </button>
          
          <button
            onClick={handleSignOut}
            className="btn bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300 hover:bg-error-200 dark:hover:bg-error-800/30"
          >
            Cerrar Sesión
          </button>
          
          <button
            className="btn bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300 hover:bg-error-200 dark:hover:bg-error-800/30"
          >
            Restablecer Todos los Datos
          </button>
        </div>
      </div>
      
      {/* CSS for toggle switch */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #6B9080;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #6B9080;
        }
        .toggle-checkbox {
          right: 0;
          z-index: 1;
          border-color: #D1D5DB;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: background-color 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default Settings;