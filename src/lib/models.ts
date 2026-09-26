import { ModelOption } from "./types";

/**
 * Models for EasyFineTune.
 * - unslothId: 4-bit versions that fit free Google Colab T4 (recommended free path)
 * - togetherId: paid managed fine-tuning on Together AI
 */
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2 3B Instruct",
    params: "3B",
    description: "Fastest free option. Fits easily on Colab T4.",
    togetherId: "meta-llama/Llama-3.2-3B-Instruct",
    unslothId: "unsloth/Llama-3.2-3B-Instruct-bnb-4bit",
    recommended: true,
    freeColab: true,
  },
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B Instruct",
    params: "8B",
    description: "Best quality that still fits free Colab T4 with Unsloth.",
    togetherId: "meta-llama/Meta-Llama-3.1-8B-Instruct-Reference",
    unslothId: "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit",
    freeColab: true,
  },
  {
    id: "qwen2.5-7b",
    name: "Qwen 2.5 7B Instruct",
    params: "7B",
    description: "Strong coding & multilingual. Free on Colab.",
    togetherId: "Qwen/Qwen2.5-7B-Instruct",
    unslothId: "unsloth/Qwen2.5-7B-Instruct-bnb-4bit",
    freeColab: true,
  },
  {
    id: "gemma-2-9b",
    name: "Gemma 2 9B Instruct",
    params: "9B",
    description: "Google model. May be tight on free T4 — use short context.",
    togetherId: "google/gemma-2-9b-it",
    unslothId: "unsloth/gemma-2-9b-it-bnb-4bit",
    freeColab: true,
  },
  {
    id: "llama-3.2-1b",
    name: "Llama 3.2 1B Instruct",
    params: "1B",
    description: "Tiny & very fast. Perfect for testing the flow.",
    togetherId: "meta-llama/Llama-3.2-1B-Instruct",
    unslothId: "unsloth/Llama-3.2-1B-Instruct-bnb-4bit",
    freeColab: true,
  },
  {
    id: "phi-3.5-mini",
    name: "Phi-3.5 Mini Instruct",
    params: "3.8B",
    description: "Microsoft efficient model. Great on free Colab.",
    togetherId: "microsoft/Phi-3.5-mini-instruct",
    unslothId: "unsloth/Phi-3.5-mini-instruct-bnb-4bit",
    freeColab: true,
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
