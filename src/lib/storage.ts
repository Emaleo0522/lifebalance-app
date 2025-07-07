import { logger } from './logger';

/**
 * Safe localStorage utility that provides error handling and fallback mechanisms
 */
export const safeStorage = {
  /**
   * Safely retrieves an item from localStorage with error handling
   * @param key - The localStorage key
   * @param defaultValue - Default value to return if retrieval fails
   * @returns The parsed value or the default value
   */
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        logger.warn(`localStorage not available, using default value for key: ${key}`);
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      return JSON.parse(item);
    } catch (error) {
      logger.error(`Failed to retrieve localStorage item for key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Safely sets an item in localStorage with error handling
   * @param key - The localStorage key
   * @param value - The value to store
   * @returns True if successful, false otherwise
   */
  setItem: <T>(key: string, value: T): boolean => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        logger.warn(`localStorage not available, cannot store value for key: ${key}`);
        return false;
      }

      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Failed to store localStorage item for key "${key}":`, error);
      
      // Handle quota exceeded error specifically
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logger.error('localStorage quota exceeded. Consider clearing old data.');
      }
      
      return false;
    }
  },

  /**
   * Safely removes an item from localStorage with error handling
   * @param key - The localStorage key
   * @returns True if successful, false otherwise
   */
  removeItem: (key: string): boolean => {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        logger.warn(`localStorage not available, cannot remove key: ${key}`);
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error(`Failed to remove localStorage item for key "${key}":`, error);
      return false;
    }
  },

  /**
   * Checks if localStorage is available
   * @returns True if localStorage is available and functional
   */
  isAvailable: (): boolean => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }

      // Test localStorage functionality
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Safely clears all localStorage items with error handling
   * @returns True if successful, false otherwise
   */
  clear: (): boolean => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        logger.warn('localStorage not available, cannot clear storage');
        return false;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      logger.error('Failed to clear localStorage:', error);
      return false;
    }
  }
};