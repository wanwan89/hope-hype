// File: src/pages/api/get-unread.js

import { supabase } from '../../lib/supabase'; // Sesuaikan sama lokasi file koneksi Supabase kamuuu yaaah

export async function GET({ request }) {
  try {
    // Kita hitung jumlah chat beneran dari database kamuuu
    // Asumsinya nama tabel kamu 'messages', dan kita cari status yang belum dibaca
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false); 
      // Nanti jangan lupa tambahin filter .eq('user_id', id_user_login) biar pas yaaah

    if (error) {
      throw error;
    }

    // Kirim balasan ke frontend kamuuu
    return new Response(JSON.stringify({ unread_count: count || 0 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    // Kalo ada error di databasenya, kita kasih tau frontend-nyaaa
    return new Response(JSON.stringify({ error: "Gagal ambil data chattt" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
