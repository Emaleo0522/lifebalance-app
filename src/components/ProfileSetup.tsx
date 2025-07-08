import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { useAuth } from "../context/AuthContextHybrid";
import { 
  FamilyRole, 
  AvatarIcon, 
  FAMILY_ROLE_LABELS, 
  AVATAR_ICON_SYMBOLS, 
  AVATAR_ICON_LABELS,
  UpdateProfileData 
} from '../types/database';
import { logger } from '../lib/logger';

interface ProfileSetupProps {
  onComplete?: () => void;
  isModal?: boolean;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, isModal = false }) => {
  const { userProfile, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    username: userProfile?.username || '',
    display_name: userProfile?.display_name || '',
    family_role: (userProfile?.family_role || 'member') as FamilyRole,
    avatar_icon: (userProfile?.avatar_icon || 'user') as AvatarIcon,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'El nombre para mostrar es requerido';
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo letras, números y guiones bajos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updateData: UpdateProfileData = {
        name: formData.name.trim(),
        username: formData.username.trim() || undefined,
        display_name: formData.display_name.trim(),
        family_role: formData.family_role,
        avatar_icon: formData.avatar_icon,
      };

      logger.log('Datos a enviar:', updateData);
      await updateProfile(updateData);
      logger.log('Actualización exitosa');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔧 CONTAINER CLASS MEJORADO para modal con scroll
  const containerClass = isModal 
    ? 'w-full h-full flex flex-col' // Modal: Flex column para header + scroll content + footer
    : 'max-w-2xl mx-auto space-y-6'; // Página normal

  const contentClass = isModal
    ? 'flex-1 overflow-y-auto px-6 py-4' // Modal: Área scrolleable
    : 'space-y-6'; // Página normal

  const footerClass = isModal
    ? 'flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' // Modal: Footer fijo
    : ''; // Página normal sin footer especial

  return (
    <div className={containerClass}>
      {/* 🔧 HEADER FIJO (solo para modal) */}
      {isModal && (
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Editar Perfil
          </h2>
        </div>
      )}

      {/* 🔧 CONTENIDO SCROLLEABLE */}
      <div className={contentClass}>
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Header para versión no-modal */}
          {!isModal && (
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                Configura tu perfil
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Personaliza tu información y avatar
              </p>
            </div>
          )}

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Ícono de perfil
            </label>
            <div className="grid grid-cols-6 gap-3">
              {(Object.keys(AVATAR_ICON_SYMBOLS) as AvatarIcon[]).map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleInputChange('avatar_icon', icon)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    formData.avatar_icon === icon
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                  title={AVATAR_ICON_LABELS[icon]}
                >
                  <span className="text-2xl">{AVATAR_ICON_SYMBOLS[icon]}</span>
                  <div className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                    {AVATAR_ICON_LABELS[icon]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Tu nombre completo"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre para mostrar *
            </label>
            <input
              type="text"
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.display_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Cómo quieres que te llamen"
            />
            {errors.display_name && (
              <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de usuario (opcional)
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="usuario_unico"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solo letras, números y guiones bajos. Mínimo 3 caracteres.
            </p>
          </div>

          {/* Family Role */}
          <div>
            <label htmlFor="family_role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol en la familia
            </label>
            <select
              id="family_role"
              value={formData.family_role}
              onChange={(e) => handleInputChange('family_role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {(Object.keys(FAMILY_ROLE_LABELS) as FamilyRole[]).map((role) => (
                <option key={role} value={role}>
                  {FAMILY_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Vista previa:
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">
                    {AVATAR_ICON_SYMBOLS[formData.avatar_icon]}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.display_name || 'Nombre para mostrar'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {FAMILY_ROLE_LABELS[formData.family_role]}
                  {formData.username && ` • @${formData.username}`}
                </p>
              </div>
            </div>
          </div>

          {/* 🔧 BOTÓN SUBMIT (solo para versión no-modal) */}
          {!isModal && (
            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar perfil
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 🔧 FOOTER FIJO CON BOTONES (solo para modal) */}
      {isModal && (
        <div className={footerClass}>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onComplete}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="profile-form"
              disabled={isSubmitting || loading}
              onClick={handleSubmit}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;