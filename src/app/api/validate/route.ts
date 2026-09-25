import { NextRequest, NextResponse } from "next/server";
import { validateAndPreviewDataset } from "@/lib/dataset";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const preview = validateAndPreviewDataset(text);

    return NextResponse.json({
      success: true,
      preview,
      filename: file.name,
      size: file.size,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Validation failed" },
      { status: 500 }
    );
  }
}
