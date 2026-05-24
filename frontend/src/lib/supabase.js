import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Clean error checking and validation
if (!supabaseUrl) {
  console.error('SUPABASE CLIENT ERROR: VITE_SUPABASE_URL is missing! Please configure it in your .env file.');
}
if (!supabaseKey) {
  console.error('SUPABASE CLIENT ERROR: VITE_SUPABASE_ANON_KEY is missing! Please configure it in your .env file.');
}

let supabaseClientInstance = null;

try {
  if (supabaseUrl && supabaseKey) {
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log('SUPABASE CLIENT INITIALIZED SUCCESSFULLY');
  } else {
    console.warn('SUPABASE CLIENT WARNING: Client initialized with missing/incomplete credentials.');
    // Fallback instantiation to prevent app crash, but it will error on requests
    supabaseClientInstance = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
      auth: {
        persistSession: false
      }
    });
  }
} catch (error) {
  console.error('SUPABASE CLIENT INITIALIZATION FAILED:', error.message);
  throw error;
}

export const supabase = supabaseClientInstance;
export default supabase;
