import { useEffect, useState } from 'react';

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

export const useFocusMode = () => {
  // Load focus sessions from localStorage
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focusSessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Load distraction sources from localStorage
  const [distractionSources, setDistractionSources] = useState<DistractionSource[]>(() => {
    const saved = localStorage.getItem('distractionSources');
    return saved 
      ? JSON.parse(saved) 
      : [
          { id: '1', name: 'Facebook', blockLevel: 'remind' },
          { id: '2', name: 'YouTube', blockLevel: 'remind' },
          { id: '3', name: 'Email', blockLevel: 'remind' },
        ];
  });

  // Current active session
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('focusSessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  useEffect(() => {
    localStorage.setItem('distractionSources', JSON.stringify(distractionSources));
  }, [distractionSources]);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      completeSession();
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeRemaining]);

  // Start a new focus session
  const startFocusSession = (durationMinutes: number) => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      duration: durationMinutes,
      completed: false,
      distractions: [],
    };
    
    setActiveSession(newSession);
    setTimeRemaining(durationMinutes * 60);
    setIsRunning(true);
    
    // Add to sessions list
    setFocusSessions((prev) => [...prev, newSession]);
    
    return newSession;
  };

  // Complete the current session
  const completeSession = () => {
    if (activeSession) {
      const updatedSession = {
        ...activeSession,
        completed: true,
        endTime: Date.now(),
      };
      
      setFocusSessions((prev) =>
        prev.map((session) =>
          session.id === activeSession.id ? updatedSession : session
        )
      );
      
      setActiveSession(null);
      setIsRunning(false);
    }
  };

  // Pause the current session
  const pauseSession = () => {
    setIsRunning(false);
  };

  // Resume the current session
  const resumeSession = () => {
    if (activeSession && !isRunning && timeRemaining > 0) {
      setIsRunning(true);
    }
  };

  // Record a distraction
  const recordDistraction = (source: string) => {
    if (activeSession) {
      const updatedSession = {
        ...activeSession,
        distractions: [...activeSession.distractions, source],
      };
      
      setActiveSession(updatedSession);
      
      setFocusSessions((prev) =>
        prev.map((session) =>
          session.id === activeSession.id ? updatedSession : session
        )
      );
    }
  };

  // Add a distraction source to block/remind about
  const addDistractionSource = (name: string, blockLevel: 'remind' | 'block' = 'remind') => {
    const newSource = {
      id: Date.now().toString(),
      name,
      blockLevel,
    };
    
    setDistractionSources((prev) => [...prev, newSource]);
  };

  // Update a distraction source
  const updateDistractionSource = (id: string, updates: Partial<DistractionSource>) => {
    setDistractionSources((prev) =>
      prev.map((source) => (source.id === id ? { ...source, ...updates } : source))
    );
  };

  // Remove a distraction source
  const removeDistractionSource = (id: string) => {
    setDistractionSources((prev) => prev.filter((source) => source.id !== id));
  };

  // Get focus statistics
  const getFocusStatistics = () => {
    const completedSessions = focusSessions.filter((session) => session.completed);
    const totalFocusTime = completedSessions.reduce((total, session) => total + session.duration, 0);
    const averageDistractions = completedSessions.length > 0
      ? completedSessions.reduce((total, session) => total + session.distractions.length, 0) / completedSessions.length
      : 0;
      
    return {
      completedSessions: completedSessions.length,
      totalFocusTime,
      averageDistractions,
    };
  };

  return {
    focusSessions,
    distractionSources,
    activeSession,
    timeRemaining,
    isRunning,
    startFocusSession,
    completeSession,
    pauseSession,
    resumeSession,
    recordDistraction,
    addDistractionSource,
    updateDistractionSource,
    removeDistractionSource,
    getFocusStatistics,
  };
};