import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const isServiceRoleAvailable = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!supabaseKey) {
  throw new Error('Missing environment variable: SUPABASE_ANON_KEY');
}

console.log(`[Supabase Client] Initializing global Supabase client. Service role key available: ${isServiceRoleAvailable}`);

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
