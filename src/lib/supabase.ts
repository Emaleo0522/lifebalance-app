import { createClient } from '@supabase/supabase-js';
import { logger, ErrorCategory } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables in development
if (import.meta.env.DEV) {
  logger.debug('Supabase environment check', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    url: supabaseUrl?.substring(0, 30) + '...'
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  const error = logger.createError(
    'Missing required Supabase environment variables',
    ErrorCategory.DATABASE,
    'SUPABASE_CONFIG_MISSING',
    {
      VITE_SUPABASE_URL: supabaseUrl ? 'present' : 'missing',
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'present' : 'missing'
    }
  );
  
  logger.error('Supabase configuration error', error);
  throw new Error(error.message);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
