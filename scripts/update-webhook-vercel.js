#!/usr/bin/env node

/**
 * Update Telegram Webhook for Vercel Production
 * This script updates the Telegram webhook to point to your Vercel deployment
 */

const { CPANEL_CONFIG } = require("../src/config/cpanel-config.js");

async function updateWebhook() {
  const token = CPANEL_CONFIG.TELEGRAM_BOT_TOKEN;
  const webhookUrl = `${CPANEL_CONFIG.APP_URL.replace(
    /\/$/,
    ""
  )}/api/telegram-webhook`;

  if (!token || token === "YOUR_BOT_TOKEN_HERE") {
    console.error(
      "❌ Please update your Telegram Bot Token in src/config/cpanel-config.js"
    );
    return;
  }

  if (!CPANEL_CONFIG.APP_URL || CPANEL_CONFIG.APP_URL.includes("ngrok")) {
    console.error(
      "❌ Please update your APP_URL in src/config/cpanel-config.js to your Vercel domain"
    );
    return;
  }

  try {
    console.log("🔄 Updating Telegram webhook...");
    console.log("📍 New webhook URL:", webhookUrl);

    const response = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          drop_pending_updates: true, // Clear any pending updates
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      console.log("✅ Webhook updated successfully!");
      console.log("🔗 Webhook URL:", webhookUrl);

      // Verify the webhook
      console.log("\n🔍 Verifying webhook...");
      const verifyResponse = await fetch(
        `https://api.telegram.org/bot${token}/getWebhookInfo`
      );
      const verifyData = await verifyResponse.json();

      if (verifyData.ok) {
        console.log("📊 Webhook Info:");
        console.log("   URL:", verifyData.result.url);
        console.log(
          "   Pending Updates:",
          verifyData.result.pending_update_count
        );
        console.log(
          "   Last Error:",
          verifyData.result.last_error_message || "None"
        );
      }
    } else {
      console.error("❌ Failed to update webhook:", data.description);
    }
  } catch (error) {
    console.error("❌ Error updating webhook:", error.message);
  }
}

// Run the script
updateWebhook();
