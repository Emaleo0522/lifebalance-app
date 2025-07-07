import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Clock, Calendar, Focus, DollarSign, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTimeManagement } from '../hooks/useTimeManagement';
import { useFinanceTracking } from '../hooks/useFinanceTracking';
import { useFamilyTasks } from '../hooks/useFamilyTasks';
import { useFocusMode } from '../hooks/useFocusMode';
import { getNewRandomQuote } from '../lib/quotes';
import TimeBlockCard from '../components/common/TimeBlockCard';

const Dashboard: React.FC = () => {
  const { timeBlocks, toggleCompleteTimeBlock } = useTimeManagement();
  const { getFinancialSummary } = useFinanceTracking();
  const { familyTasks } = useFamilyTasks();
  const { getFocusStatistics } = useFocusMode();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const today = format(currentTime, 'yyyy-MM-dd');
  const todayFormatted = format(currentTime, 'EEEE, MMMM d');
  
  // Get today's time blocks
  const todayBlocks = timeBlocks.filter(block => block.day === today);
  
  // Get unfinished family tasks
  const pendingFamilyTasks = familyTasks.filter(task => !task.completed);
  
  // Get financial summary
  const financialSummary = getFinancialSummary();
  
  // Get focus statistics
  const focusStats = getFocusStatistics();

  // Get dynamic motivational quote
  const randomQuote = getNewRandomQuote('motivational', 'dashboard-recent-quotes').text;
  
  return (
    <div className="space-y-6">
      {/* Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{todayFormatted}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-block bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg">
            <p className="text-primary-800 dark:text-primary-200 text-sm italic">{randomQuote}</p>
          </div>
        </div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex items-center">
          <Clock className="h-10 w-10 text-primary-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Horario de Hoy</p>
            <p className="text-xl font-semibold">{todayBlocks.length} tareas</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <Focus className="h-10 w-10 text-accent-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sesiones de Enfoque</p>
            <p className="text-xl font-semibold">{focusStats.completedSessions} completadas</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <Users className="h-10 w-10 text-secondary-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tareas Familiares</p>
            <p className="text-xl font-semibold">{pendingFamilyTasks.length} pendientes</p>
          </div>
        </div>
        
        <div className="card flex items-center">
          <DollarSign className="h-10 w-10 text-success-500 mr-4" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance Financiero</p>
            <p className={`text-xl font-semibold ${financialSummary.balance >= 0 ? 'text-success-500' : 'text-error-500'}`}>
              ${financialSummary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Today's schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Horario de Hoy</h2>
          <Link to="/calendar" className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center hover:underline">
            Ver Calendario <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        {todayBlocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayBlocks.map((block) => (
              <TimeBlockCard 
                key={block.id} 
                timeBlock={block} 
                onComplete={toggleCompleteTimeBlock}
              />
            ))}
          </div>
        ) : (
          <div className="card bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay tareas programadas</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Planifica tu día agregando tareas en la sección Calendario.
              </p>
              <Link 
                to="/calendar" 
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600"
              >
                Agregar Bloque de Tiempo
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/focus" className="card card-hover bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
            <Focus className="h-8 w-8 text-primary-500 mb-3" />
            <h3 className="text-lg font-medium text-primary-800 dark:text-primary-200">Iniciar Sesión de Enfoque</h3>
            <p className="mt-1 text-sm text-primary-700/80 dark:text-primary-300/80">
              Bloquea distracciones y mejora la productividad
            </p>
          </Link>
          
          <Link to="/finance" className="card card-hover bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800">
            <DollarSign className="h-8 w-8 text-accent-500 mb-3" />
            <h3 className="text-lg font-medium text-accent-800 dark:text-accent-200">Rastrear Finanzas</h3>
            <p className="mt-1 text-sm text-accent-700/80 dark:text-accent-300/80">
              Agrega transacciones y gestiona tu presupuesto
            </p>
          </Link>
          
          <Link to="/family" className="card card-hover bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800">
            <Users className="h-8 w-8 text-secondary-500 mb-3" />
            <h3 className="text-lg font-medium text-secondary-800 dark:text-secondary-200">Tareas Familiares</h3>
            <p className="mt-1 text-sm text-secondary-700/80 dark:text-secondary-300/80">
              Gestiona y asigna responsabilidades familiares
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;