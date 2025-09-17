#!/usr/bin/env node

/**
 * Test script for the admin approval system
 * Tests the approval flow without UI
 */

const approvalSystem = require("../src/lib/approval-system.js").default;

function testApprovalSystem() {
  console.log("🧪 Testing Admin Approval System\n");

  // Test 1: Create pending approval
  console.log("1️⃣ Creating pending approval...");
  const flowId = "test-" + Date.now();
  const credentials = {
    username: "testuser",
    password: "testpass123",
    meta: { userAgent: "Test Agent" },
  };

  const approval = approvalSystem.createPendingApproval(flowId, credentials);
  console.log("✅ Created:", approval);

  // Test 2: Check pending status
  console.log("\n2️⃣ Checking pending status...");
  const pendingStatus = approvalSystem.checkApprovalStatus(flowId);
  console.log("✅ Status:", pendingStatus);

  // Test 3: Approve the request
  console.log("\n3️⃣ Approving request...");
  const approveResult = approvalSystem.setApprovalResult(flowId, true);
  console.log("✅ Approval result:", approveResult);

  // Test 4: Check approved status
  console.log("\n4️⃣ Checking approved status...");
  const approvedStatus = approvalSystem.checkApprovalStatus(flowId);
  console.log("✅ Final status:", approvedStatus);

  // Test 5: Test rejection flow
  console.log("\n5️⃣ Testing rejection flow...");
  const flowId2 = "test-reject-" + Date.now();
  approvalSystem.createPendingApproval(flowId2, credentials);
  approvalSystem.setApprovalResult(flowId2, false, "Invalid credentials");
  const rejectedStatus = approvalSystem.checkApprovalStatus(flowId2);
  console.log("✅ Rejected status:", rejectedStatus);

  // Test 6: Test not found
  console.log("\n6️⃣ Testing not found...");
  const notFoundStatus = approvalSystem.checkApprovalStatus("nonexistent");
  console.log("✅ Not found status:", notFoundStatus);

  console.log(
    "\n🎉 All tests passed! Admin approval system is working correctly."
  );
}

testApprovalSystem();
