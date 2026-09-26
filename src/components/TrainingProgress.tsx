"use client";

import { JobStatus } from "@/lib/types";
import {
  CheckCircle2,
  Loader2,
  XCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  status: JobStatus;
  progress?: number;
  message?: string;
  outputModel?: string;
  error?: string;
  jobId?: string;
  mode?: "colab" | "together" | "demo";
  notebook?: string;
  modelName?: string;
}

export default function TrainingProgress({
  status,
  progress = 0,
  message,
  outputModel,
  error,
  jobId,
  mode,
  notebook,
  modelName,
}: Props) {
  if (status === "idle") return null;

  const isRunning =
    status === "queued" || status === "running" || status === "uploading";
  const isReady = status === "ready";
  const isDone = status === "completed";
  const isFailed = status === "failed" || status === "cancelled";

  const downloadNotebook = () => {
    if (!notebook) return;
    const blob = new Blob([notebook], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `easyfinetune-${modelName?.replace(/\s+/g, "-") || "train"}.ipynb`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 space-y-5",
        isReady || isDone
          ? "border-emerald-500/40 bg-emerald-500/5"
          : isFailed
          ? "border-red-500/40 bg-red-500/5"
          : "border-zinc-800 bg-zinc-900/60"
      )}
    >
      <div className="flex items-center gap-3">
        {isRunning && (
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
        )}
        {(isReady || isDone) && (
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        )}
        {isFailed && <XCircle className="w-6 h-6 text-red-400" />}

        <div>
          <p className="font-semibold text-zinc-100">
            {status === "uploading"
              ? "Preparing your notebook…"
              : status === "queued"
              ? "Queued"
              : status === "running"
              ? "Training in progress"
              : status === "ready"
              ? "Your free training notebook is ready"
              : status === "completed"
              ? "Training complete!"
              : status}
          </p>
          {message && (
            <p className="text-sm text-zinc-400 mt-0.5">{message}</p>
          )}
        </div>
      </div>

      {(isRunning || isDone) && mode !== "colab" && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isDone ? "bg-emerald-500" : "bg-sky-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {jobId && mode !== "colab" && (
        <p className="text-xs text-zinc-500 font-mono">Job ID: {jobId}</p>
      )}

      {isReady && mode === "colab" && notebook && (
        <div className="space-y-6 pt-2 border-t border-zinc-800">
          <div>
            <p className="text-sm font-medium text-emerald-300 mb-3">
              Do these steps exactly (for beginners)
            </p>
            <ol className="text-sm text-zinc-300 space-y-3 list-decimal list-inside">
              <li>
                Click <strong className="text-white">Download Notebook</strong>{" "}
                below — save the .ipynb file.
              </li>
              <li>
                Open{" "}
                <a
                  href="https://colab.research.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  Google Colab <ExternalLink className="w-3 h-3" />
                </a>{" "}
                (free Google account).
              </li>
              <li>
                In Colab: <strong className="text-white">File → Upload notebook</strong>{" "}
                → choose the file you downloaded.
              </li>
              <li>
                <strong className="text-white">
                  Runtime → Change runtime type → T4 GPU
                </strong>{" "}
                → Save. (Must say GPU, not CPU.)
              </li>
              <li>
                <strong className="text-white">Runtime → Run all</strong> and wait.
                Keep the tab open (10–40 min).
              </li>
              <li>
                When done, open the <strong className="text-white">Files</strong>{" "}
                panel (folder icon on the left). Download{" "}
                <code className="text-sky-300">lora_model.zip</code>.
              </li>
            </ol>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadNotebook}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
            >
              <Download className="w-4 h-4" />
              Download Notebook (.ipynb)
            </button>
            <a
              href="https://colab.research.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium transition border border-zinc-700"
            >
              Open Google Colab
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="rounded-xl bg-zinc-950/80 border border-zinc-700 p-4 space-y-3 text-sm text-zinc-300">
            <p className="font-medium text-zinc-100">
              After training — how to use / send your model
            </p>
            <ul className="space-y-2 list-disc list-inside text-zinc-400">
              <li>
                <strong className="text-zinc-200">Your result file</strong> is{" "}
                <code className="text-sky-300">lora_model.zip</code>. That is the
                fine-tuned model. Save it somewhere safe.
              </li>
              <li>
                <strong className="text-zinc-200">Test it in Colab:</strong> the
                notebook has a “Test your model” cell — run it to chat right away.
              </li>
              <li>
                <strong className="text-zinc-200">Send to someone:</strong> send
                them the zip + the base model name shown in the notebook. Or upload
                to Hugging Face (instructions are inside the notebook).
              </li>
              <li>
                <strong className="text-zinc-200">Use on your PC:</strong> follow
                “Option C — Ollama” in the last section of the notebook for a simple
                chat app.
              </li>
            </ul>
            <p className="text-xs text-zinc-500 pt-1">
              You do not need to train again to use the model. Loading the saved
              adapter is enough.
            </p>
          </div>
        </div>
      )}

      {isDone && outputModel && (
        <div className="pt-2 border-t border-zinc-800">
          <p className="text-sm text-zinc-300 mb-2">Your fine-tuned model:</p>
          <code className="block text-sm bg-zinc-950 px-3 py-2 rounded-lg text-sky-300 break-all">
            {outputModel}
          </code>
        </div>
      )}

      {isFailed && error && (
        <div className="text-sm text-red-300 bg-red-500/10 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}
