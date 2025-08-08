// Temporary type fixes for deployment
declare module '@clerk/types' {
  interface UserResource {
    [key: string]: any;
  }
}

declare module '@supabase/supabase-js' {
  interface PostgrestError extends Record<string, unknown> {}
  export const createClient: any;
  export const RealtimeChannel: any;
}

// Temporary any overrides
declare global {
  interface DistractionSource {
    [key: string]: any;
  }
}