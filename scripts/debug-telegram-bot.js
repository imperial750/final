#!/usr/bin/env node

/**
 * Debug Telegram Bot Functionality
 * This script helps debug why approve/disapprove buttons aren't working
 */

const { CPANEL_CONFIG } = require("../src/config/cpanel-config.js");

async function debugTelegramBot() {
  const token = CPANEL_CONFIG.TELEGRAM_BOT_TOKEN;
  const chatId = CPANEL_CONFIG.TELEGRAM_CHAT_ID;
  const webhookUrl = `${CPANEL_CONFIG.APP_URL.replace(
    /\/$/,
    ""
  )}/api/telegram-webhook`;

  console.log("🔍 Debugging Telegram Bot Functionality\n");

  // 1. Check configuration
  console.log("1️⃣ Configuration Check:");
  console.log(
    "   Bot Token:",
    token ? `${token.substring(0, 10)}...` : "❌ Missing"
  );
  console.log("   Chat ID:", chatId || "❌ Missing");
  console.log("   Webhook URL:", webhookUrl);
  console.log("   App URL:", CPANEL_CONFIG.APP_URL);

  if (!token || !chatId) {
    console.log("❌ Missing required configuration");
    return;
  }

  // 2. Test bot info
  console.log("\n2️⃣ Bot Information:");
  try {
    const botInfoResponse = await fetch(
      `https://api.telegram.org/bot${token}/getMe`
    );
    const botInfo = await botInfoResponse.json();

    if (botInfo.ok) {
      console.log("   ✅ Bot is active");
      console.log("   Name:", botInfo.result.first_name);
      console.log("   Username:", botInfo.result.username);
    } else {
      console.log("   ❌ Bot error:", botInfo.description);
    }
  } catch (error) {
    console.log("   ❌ Error getting bot info:", error.message);
  }

  // 3. Check webhook status
  console.log("\n3️⃣ Webhook Status:");
  try {
    const webhookResponse = await fetch(
      `https://api.telegram.org/bot${token}/getWebhookInfo`
    );
    const webhookInfo = await webhookResponse.json();

    if (webhookInfo.ok) {
      console.log("   ✅ Webhook is set");
      console.log("   URL:", webhookInfo.result.url);
      console.log(
        "   Pending Updates:",
        webhookInfo.result.pending_update_count
      );
      console.log(
        "   Last Error:",
        webhookInfo.result.last_error_message || "None"
      );
      console.log(
        "   Last Error Date:",
        webhookInfo.result.last_error_date || "None"
      );
    } else {
      console.log("   ❌ Webhook error:", webhookInfo.description);
    }
  } catch (error) {
    console.log("   ❌ Error checking webhook:", error.message);
  }

  // 4. Test webhook endpoint
  console.log("\n4️⃣ Webhook Endpoint Test:");
  try {
    const endpointResponse = await fetch(webhookUrl);
    const endpointData = await endpointResponse.json();

    if (endpointResponse.ok) {
      console.log("   ✅ Webhook endpoint is accessible");
      console.log("   Response:", endpointData);
    } else {
      console.log("   ❌ Webhook endpoint error:", endpointData);
    }
  } catch (error) {
    console.log("   ❌ Error testing webhook endpoint:", error.message);
  }

  // 5. Send test message with buttons
  console.log("\n5️⃣ Sending Test Message:");
  try {
    const testMessage =
      `🧪 <b>Test Message</b>\n\n` +
      `This is a test message to verify the bot is working.\n` +
      `Click the buttons below to test functionality.\n\n` +
      `🆔 <b>Test Flow ID:</b> <code>test-${Date.now()}</code>`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✅ Test Approve",
            callback_data: `approve_test-${Date.now()}`,
          },
          {
            text: "❌ Test Disapprove",
            callback_data: `reject_test-${Date.now()}`,
          },
        ],
      ],
    };

    const sendResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: "HTML",
          reply_markup: keyboard,
        }),
      }
    );

    const sendData = await sendResponse.json();

    if (sendData.ok) {
      console.log("   ✅ Test message sent successfully");
      console.log("   Message ID:", sendData.result.message_id);
      console.log("   Now try clicking the buttons in Telegram!");
    } else {
      console.log("   ❌ Failed to send test message:", sendData.description);
    }
  } catch (error) {
    console.log("   ❌ Error sending test message:", error.message);
  }

  console.log("\n🎯 Debug Complete!");
  console.log("\n📋 Next Steps:");
  console.log("1. Check if you received the test message in Telegram");
  console.log("2. Click the test buttons and see if they work");
  console.log("3. Check the webhook endpoint logs for any errors");
  console.log("4. If buttons don't work, check the webhook URL is correct");
}

// Run the debug
debugTelegramBot();
