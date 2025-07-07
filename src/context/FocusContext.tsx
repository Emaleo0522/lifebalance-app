import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { safeStorage } from '../lib/storage';
import { logger } from '../lib/logger';

export type FocusSession = {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number; // in minutes
  completed: boolean;
  distractions: string[];
};

export type DistractionSource = {
  id: string;
  name: string;
  blockLevel: 'remind' | 'block';
};

interface FocusContextType {
  // Sessions
  focusSessions: FocusSession[];
  setFocusSessions: React.Dispatch<React.SetStateAction<FocusSession[]>>;
  
  // Distraction sources
  distractionSources: DistractionSource[];
  setDistractionSources: React.Dispatch<React.SetStateAction<DistractionSource[]>>;
  
  // Active session state
  activeSession: FocusSession | null;
  setActiveSession: React.Dispatch<React.SetStateAction<FocusSession | null>>;
  
  // Timer state
  timeRemaining: number;
  setTimeRemaining: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Timer actions
  startSession: (duration: number) => void;
  startFocusSession: (duration: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  completeSession: () => void;
  addDistraction: (distraction: string) => void;
  recordDistraction: (distraction: string) => void;
  
  // Statistics
  getFocusStatistics: () => { completedSessions: number; totalTime: number; };
  
  // Distraction sources actions
  addDistractionSource: (source: DistractionSource) => void;
  removeDistractionSource: (id: string) => void;
  updateDistractionSource: (id: string, updates: Partial<DistractionSource>) => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocusContext = () => {
  const context = useContext(FocusContext);
  if (context === undefined) {
    throw new Error('useFocusContext must be used within a FocusProvider');
  }
  return context;
};

interface FocusProviderProps {
  children: ReactNode;
}

export const FocusProvider: React.FC<FocusProviderProps> = ({ children }) => {
  // Load focus sessions from localStorage with error handling
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    return safeStorage.getItem<FocusSession[]>('focusSessions', []);
  });

  // Load distraction sources from localStorage with error handling
  const [distractionSources, setDistractionSources] = useState<DistractionSource[]>(() => {
    const defaultSources = [
      { id: '1', name: 'Facebook', blockLevel: 'remind' as const },
      { id: '2', name: 'YouTube', blockLevel: 'remind' as const },
      { id: '3', name: 'Email', blockLevel: 'remind' as const },
    ];
    return safeStorage.getItem<DistractionSource[]>('distractionSources', defaultSources);
  });

  // Current active session - persisted in localStorage
  const [activeSession, setActiveSession] = useState<FocusSession | null>(() => {
    return safeStorage.getItem<FocusSession | null>('activeSession', null);
  });

  // Timer state - persisted in localStorage
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    return safeStorage.getItem<number>('timeRemaining', 0);
  });
  
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    return safeStorage.getItem<boolean>('isRunning', false);
  });

  // Save to localStorage when data changes with error handling
  useEffect(() => {
    const success = safeStorage.setItem('focusSessions', focusSessions);
    if (!success) {
      logger.error('Failed to save focus sessions to localStorage');
    }
  }, [focusSessions]);

  useEffect(() => {
    const success = safeStorage.setItem('distractionSources', distractionSources);
    if (!success) {
      logger.error('Failed to save distraction sources to localStorage');
    }
  }, [distractionSources]);

  useEffect(() => {
    safeStorage.setItem('activeSession', activeSession);
  }, [activeSession]);

  useEffect(() => {
    safeStorage.setItem('timeRemaining', timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    safeStorage.setItem('isRunning', isRunning);
  }, [isRunning]);

  // Timer effect - solo depende de isRunning
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeRemaining((currentTime) => {
          const newTime = currentTime - 1;
          if (newTime <= 0) {
            // Timer finished
            setIsRunning(false);
            setActiveSession(prev => {
              if (prev) {
                const updatedSession = {
                  ...prev,
                  completed: true,
                  endTime: Date.now(),
                };
                
                // Update focus sessions
                setFocusSessions(sessions => 
                  sessions.map(session => 
                    session.id === prev.id ? updatedSession : session
                  )
                );
                
                // Clear persistent state
                safeStorage.removeItem('activeSession');
                safeStorage.removeItem('timeRemaining');
                safeStorage.removeItem('isRunning');
                
                return null;
              }
              return prev;
            });
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Timer actions
  const startSession = (duration: number) => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      duration,
      completed: false,
      distractions: [],
    };

    setActiveSession(newSession);
    setTimeRemaining(duration * 60); // Convert minutes to seconds
    setIsRunning(true);
    setFocusSessions(prev => [...prev, newSession]);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const resumeSession = () => {
    setIsRunning(true);
  };

  const stopSession = () => {
    setIsRunning(false);
    setActiveSession(prev => {
      if (prev) {
        const updatedSession = {
          ...prev,
          completed: false,
          endTime: Date.now(),
        };
        
        // Update focus sessions
        setFocusSessions(sessions => 
          sessions.map(session => 
            session.id === prev.id ? updatedSession : session
          )
        );
        
        // Clear persistent state
        safeStorage.removeItem('activeSession');
        safeStorage.removeItem('timeRemaining');
        safeStorage.removeItem('isRunning');
        
        return null;
      }
      return prev;
    });
    setTimeRemaining(0);
  };

  const addDistraction = (distraction: string) => {
    setActiveSession(prev => {
      if (prev) {
        const updated = {
          ...prev,
          distractions: [...prev.distractions, distraction],
        };
        
        // Update in focus sessions as well
        setFocusSessions(sessions => 
          sessions.map(session => 
            session.id === prev.id ? updated : session
          )
        );
        
        return updated;
      }
      return prev;
    });
  };

  const recordDistraction = (distraction: string) => {
    addDistraction(distraction);
  };

  const completeSession = () => {
    setIsRunning(false);
    setActiveSession(prev => {
      if (prev) {
        const updatedSession = {
          ...prev,
          completed: true,
          endTime: Date.now(),
        };
        
        // Update focus sessions
        setFocusSessions(sessions => 
          sessions.map(session => 
            session.id === prev.id ? updatedSession : session
          )
        );
        
        // Clear persistent state
        safeStorage.removeItem('activeSession');
        safeStorage.removeItem('timeRemaining');
        safeStorage.removeItem('isRunning');
        
        return null;
      }
      return prev;
    });
    setTimeRemaining(0);
  };

  // Distraction sources actions
  const addDistractionSource = (source: DistractionSource) => {
    setDistractionSources(prev => [...prev, source]);
  };

  const removeDistractionSource = (id: string) => {
    setDistractionSources(prev => prev.filter(source => source.id !== id));
  };

  const updateDistractionSource = (id: string, updates: Partial<DistractionSource>) => {
    setDistractionSources(prev => 
      prev.map(source => 
        source.id === id ? { ...source, ...updates } : source
      )
    );
  };

  // Get focus statistics
  const getFocusStatistics = () => {
    const completedSessions = focusSessions.filter(session => session.completed).length;
    const totalTime = focusSessions.reduce((total, session) => {
      if (session.completed) {
        return total + session.duration;
      }
      return total;
    }, 0);
    
    return {
      completedSessions,
      totalTime
    };
  };

  const value: FocusContextType = {
    focusSessions,
    setFocusSessions,
    distractionSources,
    setDistractionSources,
    activeSession,
    setActiveSession,
    timeRemaining,
    setTimeRemaining,
    isRunning,
    setIsRunning,
    startSession,
    startFocusSession: startSession, // Alias para compatibilidad
    pauseSession,
    resumeSession,
    stopSession,
    completeSession,
    addDistraction,
    recordDistraction,
    getFocusStatistics,
    addDistractionSource,
    removeDistractionSource,
    updateDistractionSource,
  };

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
};