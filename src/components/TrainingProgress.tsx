"use client";

import { JobStatus } from "@/lib/types";
import { CheckCircle2, Loader2, XCircle, Download, ExternalLink } from "lucide-react";
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
              ? "Preparing…"
              : status === "queued"
              ? "Queued"
              : status === "running"
              ? "Training in progress"
              : status === "ready"
              ? "Free notebook ready!"
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
        <div className="space-y-4 pt-2 border-t border-zinc-800">
          <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
            <li>Download the notebook below</li>
            <li>
              Open{" "}
              <a
                href="https://colab.research.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                Google Colab <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>File → Upload notebook → select the downloaded file</li>
            <li>
              Runtime → Change runtime type → <strong>T4 GPU</strong>
            </li>
            <li>
              Runtime → <strong>Run all</strong>
            </li>
            <li>
              When finished, download the{" "}
              <code className="text-sky-300">lora_model</code> folder from the left sidebar
            </li>
          </ol>

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

          <p className="text-xs text-zinc-500">
            Training runs 100% on Google&apos;s free GPU. Your laptop is not used.
            Typical time: 10–40 minutes depending on dataset size.
          </p>
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
