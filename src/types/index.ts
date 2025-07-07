// Re-export all database types for easier imports
export * from './database';

// Common UI types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T = unknown> {
  data: T;
  error: string | null;
  success: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  badge?: number;
}

// Finance types
export interface FinanceCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  created_at: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  allDay?: boolean;
}

// Focus mode types
export interface FocusSession {
  id: string;
  title: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  notes?: string;
}

// Time management types
export interface TimeBlock {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  category: string;
  completed: boolean;
}