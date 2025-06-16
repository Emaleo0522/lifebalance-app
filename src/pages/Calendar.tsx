import React, { useState } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimeManagement, TimeBlock } from '../hooks/useTimeManagement';
import TimeBlockCard from '../components/common/TimeBlockCard';

const Calendar: React.FC = () => {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, toggleCompleteTimeBlock } = useTimeManagement();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  
  // New time block form state
  const [newBlock, setNewBlock] = useState<Omit<TimeBlock, 'id'>>({
    title: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work',
    day: format(selectedDate, 'yyyy-MM-dd'),
  });

  // Generate week days
  const generateWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDays = generateWeekDays(selectedDate);

  // Handle previous/next week
  const goToPreviousWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, -7));
  };

  const goToNextWeek = () => {
    setSelectedDate(prevDate => addDays(prevDate, 7));
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (editingBlock) {
      setEditingBlock({
        ...editingBlock,
        [name]: value,
      });
    } else {
      setNewBlock({
        ...newBlock,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBlock) {
      updateTimeBlock(editingBlock.id, editingBlock);
      setEditingBlock(null);
    } else {
      addTimeBlock(newBlock);
      setNewBlock({
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        category: 'work',
        day: format(selectedDate, 'yyyy-MM-dd'),
      });
    }
    
    setIsAddingBlock(false);
  };

  // Handle edit block
  const handleEditBlock = (id: string) => {
    const blockToEdit = timeBlocks.find(block => block.id === id);
    if (blockToEdit) {
      setEditingBlock(blockToEdit);
      setIsAddingBlock(true);
    }
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setIsAddingBlock(false);
    setEditingBlock(null);
  };

  // Filter blocks for selected day
  const getBlocksForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return timeBlocks.filter(block => block.day === dateString);
  };

  // Change selected date
  const selectDate = (date: Date) => {
    setSelectedDate(date);
    setNewBlock(prev => ({
      ...prev,
      day: format(date, 'yyyy-MM-dd'),
    }));
  };

  // Get blocks for selected date
  const selectedDateBlocks = getBlocksForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendario</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Planifica tu tiempo y organiza tu horario
          </p>
        </div>
        <button
          onClick={() => setIsAddingBlock(true)}
          className="mt-4 md:mt-0 btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-1" />
          Agregar Bloque
        </button>
      </div>

      {/* Weekly calendar */}
      <div className="bg-white dark:bg-surface-dark shadow rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={goToPreviousWeek}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </h2>
          <button 
            onClick={goToNextWeek}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map((day, index) => {
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const dayBlocks = getBlocksForDate(day);
            
            return (
              <div 
                key={index}
                onClick={() => selectDate(day)}
                className={`
                  text-center py-3 cursor-pointer transition-colors relative
                  ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                  ${isSelected ? 'border-b-2 border-primary-500' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-800
                `}
              >
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {format(day, 'EEE')}
                </p>
                <p className={`
                  mt-1 text-lg 
                  ${isToday ? 'font-bold text-primary-600 dark:text-primary-400' : 'font-medium text-gray-900 dark:text-white'}
                `}>
                  {format(day, 'd')}
                </p>
                
                {/* Indicator dots */}
                {dayBlocks.length > 0 && (
                  <div className="flex justify-center mt-1 space-x-1">
                    {dayBlocks.length <= 3 ? (
                      dayBlocks.map((_, i) => (
                        <span 
                          key={i} 
                          className="h-1.5 w-1.5 rounded-full bg-primary-400 dark:bg-primary-500" 
                        />
                      ))
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-400 dark:bg-primary-500" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-400 dark:bg-primary-500" />
                        <span className="text-xs text-primary-500 dark:text-primary-400 -mt-0.5">+{dayBlocks.length - 2}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Time blocks for selected day */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-primary-500" />
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        
        {selectedDateBlocks.length > 0 ? (
          <div className="space-y-4">
            {selectedDateBlocks
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((block) => (
                <TimeBlockCard
                  key={block.id}
                  timeBlock={block}
                  onComplete={toggleCompleteTimeBlock}
                  onEdit={handleEditBlock}
                  onDelete={deleteTimeBlock}
                />
              ))}
          </div>
        ) : (
          <div className="card bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
            <div className="text-center py-6">
              <CalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No hay bloques de tiempo</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comienza agregando un bloque de tiempo para organizar tu día.
              </p>
              <button
                onClick={() => setIsAddingBlock(true)}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Bloque
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Time Block Modal */}
      {isAddingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full max-w-md mx-auto overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingBlock ? 'Editar Bloque de Tiempo' : 'Agregar Nuevo Bloque'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="label">Título</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={editingBlock?.title || newBlock.title}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="ej. Turno de trabajo, Cena familiar"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="label">Hora de Inicio</label>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={editingBlock?.startTime || newBlock.startTime}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="label">Hora de Fin</label>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={editingBlock?.endTime || newBlock.endTime}
                      onChange={handleInputChange}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="category" className="label">Categoría</label>
                  <select
                    id="category"
                    name="category"
                    value={editingBlock?.category || newBlock.category}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="work">Trabajo</option>
                    <option value="family">Familia</option>
                    <option value="personal">Personal</option>
                    <option value="rest">Descanso</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingBlock ? 'Actualizar' : 'Agregar'} Bloque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;