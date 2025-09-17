import approvalSystem from "@/lib/approval-system";

export async function POST(req) {
  try {
    const body = await req.json();
    const { flowId, action } = body; // action: "approve" or "reject"

    if (!flowId || !action) {
      return Response.json(
        { error: "Missing flowId or action" },
        { status: 400 }
      );
    }

    console.log(`🧪 Manual test: ${action} for flowId: ${flowId}`);

    const approved = action === "approve";
    const reason = approved ? null : "Manual test rejection";

    const success = approvalSystem.setApprovalResult(flowId, approved, reason);

    if (success) {
      console.log(`✅ Manual test successful: ${action} for ${flowId}`);
      return Response.json({
        ok: true,
        message: `Successfully ${action}d flowId: ${flowId}`,
        approved,
      });
    } else {
      console.log(`❌ Manual test failed: No approval found for ${flowId}`);
      return Response.json(
        {
          ok: false,
          error: `No approval found for flowId: ${flowId}`,
        },
        { status: 404 }
      );
    }
  } catch (e) {
    console.error("Manual test error:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
