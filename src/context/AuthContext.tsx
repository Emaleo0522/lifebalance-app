import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UpdateProfileData, SignUpData, FamilyRole, AvatarIcon } from '../types/database';
import { logger } from '../lib/logger';

// Tipos de errores personalizados
type AuthErrorType = 'auth' | 'network' | 'validation' | 'unknown';

interface AuthErrorInfo {
  type: AuthErrorType;
  message: string;
  originalError?: Error;
}

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: AuthErrorInfo | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado mejorado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

// Funciones de validación
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUsername = (username: string): string | null => {
  if (username.length < 3) {
    return 'El nombre de usuario debe tener al menos 3 caracteres';
  }
  if (username.length > 20) {
    return 'El nombre de usuario no puede tener más de 20 caracteres';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'El nombre de usuario solo puede contener letras, números y guiones bajos';
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'La contraseña debe contener al menos una letra minúscula';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'La contraseña debe contener al menos una letra mayúscula';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'La contraseña debe contener al menos un número';
  }
  return null;
};

// Función para categorizar errores
const categorizeError = (error: AuthError | Error | unknown): AuthErrorInfo => {
  if (!error) {
    return { type: 'unknown', message: 'Error desconocido' };
  }

  // Error de Supabase Auth
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const authError = error as AuthError;
    
    switch (authError.message) {
      case 'Invalid login credentials':
        return { 
          type: 'auth', 
          message: 'Credenciales incorrectas. Verifica tu email y contraseña.',
          originalError: authError
        };
      case 'User already registered':
        return { 
          type: 'auth', 
          message: 'Este email ya está registrado. Intenta iniciar sesión.',
          originalError: authError
        };
      case 'Email not confirmed':
        return { 
          type: 'auth', 
          message: 'Por favor confirma tu email antes de iniciar sesión.',
          originalError: authError
        };
      default:
        // Verificar si es error de username duplicado
        if (authError.message.includes('duplicate key') || authError.message.includes('unique constraint')) {
          return {
            type: 'validation',
            message: 'Este nombre de usuario ya está en uso. Elige otro.',
            originalError: authError
          };
        }
        return { 
          type: 'auth', 
          message: authError.message || 'Error de autenticación',
          originalError: authError
        };
    }
  }

  // Error de red
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { 
      type: 'network', 
      message: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
      originalError: error
    };
  }

  return { 
    type: 'unknown', 
    message: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
    originalError: error as Error
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthErrorInfo | null>(null);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // fetchUserProfile - Optimizado para evitar colgados
  const fetchUserProfile = useCallback(async (userId: string) => {
    logger.log('📝 fetchUserProfile - Iniciando para userId:', userId);
    
    try {
      // Crear una promesa con timeout más agresivo
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('fetchUserProfile timeout')), 3000); // 3 segundos
      });

      const result = await Promise.race([profilePromise, timeoutPromise]);
      const { data, error } = result as { data: any; error: any };

      if (error) {
        logger.warn('⚠️ Error en fetchUserProfile, continuando sin perfil:', error);
        setUserProfile(null);
        return;
      }

      if (data) {
        logger.log('✅ Perfil obtenido exitosamente');
        setUserProfile(data);
      } else {
        logger.warn('⚠️ No se encontraron datos del usuario');
        setUserProfile(null);
      }
    } catch (error) {
      logger.warn('⚠️ Error o timeout en fetchUserProfile, continuando sin perfil:', error);
      setUserProfile(null);
    }
  }, []);

  // Función para refrescar la sesión
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setUser(data.user);
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
    } catch (error) {
      logger.error('Error refrescando sesión:', error);
      setError(categorizeError(error));
    }
  }, [fetchUserProfile]);

  // createUserProfile - ahora usa UPDATE
  const createUserProfile = useCallback(async (user: User, additionalData?: Partial<SignUpData>) => {
    logger.log('createUserProfile - Iniciando con user:', user.id);
    
    try {
      // Primero verificar si el usuario ya existe
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id, email, name, username, display_name')
        .eq('id', user.id)
        .maybeSingle();

      if (selectError) {
        logger.error('Error verificando usuario existente:', selectError);
        throw selectError;
      }

      const profileData = {
        name: additionalData?.name || user.user_metadata?.name || null,
        username: additionalData?.username || null,
        display_name: additionalData?.display_name || additionalData?.name || user.user_metadata?.name || null,
        family_role: (additionalData?.family_role || 'member') as FamilyRole,
        avatar_icon: (additionalData?.avatar_icon || 'user') as AvatarIcon,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      if (existingUser) {
        // Usar UPDATE en lugar de INSERT
        logger.log('Usuario existe, actualizando perfil...');
        
        const { error: updateError } = await supabase
          .from('users')
          .update(profileData)
          .eq('id', user.id)
          .select('*');

        if (updateError) {
          if (updateError.code === '23505' && updateError.message.includes('username')) {
            throw new Error('Este nombre de usuario ya está en uso');
          }
          throw updateError;
        }
      } else {
        // Si no existe (caso raro), crear con INSERT
        logger.log('Usuario no existe, creando nuevo perfil...');
        
        const fullProfileData = {
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
          ...profileData,
        };

        const { error: insertError } = await supabase
          .from('users')
          .insert([fullProfileData])
          .select('*');

        if (insertError) {
          if (insertError.code === '23505' && insertError.message.includes('username')) {
            throw new Error('Este nombre de usuario ya está en uso');
          }
          throw insertError;
        }
      }

      // Obtener el perfil actualizado
      logger.log('Obteniendo perfil después de actualización...');
      await fetchUserProfile(user.id);
      
    } catch (error) {
      logger.error('Error en creación/actualización de perfil:', error);
      throw error;
    }
  }, [fetchUserProfile]);

  // Función para actualizar perfil
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    if (!user) throw new Error('No hay usuario autenticado');

    logger.log('updateProfile - Iniciando con datos:', data);
    
    setLoading(true);
    setError(null);

    try {
      // Validar username si se está actualizando
      if (data.username !== undefined) {
        const usernameError = validateUsername(data.username);
        if (usernameError) {
          throw new Error(usernameError);
        }
      }

      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select('*');

      if (error) throw error;

      // Refrescar perfil
      logger.log('Refrescando perfil después de update...');
      await fetchUserProfile(user.id);
    } catch (error) {
      const authError = categorizeError(error);
      setError(authError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, fetchUserProfile]);

  // Inicialización y suscripción a cambios de auth
  useEffect(() => {
    // Evitar ejecutar en el servidor
    if (typeof window === 'undefined') return;

    let isMounted = true;
    let isInitialized = false;

    const initializeAuth = async () => {
      if (isInitialized) return; // Prevenir múltiples inicializaciones
      isInitialized = true;
      
      logger.log('🚀 Inicializando Auth...');
      
      try {
        // Timeout de emergencia más agresivo
        const emergencyTimeout = setTimeout(() => {
          logger.error('⚠️ EMERGENCY TIMEOUT - Auth tomó más de 5 segundos');
          if (isMounted) {
            setLoading(false);
            setUser(null);
            setUserProfile(null);
          }
        }, 5000);

        // Verificar sesión actual
        logger.log('📡 Obteniendo sesión de Supabase...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(emergencyTimeout);

        if (error) {
          logger.error('❌ Error obteniendo sesión:', error);
          setError(categorizeError(error));
        }

        logger.log('✅ Sesión actual:', session?.user?.email || 'No hay sesión');

        if (isMounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            logger.log('👤 Obteniendo perfil del usuario logueado...');
            try {
              // Timeout más corto para el perfil
              await Promise.race([
                fetchUserProfile(session.user.id),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
                )
              ]);
            } catch (error) {
              logger.warn('⚠️ Error o timeout obteniendo perfil, continuando sin perfil:', error);
              setUserProfile(null);
            }
          }
          setLoading(false);
        }
      } catch (error) {
        logger.error('💥 Error crítico inicializando auth:', error);
        if (isMounted) {
          setError(categorizeError(error));
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación - SIN await para evitar bloqueos
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      logger.log('🔄 Auth state change:', event, session?.user?.email);
      
      setUser(session?.user ?? null);
      setError(null);

      if (session?.user) {
        logger.log('👤 Usuario en sesión, obteniendo perfil...');
        // No usar await aquí para evitar bloqueos
        fetchUserProfile(session.user.id).catch(error => {
          logger.warn('⚠️ Error obteniendo perfil en onChange:', error);
          setUserProfile(null);
        });
      } else {
        logger.log('👋 No hay usuario, limpiando perfil...');
        setUserProfile(null);
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ DEPENDENCIAS VACÍAS para evitar re-renders infinitos

  // Función de registro optimizada
  const signUp = useCallback(async (data: SignUpData) => {
    logger.log('signUp - Datos recibidos:', { ...data, password: '[HIDDEN]' });
    
    setLoading(true);
    setError(null);

    try {
      // Validaciones
      if (!validateEmail(data.email)) {
        throw new Error('Por favor ingresa un email válido');
      }

      const passwordError = validatePassword(data.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      // Validar username si se proporciona
      if (data.username) {
        const usernameError = validateUsername(data.username);
        if (usernameError) {
          throw new Error(usernameError);
        }
      }

      logger.log('Registrando usuario en Supabase Auth...');

      // Registro en Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: data.name?.trim() || null,
            display_name: data.display_name?.trim() || data.name?.trim() || null,
          }
        }
      });

      if (error) throw error;

      // Si el usuario se crea, actualizar perfil con datos adicionales
      if (authData.user) {
        logger.log('Actualizando perfil de usuario...');
        await createUserProfile(authData.user, data);

        // Si el usuario necesita confirmación de email
        if (!authData.user.email_confirmed_at) {
          setError({
            type: 'auth',
            message: 'Te hemos enviado un email de confirmación. Por favor revisa tu bandeja de entrada.'
          });
        }
      }

    } catch (error) {
      const authError = categorizeError(error);
      setError(authError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createUserProfile]);

  // Función de inicio de sesión optimizada
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!validateEmail(email)) {
        throw new Error('Por favor ingresa un email válido');
      }

      if (!password || password.length < 6) {
        throw new Error('Por favor ingresa una contraseña válida');
      }

      // Inicio de sesión
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;

    } catch (error) {
      const authError = categorizeError(error);
      setError(authError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de cierre de sesión optimizada
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = categorizeError(error);
      setError(authError);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};