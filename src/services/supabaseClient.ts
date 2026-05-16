import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Check for placeholder values to warn the user
if (supabaseUrl.includes('placeholder') || supabaseAnonKey.includes('placeholder')) {
    console.warn('⚠️ Supabase environment variables are using placeholders. Authentication will not work.');
}

// Export the real Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
