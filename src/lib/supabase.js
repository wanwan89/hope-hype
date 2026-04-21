import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Cek dulu, kalau kosong kasih peringatan di console browser
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🔥 Error: Supabase URL atau Key belum diset di Environment Variables!");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
