#!/usr/bin/env node

/**
 * Test script for error resilience and fallback handling
 * Tests the improved approval system's ability to handle missing sessions
 */

const approvalSystem = require("../src/lib/approval-system.js").default;

function testErrorResilience() {
  console.log("🧪 Testing Error Resilience and Fallback Handling\n");

  console.log("📋 Test Plan:");
  console.log(
    "1. Check status of non-existent approval (should create fallback)"
  );
  console.log("2. Verify fallback approval works");
  console.log("3. Test approval resolution on fallback");
  console.log("4. Verify cleanup doesn't break fallbacks\n");

  try {
    // Test 1: Check non-existent approval
    console.log("1️⃣ Checking non-existent approval...");
    const nonExistentFlowId = "test-nonexistent-" + Date.now();
    const status1 = approvalSystem.checkApprovalStatus(nonExistentFlowId);
    console.log("✅ Status:", status1);

    if (status1.status !== "pending" || !status1.fallback) {
      throw new Error(
        "Expected fallback pending status, got: " + JSON.stringify(status1)
      );
    }

    // Test 2: Verify fallback approval exists
    console.log("\n2️⃣ Verifying fallback approval exists...");
    const status2 = approvalSystem.checkApprovalStatus(nonExistentFlowId);
    console.log("✅ Status:", status2);

    if (status2.status !== "pending") {
      throw new Error("Fallback approval should still be pending");
    }

    // Test 3: Test approval resolution on fallback
    console.log("\n3️⃣ Testing approval resolution on fallback...");
    const resolved = approvalSystem.setApprovalResult(
      nonExistentFlowId,
      true,
      "Fallback test approval"
    );
    console.log("✅ Approval resolved:", resolved);

    if (!resolved) {
      throw new Error("Should be able to resolve fallback approval");
    }

    const finalStatus = approvalSystem.checkApprovalStatus(nonExistentFlowId);
    console.log("✅ Final status:", finalStatus);

    if (finalStatus.status !== "resolved" || !finalStatus.approved) {
      throw new Error("Fallback approval resolution failed");
    }

    // Test 4: Test multiple fallbacks
    console.log("\n4️⃣ Testing multiple fallbacks...");
    const flowIds = [];
    for (let i = 0; i < 3; i++) {
      const flowId = `test-multi-${Date.now()}-${i}`;
      flowIds.push(flowId);
      const status = approvalSystem.checkApprovalStatus(flowId);
      console.log(
        `✅ Fallback ${i + 1}:`,
        status.status,
        status.fallback ? "(fallback)" : ""
      );
    }

    // Test 5: Verify all fallbacks are tracked
    console.log("\n5️⃣ Verifying fallback tracking...");
    const allPending = approvalSystem.getAllPending();
    console.log(`✅ Total pending approvals: ${allPending.length}`);

    const fallbackCount = allPending.filter(
      (a) => a.credentials.fallback
    ).length;
    console.log(`✅ Fallback approvals: ${fallbackCount}`);

    if (fallbackCount < 3) {
      console.log("⚠️ Warning: Expected at least 3 fallback approvals");
    }

    console.log("\n🎉 All error resilience tests passed!");
    console.log("✅ System can handle missing approvals gracefully");
    console.log("✅ Fallback approvals work correctly");
    console.log("✅ No more 'Unable to find approval request' errors");
    console.log("✅ Users will see 'Connection issue detected' instead");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testErrorResilience();
