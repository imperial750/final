#!/usr/bin/env node

/**
 * Setup script for Telegram webhook
 * Run this after deploying your app to set up the webhook URL
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupWebhook() {
  console.log("🤖 Telegram Webhook Setup\n");

  const botToken = await question("Enter your Telegram Bot Token: ");
  const webhookUrl = await question(
    "Enter your app URL (e.g., https://yourdomain.com): "
  );

  if (!botToken || !webhookUrl) {
    console.error("❌ Bot token and webhook URL are required");
    process.exit(1);
  }

  const fullWebhookUrl = `${webhookUrl.replace(
    /\/$/,
    ""
  )}/api/telegram-webhook`;

  try {
    console.log("\n🔗 Setting up webhook...");

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: fullWebhookUrl,
          allowed_updates: ["callback_query"],
        }),
      }
    );

    const result = await response.json();

    if (result.ok) {
      console.log("✅ Webhook set up successfully!");
      console.log(`📍 Webhook URL: ${fullWebhookUrl}`);
      console.log("\n📋 Next steps:");
      console.log("1. Make sure your app is deployed and accessible");
      console.log("2. Test the login flow");
      console.log("3. Check your Telegram bot for approval messages");
    } else {
      console.error("❌ Failed to set up webhook:", result.description);
    }
  } catch (error) {
    console.error("❌ Error setting up webhook:", error.message);
  }

  rl.close();
}

// Check if we have fetch available (Node 18+)
if (typeof fetch === "undefined") {
  console.error(
    "❌ This script requires Node.js 18+ with built-in fetch support"
  );
  console.log("💡 Alternative: Set up the webhook manually by visiting:");
  console.log(
    "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/telegram-webhook"
  );
  process.exit(1);
}

setupWebhook().catch(console.error);
