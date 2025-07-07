import React from 'react';
import { Clock, Play, Pause, StopCircle } from 'lucide-react';
import { useFocusMode } from '../hooks/useFocusMode';
import { useLocation, useNavigate } from 'react-router-dom';

const PersistentTimer: React.FC = () => {
  const {
    activeSession,
    timeRemaining,
    isRunning,
    pauseSession,
    resumeSession,
    stopSession,
  } = useFocusMode();

  const location = useLocation();
  const navigate = useNavigate();


  // Don't show if there's no active session or if we're on the focus mode page
  if (!activeSession || location.pathname === '/focus') {
    return null;
  }

  // Format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerClick = () => {
    navigate('/focus');
  };

  return (
    <div className="fixed top-16 right-4 md:top-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[160px] max-w-[200px] md:max-w-none">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleTimerClick}
          title="Click para ir al Modo Enfoque"
        >
          <Clock className="h-4 w-4 text-primary-500 mr-2" />
          <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
            {formatTime(timeRemaining)}
          </span>
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {isRunning ? (
            <button
              onClick={pauseSession}
              className="p-1 text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
              title="Pausar"
            >
              <Pause className="h-3 w-3" />
            </button>
          ) : (
            <button
              onClick={resumeSession}
              className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              title="Reanudar"
            >
              <Play className="h-3 w-3" />
            </button>
          )}
          
          <button
            onClick={stopSession}
            className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Terminar sesión"
          >
            <StopCircle className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Status indicator */}
      <div className="flex items-center mt-2">
        <div className={`w-2 h-2 rounded-full mr-2 ${
          isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
        }`} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isRunning ? 'En progreso' : 'Pausado'}
        </span>
      </div>
    </div>
  );
};

export default PersistentTimer;