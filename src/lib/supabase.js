import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL_HERE') {
  console.error("Missing Supabase configuration. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl || 'http://placeholder.url', supabaseAnonKey || 'placeholder-key');
