import { supabase } from '../../lib/supabase.js'; 

export async function GET({ request }) {
  try {
    if (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Kunci Supabase kosong! Cek file .env lu bro");
    }

    const { count, error } = await supabase
      .from('messages') 
      .select('*', { count: 'exact', head: true })
      // 👇 INI YANG DIGANTI: dari 'send' jadi 'sent' 👇
      .eq('status', 'sent'); 

    if (error) {
      throw new Error(error.message || "Ada yang salah pas nyari datanya nih");
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
