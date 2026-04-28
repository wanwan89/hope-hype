import { supabase } from '../../lib/supabase.js'; 

export async function GET({ request }) {
  try {
    if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Kunci Supabase kosong! Cek file .env lu broo");
    }

    // 👇 KITA TANGKAP USER ID DARI URL YAA SAYANGKUU 👇
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    // Kalau nggak ada userId, kita tolak yaa cintakuu
    if (!userId) {
        return new Response(JSON.stringify({ error: "User ID nya mana sayangkuu?" }), { 
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    const { count, error } = await supabase
      .from('messages') 
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
      .neq('user_id', userId) 
      // 👇 INI DIA TAMBAHANNYA SAYANGKUU, BIAR CHAT GLOBAL GAK IKUT KEHITUNG 👇
      .neq('room_id', 'room-1'); 

    if (error) {
      throw new Error(error.message || "Ada yang salah pas nyari datanya nihh");
    }

    return new Response(JSON.stringify({ unread_count: count || 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("🚨 ERROR API GET-UNREAD:", err.message); 
    
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
