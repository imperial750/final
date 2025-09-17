#!/usr/bin/env node

/**
 * Test Production API Routes
 * This script tests if the API routes are working correctly on Vercel
 */

const BASE_URL = "https://veri-pi.vercel.app";

async function testApiRoutes() {
  console.log("🧪 Testing production API routes...\n");

  // Test 1: Telegram webhook endpoint
  try {
    console.log("1️⃣ Testing Telegram webhook endpoint...");
    const webhookResponse = await fetch(`${BASE_URL}/api/telegram-webhook`);
    const webhookData = await webhookResponse.json();
    
    if (webhookResponse.ok) {
      console.log("✅ Webhook endpoint is working");
      console.log("   Response:", webhookData);
    } else {
      console.log("❌ Webhook endpoint failed:", webhookData);
    }
  } catch (error) {
    console.log("❌ Webhook endpoint error:", error.message);
  }

  // Test 2: Admin approval endpoint (should fail without proper data, but should respond)
  try {
    console.log("\n2️⃣ Testing admin approval endpoint...");
    const approvalResponse = await fetch(`${BASE_URL}/api/admin-approval`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': BASE_URL,
        'Origin': BASE_URL,
      },
      body: JSON.stringify({
        flowId: 'test-flow-id',
        username: 'test-user',
        password: 'test-pass',
        meta: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }),
    });
    
    const approvalData = await approvalResponse.json();
    
    if (approvalResponse.ok) {
      console.log("✅ Admin approval endpoint is working");
      console.log("   Response:", approvalData);
    } else {
      console.log("❌ Admin approval endpoint failed:", approvalData);
    }
  } catch (error) {
    console.log("❌ Admin approval endpoint error:", error.message);
  }

  // Test 3: Check if main page loads
  try {
    console.log("\n3️⃣ Testing main page...");
    const pageResponse = await fetch(`${BASE_URL}/`);
    
    if (pageResponse.ok) {
      console.log("✅ Main page is accessible");
      console.log("   Status:", pageResponse.status);
    } else {
      console.log("❌ Main page failed:", pageResponse.status);
    }
  } catch (error) {
    console.log("❌ Main page error:", error.message);
  }

  console.log("\n🎯 Test completed!");
}

// Run the tests
testApiRoutes();
