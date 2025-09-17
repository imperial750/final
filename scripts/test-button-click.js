#!/usr/bin/env node

/**
 * Test Button Click Simulation
 * This script simulates a Telegram button click to test the webhook
 */

const { CPANEL_CONFIG } = require("../src/config/cpanel-config.js");

async function testButtonClick() {
  const webhookUrl = `${CPANEL_CONFIG.APP_URL.replace(
    /\/$/,
    ""
  )}/api/telegram-webhook`;

  console.log("🧪 Testing Button Click Simulation\n");

  // Simulate a callback query (button click)
  const mockCallbackQuery = {
    callback_query: {
      id: `test_${Date.now()}`,
      from: {
        id: 7975956464,
        is_bot: false,
        first_name: "Test",
        username: "testuser",
        language_code: "en",
      },
      message: {
        message_id: 88,
        from: {
          id: 8225561014,
          is_bot: true,
          first_name: "fuck test",
          username: "testthefuckingabilitybot",
        },
        chat: {
          id: 7975956464,
          first_name: "Test",
          username: "testuser",
          type: "private",
        },
        date: Math.floor(Date.now() / 1000),
        text: "Test message",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Test Approve",
                callback_data: "approve_test-flow-123",
              },
              {
                text: "❌ Test Disapprove",
                callback_data: "reject_test-flow-123",
              },
            ],
          ],
        },
      },
      chat_instance: "test-instance",
      data: "approve_test-flow-123",
    },
  };

  console.log("📤 Sending mock button click to webhook...");
  console.log("   Callback Data:", mockCallbackQuery.callback_query.data);
  console.log("   Webhook URL:", webhookUrl);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TelegramBot (like TwitterBot)",
      },
      body: JSON.stringify(mockCallbackQuery),
    });

    const data = await response.json();

    console.log("\n📥 Webhook Response:");
    console.log("   Status:", response.status);
    console.log("   Response:", data);

    if (response.ok && data.ok) {
      console.log("\n✅ Button click simulation successful!");
    } else {
      console.log("\n❌ Button click simulation failed!");
    }
  } catch (error) {
    console.log("\n❌ Error testing button click:", error.message);
  }

  // Test with reject button
  console.log("\n🔄 Testing reject button...");
  mockCallbackQuery.callback_query.data = "reject_test-flow-123";
  mockCallbackQuery.callback_query.id = `test_reject_${Date.now()}`;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TelegramBot (like TwitterBot)",
      },
      body: JSON.stringify(mockCallbackQuery),
    });

    const data = await response.json();

    console.log("📥 Reject Response:");
    console.log("   Status:", response.status);
    console.log("   Response:", data);

    if (response.ok && data.ok) {
      console.log("✅ Reject button simulation successful!");
    } else {
      console.log("❌ Reject button simulation failed!");
    }
  } catch (error) {
    console.log("❌ Error testing reject button:", error.message);
  }
}

// Run the test
testButtonClick();
