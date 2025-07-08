import React, { useState } from 'react';
import { User, Shield, Bell, Palette, LogOut, Edit3, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import { useTheme } from '../context/ThemeContext';
import ProfileSetup from '../components/ProfileSetup';
import { AVATAR_ICON_SYMBOLS } from '../types/database';
import { audioNotifications } from '../lib/audio';

const Settings: React.FC = () => {
  const { user, userProfile, signOut, loading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences' | 'notifications'>('profile');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Audio settings state
  const [audioEnabled, setAudioEnabled] = useState(audioNotifications.isNotificationsEnabled());
  const [audioVolume, setAudioVolume] = useState(audioNotifications.getVolume());


  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileUpdate = () => {
    setShowProfileEdit(false);
  };

  // Audio settings handlers
  const handleAudioToggle = () => {
    const newEnabled = !audioEnabled;
    setAudioEnabled(newEnabled);
    audioNotifications.setEnabled(newEnabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAudioVolume(newVolume);
    audioNotifications.setVolume(newVolume);
  };

  const handleTestSound = async () => {
    await audioNotifications.testSound();
  };


  const tabs = [
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'account' as const, label: 'Cuenta', icon: Shield },
    { id: 'preferences' as const, label: 'Preferencias', icon: Palette },
    { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
          
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu cuenta y preferencias de LifeBalance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Información del Perfil
                  </h2>
                  <button
                    onClick={() => setShowProfileEdit(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Avatar y info básica */}
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {userProfile?.avatar_icon ? AVATAR_ICON_SYMBOLS[userProfile.avatar_icon] : '👤'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {userProfile?.display_name || userProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {userProfile?.family_role || 'Miembro'}
                      </p>
                    </div>
                  </div>

                  {/* Información del perfil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre completo
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {userProfile?.name || user?.user_metadata?.name || 'No especificado'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre para mostrar
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {userProfile?.display_name || userProfile?.name || user?.user_metadata?.name || 'No especificado'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {userProfile?.username || 'No especificado'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Configuración de Cuenta
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email de la cuenta
                    </h3>
                    <p className="text-gray-900 dark:text-white mb-2">
                      {user?.email}
                    </p>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      Cambiar email
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña
                    </h3>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
                      Cambiar contraseña
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Zona de peligro
                    </h3>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Preferencias
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tema
                    </h3>
                    <div className="flex space-x-2">
                      {(['light', 'dark', 'system'] as const).map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            theme === themeOption
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {themeOption === 'light' && 'Claro'}
                          {themeOption === 'dark' && 'Oscuro'}
                          {themeOption === 'system' && 'Sistema'}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tema actual: {resolvedTheme}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Notificaciones
                </h2>
                
                <div className="space-y-6">
                  {/* Audio Notifications */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {audioEnabled ? (
                          <Volume2 className="w-5 h-5 text-blue-600 mr-3" />
                        ) : (
                          <VolumeX className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Sonidos de notificación
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Reproducir sonidos para alertas y recordatorios
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={audioEnabled}
                          onChange={handleAudioToggle}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {audioEnabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Volumen: {Math.round(audioVolume * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={audioVolume}
                            onChange={handleVolumeChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                          />
                        </div>
                        
                        <button
                          onClick={handleTestSound}
                          className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Volume2 className="w-4 h-4 mr-2" />
                          Probar sonido
                        </button>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          <p>• Temporizador de enfoque: 1 beep largo</p>
                          <p>• Recordatorios de calendario: 2 beeps cortos</p>
                          <p>• Tareas familiares: 3 beeps rápidos</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notificaciones de email
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recibir notificaciones por correo electrónico
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notificaciones push
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Recibir notificaciones en el navegador
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición de perfil */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] mx-4 overflow-hidden">
            <ProfileSetup 
              onComplete={handleProfileUpdate}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;