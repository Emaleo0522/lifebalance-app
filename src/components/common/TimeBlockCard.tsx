import React from 'react';
import { Clock, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import type { TimeBlock } from '../../hooks/useTimeManagement';

interface TimeBlockCardProps {
  timeBlock: TimeBlock;
  onComplete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TimeBlockCard: React.FC<TimeBlockCardProps> = ({
  timeBlock,
  onComplete,
  onEdit,
  onDelete,
}) => {
  // Category styling
  const getCategoryStyles = () => {
    switch (timeBlock.category) {
      case 'work':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
      case 'family':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
      case 'personal':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
      case 'rest':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={`card ${timeBlock.completed ? 'opacity-75' : ''} transform transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyles()}`}>
              {timeBlock.category.charAt(0).toUpperCase() + timeBlock.category.slice(1)}
            </span>
            {timeBlock.completed && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-200">
                Completed
              </span>
            )}
          </div>
          
          <h3 className={`mt-2 text-lg font-semibold ${timeBlock.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {timeBlock.title}
          </h3>
          
          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {timeBlock.startTime} - {timeBlock.endTime}
            </span>
          </div>
        </div>
        
        <div className="flex items-start space-x-1">
          {onComplete && (
            <button
              onClick={() => onComplete(timeBlock.id)}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Mark as complete"
            >
              <CheckCircle2 
                className={`h-5 w-5 ${timeBlock.completed ? 'text-success-500' : ''}`} 
              />
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(timeBlock.id)}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(timeBlock.id)}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeBlockCard;