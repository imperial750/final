#!/usr/bin/env node

/**
 * Clear Pending Approvals
 * This script clears all pending approvals to start fresh
 */

const fs = require("fs");
const path = require("path");

function clearPendingApprovals() {
  console.log("🧹 Clearing pending approvals...\n");

  const dataDir = path.join(__dirname, "..", "data");
  const pendingFile = path.join(dataDir, "pending-approvals.json");
  const resultsFile = path.join(dataDir, "approval-results.json");

  try {
    // Clear pending approvals
    fs.writeFileSync(pendingFile, JSON.stringify({}, null, 2));
    console.log("✅ Cleared pending approvals");

    // Clear approval results
    fs.writeFileSync(resultsFile, JSON.stringify({}, null, 2));
    console.log("✅ Cleared approval results");

    console.log(
      "\n🎯 All approvals cleared! You can now test with fresh credentials."
    );
  } catch (error) {
    console.log("❌ Error clearing approvals:", error.message);
  }
}

clearPendingApprovals();
