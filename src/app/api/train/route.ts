import { NextRequest, NextResponse } from "next/server";
import { getModelById } from "@/lib/models";
import { normalizeToMessages } from "@/lib/dataset";
import { v4 as uuidv4 } from "uuid";

/**
 * Start a fine-tuning job.
 *
 * - No API key → demo mode (simulated job for UI testing)
 * - With Together AI API key → real LoRA fine-tune
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const modelId = formData.get("modelId") as string;
    const apiKey = ((formData.get("apiKey") as string) || "").trim();
    const epochs = Number(formData.get("epochs") || 1);
    const learningRate = Number(formData.get("learningRate") || 1e-5);

    if (!file) {
      return NextResponse.json(
        { error: "Dataset file is required" },
        { status: 400 }
      );
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
        {
          error:
            "No valid training examples found. Use JSONL with either messages[] or prompt+completion fields.",
        },
        { status: 400 }
      );
    }

    const lineCount = normalized.split("\n").filter(Boolean).length;
    if (lineCount < 1) {
      return NextResponse.json(
        { error: "Dataset is empty after normalization" },
        { status: 400 }
      );
    }

    // Demo mode
    if (!apiKey) {
      const jobId = `demo-${uuidv4().slice(0, 8)}`;
      return NextResponse.json({
        success: true,
        jobId,
        mode: "demo",
        message:
          "Running in demo mode (no Together API key). The UI will simulate a successful training run.",
        model: model.name,
      });
    }

    // Real Together AI flow
    try {
      const Together = (await import("together-ai")).default;
      const together = new Together({ apiKey });

      // 1. Upload training file (correct JS SDK signature)
      const blob = new Blob([normalized], { type: "application/jsonl" });
      const uploadFile = new File([blob], "train.jsonl", {
        type: "application/jsonl",
      });

      let fileId: string | undefined;

      try {
        // Official shape: { file, file_name, purpose }
        const uploaded = await (together as any).files.upload({
          file: uploadFile,
          file_name: "train.jsonl",
          purpose: "fine-tune",
        });
        fileId = uploaded?.id || uploaded?.file_id;
      } catch (uploadErr: any) {
        try {
          const uploaded2 = await (together as any).files.upload(
            uploadFile,
            "fine-tune"
          );
          fileId = uploaded2?.id || uploaded2?.file_id;
        } catch {
          throw new Error(
            `File upload failed: ${uploadErr?.message || String(uploadErr)}. ` +
              `Make sure your API key is valid and has fine-tuning access.`
          );
        }
      }

      if (!fileId) {
        throw new Error(
          "File upload succeeded but no file ID was returned. Please try again."
        );
      }

      // Brief wait to help file processing start
      await new Promise((r) => setTimeout(r, 1500));

      // 2. Create fine-tuning job (LoRA is default on Together)
      const job = await (together as any).fineTuning.create({
        training_file: fileId,
        model: model.togetherId,
        n_epochs: Math.min(Math.max(epochs, 1), 10),
        learning_rate: learningRate,
        suffix: `easyfinetune-${Date.now().toString(36).slice(-6)}`,
      });

      if (!job?.id) {
        throw new Error(
          "Fine-tuning job was created but no job ID was returned."
        );
      }

      return NextResponse.json({
        success: true,
        jobId: job.id,
        mode: "together",
        model: model.name,
        outputName:
          job.output_name || job.model_output_name || job.x_model_output_name,
        message: "Fine-tuning job submitted successfully on Together AI",
        fileId,
        exampleCount: lineCount,
      });
    } catch (err: any) {
      console.error("Together AI error:", err);

      let msg =
        err?.error?.message ||
        err?.message ||
        err?.body?.error?.message ||
        String(err);

      if (/api.?key|unauthorized|401|403/i.test(msg)) {
        msg =
          "Invalid or missing Together AI API key. Get one at https://api.together.xyz and paste it above.";
      } else if (/model|not supported|not found|invalid model/i.test(msg)) {
        msg = `Model "${model.togetherId}" is not available for fine-tuning with your account. Try Llama 3.1 8B or Llama 3.2 3B. Original: ${msg}`;
      } else if (/file|format|jsonl|validation/i.test(msg)) {
        msg = `Dataset issue: ${msg}. Ensure each line is valid JSON with "messages" or "prompt"/"completion".`;
      }

      return NextResponse.json(
        {
          error: msg,
          details: err?.status || err?.code || undefined,
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
