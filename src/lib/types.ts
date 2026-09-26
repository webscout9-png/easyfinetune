export interface ModelOption {
  id: string;
  name: string;
  params: string;
  description: string;
  /** Together AI model ID (paid path) */
  togetherId: string;
  /** Unsloth / Hugging Face 4-bit model for free Colab */
  unslothId: string;
  recommended?: boolean;
  /** Fits free Colab T4 (~15GB). Larger models need Colab Pro. */
  freeColab?: boolean;
}

export type JobStatus =
  | "idle"
  | "uploading"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "ready"; // notebook ready for Colab

export interface TrainingJob {
  id: string;
  status: JobStatus;
  modelId: string;
  modelName: string;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  message?: string;
  outputModel?: string;
  error?: string;
  epochs?: number;
  learningRate?: number;
}

export interface DatasetPreview {
  totalRows: number;
  sample: Record<string, any>[];
  format: "messages" | "prompt-completion" | "unknown";
  warnings: string[];
}
