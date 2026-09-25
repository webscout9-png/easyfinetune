"use client";

import { ModelOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface Props {
  models: ModelOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  models,
  selectedId,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {models.map((model) => {
        const selected = selectedId === model.id;
        return (
          <button
            key={model.id}
            disabled={disabled}
            onClick={() => onSelect(model.id)}
            className={cn(
              "relative text-left p-4 rounded-2xl border transition-all",
              selected
                ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/40"
                : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 hover:bg-zinc-900",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {model.recommended && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                Recommended
              </span>
            )}

            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  selected
                    ? "border-sky-500 bg-sky-500"
                    : "border-zinc-600"
                )}
              >
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-zinc-100">{model.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {model.params} parameters
                </p>
                <p className="text-sm text-zinc-400 mt-2 leading-snug">
                  {model.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
