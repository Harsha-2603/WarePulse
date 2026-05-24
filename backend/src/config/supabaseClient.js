import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!supabaseKey) {
  throw new Error('Missing environment variable: SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
