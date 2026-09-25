"use client";

import { useState, useEffect, useCallback } from "react";
import FileUpload from "@/components/FileUpload";
import ModelSelector from "@/components/ModelSelector";
import TrainingProgress from "@/components/TrainingProgress";
import { AVAILABLE_MODELS } from "@/lib/models";
import { DatasetPreview, JobStatus, ModelOption } from "@/lib/types";
import { Rocket, Key, Settings2, Github, ExternalLink } from "lucide-react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(
    "llama-3.1-8b"
  );
  const [apiKey, setApiKey] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [epochs, setEpochs] = useState(1);
  const [learningRate, setLearningRate] = useState(0.00001);

  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<JobStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | undefined>();
  const [outputModel, setOutputModel] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const models: ModelOption[] = AVAILABLE_MODELS;

  const canTrain =
    !!file &&
    !!preview &&
    preview.totalRows > 0 &&
    !!selectedModelId &&
    status !== "running" &&
    status !== "queued" &&
    status !== "uploading";

  const handleValidated = useCallback((f: File, p: DatasetPreview) => {
    setFile(f);
    setPreview(p);
  }, []);

  useEffect(() => {
    if (!jobId || status === "completed" || status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const url = new URL(`/api/status/${jobId}`, window.location.origin);
        if (apiKey) url.searchParams.set("apiKey", apiKey);

        const res = await fetch(url.toString());
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          setStatus("failed");
          return;
        }

        setStatus(data.status);
        if (typeof data.progress === "number") setProgress(data.progress);
        if (data.message) setMessage(data.message);
        if (data.outputModel) setOutputModel(data.outputModel);
        if (data.error) setError(data.error);
      } catch (err) {
        console.error("Poll error", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, status, apiKey]);

  const startTraining = async () => {
    if (!file || !selectedModelId) return;

    setIsSubmitting(true);
    setStatus("uploading");
    setProgress(5);
    setMessage("Uploading dataset and creating job…");
    setError(undefined);
    setOutputModel(undefined);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("modelId", selectedModelId);
      form.append("apiKey", apiKey);
      form.append("epochs", String(epochs));
      form.append("learningRate", String(learningRate));

      const res = await fetch("/api/train", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start training");
      }

      setJobId(data.jobId);
      setStatus("queued");
      setMessage(data.message || "Job submitted");
      setProgress(10);
    } catch (err: any) {
      setStatus("failed");
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">EasyFineTune</h1>
              <p className="text-[11px] text-zinc-500 -mt-0.5">
                One-click open-source model fine-tuning
              </p>
            </div>
          </div>

          <a
            href="https://github.com/webscout9-png/easyfinetune"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <section className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Fine-tune any open model
            <br />
            in one click
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Upload your dataset, pick a model, and hit train. No scripts, no
            GPU management, no complexity.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
              1
            </span>
            <h3 className="text-xl font-semibold">Upload your dataset</h3>
          </div>
          <p className="text-sm text-zinc-400 ml-11">
            JSONL format with either{" "}
            <code className="text-sky-400">messages</code> (chat) or{" "}
            <code className="text-sky-400">prompt</code> +{" "}
            <code className="text-sky-400">completion</code> fields.
          </p>
          <div className="ml-0 sm:ml-11">
            <FileUpload
              onValidated={handleValidated}
              disabled={status === "running" || status === "queued"}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
              2
            </span>
            <h3 className="text-xl font-semibold">Choose a model</h3>
          </div>
          <div className="ml-0 sm:ml-11">
            <ModelSelector
              models={models}
              selectedId={selectedModelId}
              onSelect={setSelectedModelId}
              disabled={status === "running" || status === "queued"}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">
              3
            </span>
            <h3 className="text-xl font-semibold">API Key (optional for demo)</h3>
          </div>

          <div className="ml-0 sm:ml-11 space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                placeholder="Together AI API key (leave empty for demo mode)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={status === "running" || status === "queued"}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 placeholder:text-zinc-600"
              />
            </div>
            <p className="text-xs text-zinc-500">
              Get a free key at{" "}
              <a
                href="https://api.together.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                api.together.xyz <ExternalLink className="w-3 h-3" />
              </a>
              . Without a key the app runs in full demo mode so you can test the UI.
            </p>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              <Settings2 className="w-4 h-4" />
              {showAdvanced ? "Hide" : "Show"} advanced settings
            </button>

            {showAdvanced && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Epochs
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Learning Rate
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="pt-4">
          <button
            onClick={startTraining}
            disabled={!canTrain || isSubmitting}
            className={`
              w-full sm:w-auto min-w-[240px] mx-auto flex items-center justify-center gap-3
              px-8 py-4 rounded-2xl font-semibold text-lg transition-all
              ${
                canTrain && !isSubmitting
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }
            `}
          >
            {isSubmitting || status === "uploading" ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Start Fine-Tuning
              </>
            )}
          </button>
        </section>

        {(status !== "idle" || error) && (
          <section>
            <TrainingProgress
              status={status}
              progress={progress}
              message={message}
              outputModel={outputModel}
              error={error}
              jobId={jobId || undefined}
            />
          </section>
        )}

        <section className="pt-8 border-t border-zinc-800/60">
          <div className="rounded-2xl bg-zinc-900/40 border border-zinc-800 p-6 text-sm text-zinc-400 space-y-2">
            <p className="font-medium text-zinc-200">How it works</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Your dataset is validated and normalized to the standard chat format.
              </li>
              <li>
                Training runs on Together AI’s infrastructure (or simulated in demo mode).
              </li>
              <li>
                You receive a fine-tuned model identifier you can deploy immediately.
              </li>
              <li>
                For fully private / self-hosted training you can later swap the backend to Unsloth + RunPod.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/60 py-8 text-center text-xs text-zinc-600">
        Built with Next.js · Powered by Together AI · Open source ready
      </footer>
    </div>
  );
}
