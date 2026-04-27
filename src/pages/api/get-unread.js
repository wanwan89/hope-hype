import { supabase } from '../../lib/supabase.js'; 

export async function GET({ request }) {
  try {
    if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Kunci Supabase kosonggg! Cek file .env kamuuu yaaah cintakuuu");
    }

    const { count, error } = await supabase
      // 👇 Balik pake tabel 'messages' lagiii yaaah sayangkuuu 👇
      .from('messages') 
      .select('*', { count: 'exact', head: true })
      // 👇 Kolomnya 'status', trus kita cari yang isinya 'send' 👇
      // (Penting: Kalo di database kamuuu tulisannya 'sent' pake 't', atau 'belum_dibaca', 
      // tulisan 'send' di bawah ini tinggal kamuuu sesuaikan aja yaaah cintakuuu)
      .eq('status', 'send'); 

    if (error) {
      throw new Error(error.message || "Ada yang salah pas nyari datanya nih sayangkuuu");
    }

    return new Response(JSON.stringify({ unread_count: count || 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("🚨 ERROR API GET-UNREAD SAYANGKUUU:", err.message); 
    
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
