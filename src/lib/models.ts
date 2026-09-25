import { ModelOption } from "./types";

/**
 * Curated list of popular open-source models available for fine-tuning.
 * These map to real Together AI model IDs that support fine-tuning.
 * You can expand this list as Together AI adds more models.
 */
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B Instruct",
    params: "8B",
    description: "Best overall balance of quality and speed. Excellent starting point.",
    togetherId: "meta-llama/Meta-Llama-3.1-8B-Instruct-Reference",
    recommended: true,
  },
  {
    id: "llama-3.2-3b",
    name: "Llama 3.2 3B Instruct",
    params: "3B",
    description: "Fast and lightweight. Great for experimentation and low cost.",
    togetherId: "meta-llama/Llama-3.2-3B-Instruct",
  },
  {
    id: "qwen2.5-7b",
    name: "Qwen 2.5 7B Instruct",
    params: "7B",
    description: "Strong multilingual and coding capabilities.",
    togetherId: "Qwen/Qwen2.5-7B-Instruct",
  },
  {
    id: "qwen2.5-14b",
    name: "Qwen 2.5 14B Instruct",
    params: "14B",
    description: "Higher quality, still reasonable cost.",
    togetherId: "Qwen/Qwen2.5-14B-Instruct",
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B Instruct v0.3",
    params: "7B",
    description: "Reliable and well-supported open model.",
    togetherId: "mistralai/Mistral-7B-Instruct-v0.3",
  },
  {
    id: "gemma-2-9b",
    name: "Gemma 2 9B Instruct",
    params: "9B",
    description: "Google's strong instruction-following model.",
    togetherId: "google/gemma-2-9b-it",
  },
  {
    id: "phi-3.5-mini",
    name: "Phi-3.5 Mini Instruct",
    params: "3.8B",
    description: "Very efficient Microsoft model. Good for tight budgets.",
    togetherId: "microsoft/Phi-3.5-mini-instruct",
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
