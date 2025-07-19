import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UpdateProfileData, SignUpData, FamilyRole, AvatarIcon } from '../types/database';
import { logger } from '../lib/logger';
import { translateError } from '../lib/errorTranslations';

// Contexto híbrido que combina funcionalidad completa con carga rápida
type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // fetchUserProfile optimizado y con timeout
  const fetchUserProfile = useCallback(async (userId: string) => {
    logger.log('📝 Obteniendo perfil para:', userId);
    
    try {
      // Promesa con timeout más simple
      const profilePromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile timeout')), 2000);
      });

      const result = await Promise.race([profilePromise, timeoutPromise]);
      const { data, error } = result as { data: UserProfile | null; error: any };

      if (error) {
        logger.warn('⚠️ Error obteniendo perfil:', error);
        setUserProfile(null);
        return null;
      }

      if (data) {
        logger.log('✅ Perfil obtenido');
        setUserProfile(data);
        return data;
      } else {
        logger.warn('⚠️ No se encontró perfil de usuario');
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      logger.warn('⚠️ Error o timeout obteniendo perfil:', error);
      setUserProfile(null);
      return null;
    }
  }, []);

  // Función de registro - usando solo Edge Functions para evitar SMTP nativo
  const signUp = useCallback(async (data: SignUpData) => {
    setLoading(true);
    setError(null);

    try {
      // Crear usuario SIN confirmación automática - forzar confirmación manual
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          // Forzar que NO se envíe email automático
          emailRedirectTo: undefined,
          data: {
            name: data.name?.trim() || null,
            display_name: data.display_name?.trim() || data.name?.trim() || null,
          }
        }
      });

      if (error) throw error;

      // Si el usuario se crea, actualizar perfil
      if (authData.user) {
        // Crear/actualizar perfil de usuario
        const profileData = {
          name: data.name?.trim() || null,
          username: data.username?.trim() || null,
          display_name: data.display_name?.trim() || data.name?.trim() || null,
          family_role: (data.family_role || 'member') as FamilyRole,
          avatar_icon: (data.avatar_icon || 'user') as AvatarIcon,
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from('users')
          .update(profileData)
          .eq('id', authData.user.id);

        // Usuario registrado - ahora requiere confirmación por email
        if (authData.user && !authData.user.email_confirmed_at) {
          console.log('Usuario registrado, requiere confirmación por email');
          setError('¡Registro exitoso! Te hemos enviado un email de confirmación. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta antes de poder iniciar sesión.');
        } else {
          console.log('Usuario registrado y confirmado automáticamente');
          setError('¡Registro exitoso! Puedes iniciar sesión con tu email y contraseña.');
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de registro';
      setError(translateError(message));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de inicio de sesión
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de autenticación';
      setError(translateError(message));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función de cierre de sesión
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setError(translateError(message));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar perfil
  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    if (!user) throw new Error('No hay usuario autenticado');

    setLoading(true);
    setError(null);

    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      // Refrescar perfil
      await fetchUserProfile(user.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar perfil';
      setError(translateError(message));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, fetchUserProfile]);

  // Función para restablecer contraseña usando sistema híbrido: Supabase nativo + Edge Functions con Resend
  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Trying password reset via Supabase native auth (with SMTP)...');
      
      // OPCIÓN 1: Intentar reset nativo de Supabase que usa la configuración SMTP
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          console.error('Supabase native reset failed:', error);
          throw error;
        }

        console.log('Password reset email sent successfully via Supabase native method');
        return; // Éxito con método nativo
      } catch (nativeError) {
        console.warn('Supabase native method failed, trying Edge Function with Resend...');
        
        // OPCIÓN 2: Fallback a Edge Function con Resend
        const { data, error: edgeError } = await supabase.functions.invoke('send-password-reset-email', {
          body: { email }
        });

        if (edgeError) {
          console.error('Edge Function with Resend also failed:', edgeError);
          throw edgeError;
        }

        console.log('Password reset email sent successfully via Edge Function with Resend', data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar email de recuperación';
      console.error('All reset password methods failed:', message);
      setError(translateError(message));
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialización OPTIMIZADA para carga rápida
  useEffect(() => {
    let isMounted = true;
    let authInitialized = false;

    const initializeAuth = async () => {
      if (authInitialized) return;
      authInitialized = true;

      logger.log('🚀 Inicializando Auth Híbrido...');
      
      try {
        // Timeout de emergencia muy agresivo para UI responsiva
        const emergencyTimeout = setTimeout(() => {
          logger.warn('⚠️ EMERGENCY TIMEOUT - Forzando carga de UI');
          if (isMounted) {
            setLoading(false);
            setUser(null);
            setUserProfile(null);
          }
        }, 3000); // Solo 3 segundos máximo

        // Obtener sesión con timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session timeout')), 2000);
        });

        const result = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]);
        const { data: { session }, error } = result as { data: { session: any }; error: any };
        
        clearTimeout(emergencyTimeout);

        if (error) {
          logger.warn('⚠️ Error obteniendo sesión:', error);
          setError('Error de conexión');
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          
          // Obtener perfil en background, sin bloquear UI
          if (session?.user) {
            fetchUserProfile(session.user.id).catch(error => {
              logger.warn('⚠️ Error obteniendo perfil en inicialización:', error);
            });
          }
          
          setLoading(false);
        }
      } catch (error) {
        logger.warn('⚠️ Error en inicialización, continuando:', error);
        if (isMounted) {
          setError('Error de inicialización');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener de cambios de auth - NO BLOQUEANTE
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      logger.log('🔄 Auth change:', event, session?.user?.email || 'Sin usuario');
      
      setUser(session?.user ?? null);
      setError(null);

      // Obtener perfil sin bloquear
      if (session?.user) {
        fetchUserProfile(session.user.id).catch(error => {
          logger.warn('⚠️ Error obteniendo perfil en onChange:', error);
        });
      } else {
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
  }, []); // Sin dependencias para evitar re-renders

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};