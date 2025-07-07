import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { logger } from '../lib/logger';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isSystemDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook personalizado mejorado
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

// Constantes
const THEME_STORAGE_KEY = 'lifebalance-theme';
const DARK_MODE_HOURS = { start: 19, end: 7 }; // 7PM - 7AM

// Utilidades para localStorage seguro
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      logger.warn('Error accessing localStorage:', error);
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      logger.warn('Error writing to localStorage:', error);
    }
  }
};


// Función para determinar tema basado en hora
const getTimeBasedTheme = (): ResolvedTheme => {
  const currentHour = new Date().getHours();
  return (currentHour >= DARK_MODE_HOURS.start || currentHour < DARK_MODE_HOURS.end) 
    ? 'dark' 
    : 'light';
};

// Función para obtener tema inicial
const getInitialTheme = (): Theme => {
  // Evitar acceso a localStorage en el servidor
  if (typeof window === 'undefined') return 'system';
  
  const savedTheme = safeLocalStorage.getItem(THEME_STORAGE_KEY);
  
  // Validar tema guardado
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    return savedTheme as Theme;
  }
  
  // Si no hay preferencia guardada, usar sistema por defecto
  return 'system';
};

// Función para resolver tema a valor concreto
const resolveTheme = (theme: Theme, systemDark: boolean): ResolvedTheme => {
  switch (theme) {
    case 'light':
      return 'light';
    case 'dark':
      return 'dark';
    case 'system':
      // Si el sistema no soporta preferencias, usar hora
      if (typeof window === 'undefined' || !window.matchMedia) {
        return getTimeBasedTheme();
      }
      return systemDark ? 'dark' : 'light';
    default:
      return 'light';
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isSystemDark, setIsSystemDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Resolver tema actual
  const resolvedTheme = resolveTheme(theme, isSystemDark);

  // Función para establecer tema
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    safeLocalStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  // Función para alternar tema
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Escuchar cambios en preferencias del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches);
    };

    // Establecer estado inicial
    setIsSystemDark(mediaQuery.matches);

    // Escuchar cambios
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Inicialización del tema desde localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initialTheme = getInitialTheme();
    setThemeState(initialTheme);
    setIsMounted(true);
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return;

    const root = document.documentElement;
    const body = document.body;

    // Remover clases anteriores
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Aplicar nueva clase
    root.classList.add(resolvedTheme);
    body.classList.add(resolvedTheme);

    // Establecer variables CSS personalizadas
    if (resolvedTheme === 'dark') {
      root.style.colorScheme = 'dark';
    } else {
      root.style.colorScheme = 'light';
    }

    // Meta theme-color para navegadores móviles
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content', 
        resolvedTheme === 'dark' ? '#1f2937' : '#3b82f6'
      );
    }

  }, [resolvedTheme, isMounted]);

  // Prevenir flash de contenido sin estilo
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Remover la clase de carga inicial después de hidratar
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('loading-theme');
    }, 100);

    return () => clearTimeout(timer);
  }, [isMounted]);

  // Escuchar cambios de hora para tema automático
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const checkTimeBasedTheme = () => {
      const timeTheme = getTimeBasedTheme();
      
      // Solo usar hora si el sistema no soporta preferencias
      if (!window.matchMedia || !window.matchMedia('(prefers-color-scheme: dark)').media) {
        setIsSystemDark(timeTheme === 'dark');
      }
    };

    // Verificar cada hora
    const interval = setInterval(checkTimeBasedTheme, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isSystemDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};