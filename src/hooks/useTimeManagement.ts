import { useEffect, useState } from 'react';
import { safeStorage } from '../lib/storage';
import { logger } from '../lib/logger';
import { playReminderSound } from '../lib/audio';
import toast from 'react-hot-toast';

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

  // Track checked reminders to avoid duplicates
  const [checkedReminders, setCheckedReminders] = useState<Set<string>>(new Set());

  // Save time blocks to localStorage whenever they change with error handling
  useEffect(() => {
    const success = safeStorage.setItem('timeBlocks', timeBlocks);
    if (!success) {
      logger.error('Failed to save time blocks to localStorage');
    }
  }, [timeBlocks]);

  // Check for upcoming reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      timeBlocks.forEach((block) => {
        // Only check today's blocks that haven't been completed
        if (block.day === today && !block.completed) {
          const reminderId = `${block.id}-${block.day}-${block.startTime}`;
          
          // Check if it's time for the reminder (5 minutes before start time)
          const [blockHour, blockMinute] = block.startTime.split(':').map(Number);
          const blockTime = new Date(now);
          blockTime.setHours(blockHour, blockMinute - 5, 0, 0); // 5 minutes before
          
          const timeDiff = blockTime.getTime() - now.getTime();
          
          // If it's within 1 minute of reminder time and we haven't reminded yet
          if (timeDiff <= 60000 && timeDiff > -60000 && !checkedReminders.has(reminderId)) {
            setCheckedReminders(prev => new Set([...prev, reminderId]));
            
            // Play reminder sound and show notification
            playReminderSound();
            toast(`⏰ Recordatorio: ${block.title} en 5 minutos`, {
              duration: 6000,
              icon: '⏰',
              style: {
                backgroundColor: '#3B82F6',
                color: 'white',
              },
            });
            
            logger.log('Reminder triggered for:', block.title);
          }
          
          // Also check if it's exactly the start time
          const startReminderId = `${block.id}-${block.day}-${block.startTime}-start`;
          if (currentTime === block.startTime && !checkedReminders.has(startReminderId)) {
            setCheckedReminders(prev => new Set([...prev, startReminderId]));
            
            playReminderSound();
            toast(`🚀 ¡Es hora de: ${block.title}!`, {
              duration: 8000,
              icon: '🚀',
              style: {
                backgroundColor: '#10B981',
                color: 'white',
              },
            });
          }
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    
    return () => clearInterval(interval);
  }, [timeBlocks, checkedReminders]);

  // Clean up old reminders daily
  useEffect(() => {
    const cleanupOldReminders = () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      setCheckedReminders(prev => {
        const filtered = new Set([...prev].filter(id => !id.includes(yesterdayStr)));
        return filtered;
      });
    };

    // Clean up at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(cleanupOldReminders, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);

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