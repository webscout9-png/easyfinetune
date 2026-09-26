import { ModelOption } from "./types";

/**
 * Models for EasyFineTune free Colab path.
 * Prefer plain Unsloth / HF ids — load_in_4bit=True handles quantization.
 */
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2 3B Instruct",
    params: "3B",
    description: "Best free starter. Fits easily on Colab T4.",
    togetherId: "meta-llama/Llama-3.2-3B-Instruct",
    unslothId: "unsloth/Llama-3.2-3B-Instruct",
    recommended: true,
    freeColab: true,
  },
  {
    id: "llama-3.2-1b",
    name: "Llama 3.2 1B Instruct",
    params: "1B",
    description: "Tiny & fast. Ideal for testing.",
    togetherId: "meta-llama/Llama-3.2-1B-Instruct",
    unslothId: "unsloth/Llama-3.2-1B-Instruct",
    freeColab: true,
  },
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B Instruct",
    params: "8B",
    description: "Higher quality. Still fits free T4 in 4-bit.",
    togetherId: "meta-llama/Meta-Llama-3.1-8B-Instruct-Reference",
    unslothId: "unsloth/Meta-Llama-3.1-8B-Instruct",
    freeColab: true,
  },
  {
    id: "qwen2.5-7b",
    name: "Qwen 2.5 7B Instruct",
    params: "7B",
    description: "Strong coding & multilingual.",
    togetherId: "Qwen/Qwen2.5-7B-Instruct",
    unslothId: "unsloth/Qwen2.5-7B-Instruct",
    freeColab: true,
  },
  {
    id: "phi-3.5-mini",
    name: "Phi-3.5 Mini Instruct",
    params: "3.8B",
    description: "Microsoft efficient model.",
    togetherId: "microsoft/Phi-3.5-mini-instruct",
    unslothId: "unsloth/Phi-3.5-mini-instruct",
    freeColab: true,
  },
  {
    id: "gemma-2-9b",
    name: "Gemma 2 9B Instruct",
    params: "9B",
    description: "May be tight on free T4 — use short sequences.",
    togetherId: "google/gemma-2-9b-it",
    unslothId: "unsloth/gemma-2-9b-it",
    freeColab: true,
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
