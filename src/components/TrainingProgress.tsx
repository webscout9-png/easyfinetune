"use client";

import { JobStatus } from "@/lib/types";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  status: JobStatus;
  progress?: number;
  message?: string;
  outputModel?: string;
  error?: string;
  jobId?: string;
}

export default function TrainingProgress({
  status,
  progress = 0,
  message,
  outputModel,
  error,
  jobId,
}: Props) {
  if (status === "idle") return null;

  const isRunning = status === "queued" || status === "running" || status === "uploading";
  const isDone = status === "completed";
  const isFailed = status === "failed" || status === "cancelled";

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 space-y-5",
        isDone
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
        {isDone && <CheckCircle2 className="w-6 h-6 text-emerald-400" />}
        {isFailed && <XCircle className="w-6 h-6 text-red-400" />}
        {status === "idle" && <Clock className="w-6 h-6 text-zinc-500" />}

        <div>
          <p className="font-semibold text-zinc-100 capitalize">
            {status === "uploading"
              ? "Uploading dataset…"
              : status === "queued"
              ? "Queued"
              : status === "running"
              ? "Training in progress"
              : status === "completed"
              ? "Training complete!"
              : status}
          </p>
          {message && (
            <p className="text-sm text-zinc-400 mt-0.5">{message}</p>
          )}
        </div>
      </div>

      {(isRunning || isDone) && (
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

      {jobId && (
        <p className="text-xs text-zinc-500 font-mono">Job ID: {jobId}</p>
      )}

      {isDone && outputModel && (
        <div className="pt-2 border-t border-zinc-800">
          <p className="text-sm text-zinc-300 mb-2">Your fine-tuned model:</p>
          <code className="block text-sm bg-zinc-950 px-3 py-2 rounded-lg text-sky-300 break-all">
            {outputModel}
          </code>
          <p className="text-xs text-zinc-500 mt-3">
            You can now deploy this model on Together AI, download the adapter,
            or use it with your preferred inference stack.
          </p>
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
