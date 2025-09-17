import approvalSystem from "@/lib/approval-system";

export async function GET(req) {
  try {
    const pendingApprovals = approvalSystem.getAllPending();
    const allApprovals = Array.from(approvalSystem.pendingApprovals.entries());
    const allResults = Array.from(approvalSystem.approvalResults.entries());

    return Response.json({
      ok: true,
      debug: {
        pendingCount: pendingApprovals.length,
        totalApprovals: allApprovals.length,
        totalResults: allResults.length,
        pendingApprovals: pendingApprovals.map((a) => ({
          flowId: a.flowId,
          timestamp: a.timestamp,
          status: a.status,
        })),
        allApprovals: allApprovals.map(([flowId, approval]) => ({
          flowId,
          timestamp: approval.timestamp,
          status: approval.status,
        })),
        allResults: allResults.map(([flowId, result]) => ({
          flowId,
          approved: result.approved,
          timestamp: result.timestamp,
        })),
      },
    });
  } catch (e) {
    console.error("Debug error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
    });
  }
}
