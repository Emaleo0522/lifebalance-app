// Simple logging utility that respects environment
const isDev = import.meta.env.DEV;

export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.log(message, ...args);
    }
  },
  
  error: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.error(message, ...args);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(message, ...args);
    }
  }
};