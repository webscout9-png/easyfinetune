import { DatasetPreview } from "./types";

/**
 * Validate and preview an uploaded dataset.
 * Supports JSONL with either:
 *  - { "messages": [ {role, content}, ... ] }
 *  - { "prompt": "...", "completion": "..." }
 */
export function validateAndPreviewDataset(
  content: string
): DatasetPreview {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      totalRows: 0,
      sample: [],
      format: "unknown",
      warnings: ["File is empty"],
    };
  }

  const samples: Record<string, any>[] = [];
  const warnings: string[] = [];
  let format: "messages" | "prompt-completion" | "unknown" = "unknown";
  let validCount = 0;

  for (let i = 0; i < lines.length; i++) {
    try {
      const obj = JSON.parse(lines[i]);

      if (Array.isArray(obj.messages)) {
        if (format === "unknown") format = "messages";
        if (format !== "messages") {
          warnings.push(`Line ${i + 1}: mixed formats detected`);
        }
        // basic check
        if (obj.messages.length < 2) {
          warnings.push(`Line ${i + 1}: messages array too short`);
        }
        validCount++;
        if (samples.length < 3) samples.push(obj);
      } else if (obj.prompt !== undefined && obj.completion !== undefined) {
        if (format === "unknown") format = "prompt-completion";
        if (format !== "prompt-completion") {
          warnings.push(`Line ${i + 1}: mixed formats detected`);
        }
        validCount++;
        if (samples.length < 3) samples.push(obj);
      } else {
        warnings.push(
          `Line ${i + 1}: unknown format (need "messages" or "prompt"+"completion")`
        );
      }
    } catch {
      warnings.push(`Line ${i + 1}: invalid JSON`);
    }
  }

  if (validCount === 0) {
    warnings.unshift("No valid training examples found");
  } else if (validCount < 50) {
    warnings.push(
      `Only ${validCount} examples. Recommended minimum is 200–500 high-quality examples for good results.`
    );
  }

  return {
    totalRows: validCount,
    sample: samples,
    format,
    warnings: warnings.slice(0, 10), // limit noise
  };
}

/**
 * Convert prompt-completion format to messages format if needed.
 */
export function normalizeToMessages(content: string): string {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const out: string[] = [];

  for (const line of lines) {
    try {
      const obj = JSON.parse(line);
      if (Array.isArray(obj.messages)) {
        out.push(JSON.stringify(obj));
      } else if (obj.prompt !== undefined && obj.completion !== undefined) {
        out.push(
          JSON.stringify({
            messages: [
              { role: "user", content: String(obj.prompt) },
              { role: "assistant", content: String(obj.completion) },
            ],
          })
        );
      }
    } catch {
      // skip invalid
    }
  }

  return out.join("\n");
}
