"use client";

import { useCallback, useState } from "react";
import { Upload, FileJson, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { DatasetPreview } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  onValidated: (file: File, preview: DatasetPreview) => void;
  disabled?: boolean;
}

export default function FileUpload({ onValidated, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<DatasetPreview | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".jsonl") && !file.name.endsWith(".json")) {
        setError("Please upload a .jsonl or .json file");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/validate", {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Validation failed");

        setFileName(file.name);
        setPreview(data.preview);
        onValidated(file, data.preview);
      } catch (err: any) {
        setError(err.message);
        setPreview(null);
        setFileName(null);
      } finally {
        setLoading(false);
      }
    },
    [onValidated]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled || loading) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, loading, handleFile]
  );

  const clear = () => {
    setFileName(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 text-center transition-all",
          dragging
            ? "border-sky-500 bg-sky-500/10"
            : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50",
          (disabled || loading) && "opacity-60 pointer-events-none"
        )}
      >
        <input
          type="file"
          accept=".jsonl,.json"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || loading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        <div className="flex flex-col items-center gap-3">
          {loading ? (
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
              <Upload className="w-7 h-7 text-sky-400" />
            </div>
          )}
          <div>
            <p className="text-lg font-medium text-zinc-100">
              {loading ? "Validating dataset…" : "Drop your dataset here"}
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              or click to browse · JSONL format preferred
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {fileName && preview && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileJson className="w-5 h-5 text-sky-400" />
              <div>
                <p className="font-medium text-zinc-100">{fileName}</p>
                <p className="text-sm text-zinc-400">
                  {preview.totalRows} valid examples · format:{" "}
                  <span className="text-sky-400">{preview.format}</span>
                </p>
              </div>
            </div>
            <button
              onClick={clear}
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {preview.warnings.length > 0 && (
            <div className="space-y-1">
              {preview.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-400/90 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {w}
                </p>
              ))}
            </div>
          )}

          {preview.totalRows > 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Dataset looks good — ready to train
            </div>
          )}
        </div>
      )}
    </div>
  );
}
