// src/pages/api/withdraw.ts
export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { amount, method, accountName, account, userId } = body;

    const BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID;

    const pesan = `
<b>🔔 WD BARU - HOPEHYPE</b>
----------------------------
<b>User ID:</b> <code>${userId}</code>
<b>Jumlah:</b> ${amount} Koin (Rp ${(amount * 70).toLocaleString('id-ID')})
<b>Metode:</b> ${method}
<b>Nama:</b> ${accountName}
<b>Rek/HP:</b> ${account}
----------------------------
    `;

    // Kirim ke Telegram
    const teleResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: pesan,
        parse_mode: 'HTML'
      })
    });

    if (!teleResponse.ok) throw new Error("Gagal kirim ke Telegram");

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
