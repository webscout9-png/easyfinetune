import { ModelOption } from "./types";

/**
 * Models verified for fine-tuning on Together AI (2026).
 * Only include models that appear in the official supported models list.
 * See: https://docs.together.ai/docs/fine-tuning/supported-models
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
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B Instruct",
    params: "70B",
    description: "Highest quality. Higher cost and longer training time.",
    togetherId: "meta-llama/Llama-3.3-70B-Instruct-Reference",
  },
  {
    id: "mixtral-8x7b",
    name: "Mixtral 8x7B Instruct",
    params: "46.7B MoE",
    description: "Strong MoE model — good quality at efficient cost.",
    togetherId: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  },
  {
    id: "qwen3.5-9b",
    name: "Qwen 3.5 9B",
    params: "9B",
    description: "Modern Qwen model with strong multilingual and coding skills.",
    togetherId: "Qwen/Qwen3.5-9B",
  },
  {
    id: "qwen3.5-4b",
    name: "Qwen 3.5 4B",
    params: "4B",
    description: "Small, fast, and cheap — good for quick experiments.",
    togetherId: "Qwen/Qwen3.5-4B",
  },
  {
    id: "gemma-3-4b",
    name: "Gemma 3 4B Instruct",
    params: "4B",
    description: "Google's efficient instruction-tuned model.",
    togetherId: "google/gemma-3-4b-it",
  },
];

export function getModelById(id: string): ModelOption | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}
