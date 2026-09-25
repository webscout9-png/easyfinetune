export interface ModelOption {
  id: string;
  name: string;
  params: string;
  description: string;
  togetherId: string; // actual Together AI model identifier
  recommended?: boolean;
}

export type JobStatus =
  | "idle"
  | "uploading"
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

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
