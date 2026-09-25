import { NextRequest, NextResponse } from "next/server";
import { getModelById } from "@/lib/models";
import { normalizeToMessages } from "@/lib/dataset";
import { v4 as uuidv4 } from "uuid";

/**
 * This route starts a fine-tuning job.
 *
 * In production you should:
 * 1. Upload the file to Together AI (or your own storage)
 * 2. Call the Together Fine-Tuning API
 * 3. Store the job ID and return it to the client
 *
 * For the open-source version we support two modes:
 * - Real mode: user provides a Together AI API key
 * - Demo mode: we simulate a job for UI testing
 */

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const modelId = formData.get("modelId") as string;
    const apiKey = (formData.get("apiKey") as string) || "";
    const epochs = Number(formData.get("epochs") || 1);
    const learningRate = Number(formData.get("learningRate") || 0.00001);
    const nEvals = Number(formData.get("nEvals") || 0);

    if (!file) {
      return NextResponse.json({ error: "Dataset file is required" }, { status: 400 });
    }
    if (!modelId) {
      return NextResponse.json({ error: "Model is required" }, { status: 400 });
    }

    const model = getModelById(modelId);
    if (!model) {
      return NextResponse.json({ error: "Unknown model" }, { status: 400 });
    }

    const rawText = await file.text();
    const normalized = normalizeToMessages(rawText);

    if (!normalized.trim()) {
      return NextResponse.json(
        { error: "No valid training examples found after normalization" },
        { status: 400 }
      );
    }

    // Demo / simulation mode when no API key is provided
    if (!apiKey || apiKey.trim() === "") {
      const jobId = `demo-${uuidv4().slice(0, 8)}`;
      return NextResponse.json({
        success: true,
        jobId,
        mode: "demo",
        message:
          "Running in demo mode (no Together API key provided). The UI will simulate a successful training run.",
        model: model.name,
      });
    }

    // Real Together AI flow
    try {
      // Dynamic import so the package is only needed when used
      const Together = (await import("together-ai")).default;
      const together = new Together({ apiKey: apiKey.trim() });

      // 1. Upload the training file
      const blob = new Blob([normalized], { type: "application/jsonl" });
      const uploadFile = new File([blob], "train.jsonl", {
        type: "application/jsonl",
      });

      // together-ai SDK expects a File or path depending on version
      // We use the low-level files.create if available, otherwise fall back
      let fileId: string;

      // Try modern SDK shape
      const uploaded = await (together as any).files.upload({
        file: uploadFile,
        purpose: "fine-tune",
      });

      fileId = uploaded.id || uploaded.file_id;

      if (!fileId) {
        // Alternative shape used by some SDK versions
        const alt = await (together as any).files.create({
          file: uploadFile,
          purpose: "fine-tune",
        });
        fileId = alt.id;
      }

      // 2. Create the fine-tuning job
      const job = await (together as any).fineTuning.create({
        training_file: fileId,
        model: model.togetherId,
        n_epochs: epochs,
        learning_rate: learningRate,
        n_evals: nEvals > 0 ? nEvals : undefined,
        // LoRA is the default and recommended
        // suffix can be added for naming
      });

      return NextResponse.json({
        success: true,
        jobId: job.id,
        mode: "together",
        model: model.name,
        outputName: job.output_name || job.model_output_name,
        message: "Fine-tuning job submitted successfully",
      });
    } catch (err: any) {
      console.error("Together AI error:", err);
      return NextResponse.json(
        {
          error:
            err?.message ||
            "Failed to start training on Together AI. Check your API key and model availability.",
          details: String(err),
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
