import { createClient } from '@supabase/supabase-js';

// נתוני התחברות שיועברו למשתני סביבה בשלב מאוחר יותר
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// בדיקה שנתוני ההתחברות קיימים
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// יצירת לקוח Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase; 