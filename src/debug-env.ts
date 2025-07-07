// Archivo temporal para debug - eliminar después
console.log('=== DEBUG ENVIRONMENT VARIABLES ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);
console.log('VITE_SUPABASE_ANON_KEY starts with:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20));
console.log('=== END DEBUG ===');

export {};