import { NextRequest, NextResponse } from "next/server";
import { getModelById } from "@/lib/models";
import { normalizeToMessages } from "@/lib/dataset";
import { buildUnslothNotebook } from "@/lib/colab";
import { v4 as uuidv4 } from "uuid";

/**
 * Start training.
 *
 * Default (no API key) → Free path: generate Unsloth Google Colab notebook
 * With Together API key → paid managed fine-tune on Together AI
 *
 * UI flow is always: upload dataset → pick model → click Train
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const modelId = formData.get("modelId") as string;
    const apiKey = ((formData.get("apiKey") as string) || "").trim();
    const epochs = Number(formData.get("epochs") || 1);
    const learningRate = Number(formData.get("learningRate") || 2e-4);

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

    // FREE PATH (default): Google Colab + Unsloth
    if (!apiKey) {
      const byteSize = new TextEncoder().encode(normalized).length;
      if (byteSize > 4_500_000) {
        return NextResponse.json(
          {
            error:
              "Dataset is too large to embed in a free Colab notebook (>~4.5 MB). Use a smaller sample or provide a Together AI API key for cloud training.",
          },
          { status: 400 }
        );
      }

      const notebook = buildUnslothNotebook({
        model,
        datasetJsonl: normalized,
        epochs: Math.min(Math.max(epochs, 1), 5),
        learningRate: learningRate || 2e-4,
      });

      const jobId = `colab-${uuidv4().slice(0, 8)}`;

      return NextResponse.json({
        success: true,
        jobId,
        mode: "colab",
        model: model.name,
        unslothId: model.unslothId,
        exampleCount: lineCount,
        notebook,
        message:
          "Free notebook ready. Open it in Google Colab (T4 GPU) and click Runtime → Run all. Training uses Google's free GPU — nothing runs on your device.",
      });
    }

    // PAID PATH: Together AI
    try {
      const Together = (await import("together-ai")).default;
      const together = new Together({ apiKey });

      const blob = new Blob([normalized], { type: "application/jsonl" });
      const uploadFile = new File([blob], "train.jsonl", {
        type: "application/jsonl",
      });

      let fileId: string | undefined;

      try {
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
            `File upload failed: ${uploadErr?.message || String(uploadErr)}`
          );
        }
      }

      if (!fileId) {
        throw new Error("File upload succeeded but no file ID was returned.");
      }

      await new Promise((r) => setTimeout(r, 1500));

      const job = await (together as any).fineTuning.create({
        training_file: fileId,
        model: model.togetherId,
        n_epochs: Math.min(Math.max(epochs, 1), 10),
        learning_rate: learningRate || 1e-5,
        suffix: `easyfinetune-${Date.now().toString(36).slice(-6)}`,
      });

      if (!job?.id) {
        throw new Error("Fine-tuning job created but no job ID returned.");
      }

      return NextResponse.json({
        success: true,
        jobId: job.id,
        mode: "together",
        model: model.name,
        outputName:
          job.output_name || job.model_output_name || job.x_model_output_name,
        message: "Fine-tuning job submitted on Together AI",
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
          "Invalid Together AI API key. Leave the key empty to use free Google Colab instead.";
      }

      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
