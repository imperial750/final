import approvalSystem from "@/lib/approval-system";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const flowId = searchParams.get("flowId");

    if (!flowId) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Missing flowId parameter",
        }),
        { status: 400 }
      );
    }

    const status = approvalSystem.checkApprovalStatus(flowId);

    return Response.json({
      ok: true,
      ...status,
    });
  } catch (e) {
    console.error("Status check error:", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
    });
  }
}
