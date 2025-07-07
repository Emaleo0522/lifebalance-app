import { useEffect, useState } from 'react';
import { safeStorage } from '../lib/storage';
import { logger } from '../lib/logger';

export type TimeBlock = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  category: 'work' | 'family' | 'personal' | 'rest';
  day: string;
  completed?: boolean;
};

export const useTimeManagement = () => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    return safeStorage.getItem<TimeBlock[]>('timeBlocks', []);
  });

  // Save time blocks to localStorage whenever they change with error handling
  useEffect(() => {
    const success = safeStorage.setItem('timeBlocks', timeBlocks);
    if (!success) {
      logger.error('Failed to save time blocks to localStorage');
    }
  }, [timeBlocks]);

  // Add a new time block
  const addTimeBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock = {
      ...block,
      id: Date.now().toString(),
    };
    setTimeBlocks((prev) => [...prev, newBlock]);
    return newBlock;
  };

  // Update an existing time block
  const updateTimeBlock = (id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
    );
  };

  // Delete a time block
  const deleteTimeBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  // Mark a time block as completed
  const toggleCompleteTimeBlock = (id: string) => {
    setTimeBlocks((prev) =>
      prev.map((block) => 
        block.id === id ? { ...block, completed: !block.completed } : block
      )
    );
  };

  // Get time blocks for a specific day
  const getTimeBlocksByDay = (day: string) => {
    return timeBlocks.filter((block) => block.day === day);
  };

  return {
    timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    toggleCompleteTimeBlock,
    getTimeBlocksByDay,
  };
};