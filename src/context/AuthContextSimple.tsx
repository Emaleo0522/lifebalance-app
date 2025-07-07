import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

// Versión simplificada sin UserProfile para debugging
type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función de inicio de sesión simplificada
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) throw error;
      
      // No hacer nada más, el onAuthStateChange manejará el resto
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error de autenticación';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicialización SIMPLIFICADA
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      logger.log('🚀 Inicializando Auth SIMPLIFICADO...');
      
      try {
        // Timeout de emergencia
        const emergencyTimeout = setTimeout(() => {
          logger.error('⚠️ EMERGENCY TIMEOUT - Auth tomó más de 5 segundos');
          if (isMounted) {
            setLoading(false);
            setUser(null);
          }
        }, 5000);

        logger.log('📡 Obteniendo sesión...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(emergencyTimeout);

        if (error) {
          logger.error('❌ Error obteniendo sesión:', error);
          setError(error.message);
        }

        logger.log('✅ Sesión obtenida:', session?.user?.email || 'Sin sesión');

        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        logger.error('💥 Error crítico en auth:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'Error desconocido');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener simplificado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      logger.log('🔄 Auth change:', event, session?.user?.email || 'Sin usuario');
      
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};