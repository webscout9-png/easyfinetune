import { NextRequest, NextResponse } from "next/server";

/**
 * Poll the status of a fine-tuning job.
 * Supports both real Together AI jobs and demo jobs.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const apiKey = req.nextUrl.searchParams.get("apiKey") || "";

  // Demo mode simulation
  if (jobId.startsWith("demo-")) {
    // Simple deterministic progress based on time
    const created = parseInt(jobId.split("-")[1]?.slice(0, 8) || "0", 16) || Date.now();
    const elapsed = Date.now() - (created > 1e12 ? created : Date.now() - 30000);

    if (elapsed < 8000) {
      return NextResponse.json({
        id: jobId,
        status: "queued",
        progress: 5,
        message: "Job queued…",
      });
    }
    if (elapsed < 25000) {
      return NextResponse.json({
        id: jobId,
        status: "running",
        progress: Math.min(90, Math.floor((elapsed / 25000) * 85) + 10),
        message: "Training in progress (demo simulation)…",
      });
    }
    return NextResponse.json({
      id: jobId,
      status: "completed",
      progress: 100,
      message: "Demo training finished successfully!",
      outputModel: `demo-finetuned-${jobId}`,
      note: "This was a simulation. Provide a Together AI API key for real training.",
    });
  }

  // Real Together AI status
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key required for real jobs" },
      { status: 400 }
    );
  }

  try {
    const Together = (await import("together-ai")).default;
    const together = new Together({ apiKey });

    const job = await (together as any).fineTuning.retrieve(jobId);

    // Map Together status to our status
    let status = "running";
    const raw = (job.status || "").toLowerCase();
    if (raw === "completed" || raw === "succeeded") status = "completed";
    else if (raw === "failed" || raw === "cancelled") status = raw;
    else if (raw === "pending" || raw === "queued") status = "queued";

    return NextResponse.json({
      id: job.id,
      status,
      progress: job.progress || (status === "completed" ? 100 : undefined),
      message: job.status || status,
      outputModel: job.output_name || job.model_output_name || job.x_model_output_name,
      events: job.events?.slice(-5),
      error: job.error,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch job status" },
      { status: 500 }
    );
  }
}
