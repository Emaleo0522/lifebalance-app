import React, { useState } from 'react';
import { 
  Play, Pause, StopCircle, XCircle, Check, Plus, BarChart2, Facebook, Youtube, Mail, Trash2
} from 'lucide-react';
import { useFocusMode } from '../hooks/useFocusMode';
import { getRandomQuotes } from '../lib/quotes';
import toast from 'react-hot-toast';

const FocusMode: React.FC = () => {
  const {
    activeSession,
    timeRemaining,
    isRunning,
    startFocusSession,
    pauseSession,
    resumeSession,
    completeSession,
    recordDistraction,
    distractionSources,
    addDistractionSource,
    removeDistractionSource,
    updateDistractionSource,
    getFocusStatistics,
  } = useFocusMode();

  const [newDistraction, setNewDistraction] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [showStats, setShowStats] = useState(false);

  // Format remaining time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle distraction button click
  const handleDistraction = (source: string) => {
    recordDistraction(source);
    toast('Distracción registrada', { 
      icon: '📝',
      style: { background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }
    });
  };

  // Handle adding new distraction source
  const handleAddDistractionSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDistraction.trim()) {
      addDistractionSource(newDistraction.trim() as any);
      toast.success('Fuente de distracción agregada', { icon: '✅' });
      setNewDistraction('');
    }
  };

  // Get icon for known distraction sources
  const getDistractionIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('facebook')) return <Facebook size={16} />;
    if (lowerName.includes('youtube')) return <Youtube size={16} />;
    if (lowerName.includes('email') || lowerName.includes('mail')) return <Mail size={16} />;
    return null;
  };

  // Focus statistics
  const statistics = getFocusStatistics();

  // Get random focus tips
  const focusTips = getRandomQuotes('focus', 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Modo Enfoque</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Bloquea distracciones y mejora tu productividad
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="mt-4 md:mt-0 btn flex items-center"
          aria-label="Alternar estadísticas"
        >
          <BarChart2 className="h-5 w-5 mr-1" />
          {showStats ? 'Ocultar' : 'Mostrar'} Estadísticas
        </button>
      </div>

      {/* Focus Timer */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
        <div className="text-center py-8">
          {activeSession ? (
            <>
              <div className="mb-8 text-7xl font-bold text-primary-600 dark:text-primary-300 font-mono tracking-widest">
                {formatTime(timeRemaining)}
              </div>
              
              <div className="flex justify-center space-x-4">
                {isRunning ? (
                  <button
                    onClick={() => {
                      pauseSession();
                      toast('Sesión pausada', { icon: '⏸️' });
                    }}
                    className="btn btn-primary flex items-center"
                  >
                    <Pause className="h-5 w-5 mr-1" />
                    Pausar
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      resumeSession();
                      toast.success('¡Sesión reanudada! Mantén el enfoque', { icon: '▶️' });
                    }}
                    className="btn btn-primary flex items-center"
                  >
                    <Play className="h-5 w-5 mr-1" />
                    Reanudar
                  </button>
                )}
                
                <button
                  onClick={() => {
                    completeSession();
                    toast.success('¡Sesión de enfoque completada con éxito!', { 
                      icon: '🎉',
                      duration: 5000
                    });
                  }}
                  className="btn flex items-center bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                >
                  <StopCircle className="h-5 w-5 mr-1" />
                  Terminar Sesión
                </button>
              </div>
              
              <p className="mt-6 text-sm text-primary-700 dark:text-primary-300">
                {isRunning ? '¡Enfócate en tu tarea. Puedes hacerlo!' : 'Sesión pausada. Reanuda cuando estés listo.'}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200 mb-6">Iniciar nueva sesión de enfoque</h2>
              
              <div className="flex justify-center space-x-4 mb-6">
                {[15, 25, 45, 60].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`
                      px-4 py-2 rounded-md transition-colors
                      ${selectedDuration === duration
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700'
                      }
                    `}
                  >
                    {duration}m
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  startFocusSession(selectedDuration);
                  toast.success(`¡Sesión de ${selectedDuration} minutos iniciada!`, { 
                    icon: '🎯',
                    duration: 3000
                  });
                }}
                className="btn btn-primary flex items-center mx-auto"
              >
                <Play className="h-5 w-5 mr-1" />
                Iniciar Temporizador
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statistics */}
      {showStats && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-primary-500" />
            Estadísticas de Enfoque
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Sesiones Completadas</p>
              <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {statistics.completedSessions}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo Total de Enfoque</p>
              <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {statistics.totalTime} min
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Promedio de Distracciones</p>
              <p className="mt-1 text-2xl font-semibold text-primary-600 dark:text-primary-400">
                {(statistics.completedSessions > 0 ? statistics.totalTime / statistics.completedSessions : 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distraction Management */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <XCircle className="h-5 w-5 mr-2 text-error-500" />
          Gestión de Distracciones
        </h2>

        {activeSession && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md">
            <p className="font-medium text-red-800 dark:text-red-200 mb-2">¿Te distrajiste?</p>
            <div className="flex flex-wrap gap-2">
              {distractionSources.map(source => (
                <button
                  key={source.id}
                  onClick={() => handleDistraction(source.name)}
                  className="inline-flex items-center px-3 py-1 rounded-md bg-white dark:bg-gray-700 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 text-sm"
                >
                  {getDistractionIcon(source.name)}
                  <span className={getDistractionIcon(source.name) ? "ml-1" : ""}>
                    {source.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Gestionar Fuentes de Distracción</h3>
          
          <form onSubmit={handleAddDistractionSource} className="flex mb-4">
            <input
              type="text"
              value={newDistraction}
              onChange={(e) => setNewDistraction(e.target.value)}
              placeholder="Agregar fuente de distracción (ej. Instagram)"
              className="input flex-1 rounded-r-none"
            />
            <button
              type="submit"
              className="btn btn-primary rounded-l-none"
            >
              <Plus className="h-5 w-5" />
            </button>
          </form>
          
          <div className="space-y-2 mt-4">
            {distractionSources.map(source => (
              <div 
                key={source.id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <div className="flex items-center">
                  {getDistractionIcon(source.name) || <XCircle size={16} className="text-error-500" />}
                  <span className="ml-2">{source.name}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={source.blockLevel}
                    onChange={(e) => updateDistractionSource(source.id, { blockLevel: e.target.value as 'remind' | 'block' })}
                    className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded py-1 px-2"
                  >
                    <option value="remind">Recordar</option>
                    <option value="block">Bloquear</option>
                  </select>
                  
                  <button
                    onClick={() => removeDistractionSource(source.id)}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {distractionSources.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              Agrega fuentes de distracción para ayudar a rastrear lo que interrumpe tu enfoque.
            </p>
          )}
        </div>
      </div>
      
      {/* Focus Tips */}
      <div className="card bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Check className="h-5 w-5 mr-2 text-success-500" />
          Consejos de Enfoque
        </h2>
        
        <ul className="space-y-3 text-gray-700 dark:text-gray-300">
          {focusTips.map((tip) => (
            <li key={tip.id} className="flex items-start">
              <Check className="h-5 w-5 text-success-500 mr-2 mt-0.5 flex-shrink-0" />
              <p>{tip.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FocusMode;