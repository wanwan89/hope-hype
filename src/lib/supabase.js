import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🔥 Error: Supabase URL atau Key belum diset di Environment Variables!");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // FIX UTAMA: Menggunakan localStorage secara eksplisit 
      // dan menambahkan 'flowType' untuk kestabilan di browser
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      flowType: 'pkce',
    }
  }
);
