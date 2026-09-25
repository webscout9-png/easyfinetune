# EasyFineTune

**One-click open-source LLM fine-tuning.**

Upload a dataset → pick a model → click **Train**.  
No scripts, no GPU management, no complexity.

---

## Features

- Clean modern UI (Next.js + Tailwind)
- Drag-and-drop dataset upload with automatic validation
- Support for both `messages` (chat) and `prompt`/`completion` formats
- Curated list of popular open-source models (Llama 3.1, Qwen 2.5, Mistral, Gemma, Phi…)
- Real training via **Together AI** Fine-Tuning API
- Full **demo mode** (no API key required) so you can test the entire flow
- Live progress tracking
- Advanced settings (epochs, learning rate)
- Ready for Vercel deployment

---

## Quick Start (Local)

```bash
# 1. Clone / enter the project
cd easyfinetune

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import this GitHub repository (`webscout9-png/easyfinetune`).
3. Click **Deploy** (no environment variables required for demo mode).

Optional: add a server-side `TOGETHER_API_KEY` later if you want to hide the key from users.

---

## How Training Works

### Demo Mode (default)
Leave the API key empty. The app simulates a realistic training run so you can experience the full UI flow.

### Real Mode
1. Create a free account at [api.together.xyz](https://api.together.xyz)
2. Copy your API key
3. Paste it in the UI
4. Upload a dataset and click **Start Fine-Tuning**

The backend:
- Validates & normalizes your dataset
- Uploads it to Together AI
- Starts a LoRA fine-tuning job
- Polls status until completion
- Returns the fine-tuned model identifier

---

## Dataset Format

**Preferred (chat format):**
```json
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]}
{"messages": [{"role": "user", "content": "What is 2+2?"}, {"role": "assistant", "content": "4"}]}
```

**Also supported:**
```json
{"prompt": "What is the capital of France?", "completion": "Paris"}
```

Save as `.jsonl` (one JSON object per line).

Recommended: **200–2000 high-quality examples**.

---

## Project Structure

```
easyfinetune/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── models/route.ts
│   │   │   ├── validate/route.ts
│   │   │   ├── train/route.ts
│   │   │   └── status/[jobId]/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── FileUpload.tsx
│   │   ├── ModelSelector.tsx
│   │   └── TrainingProgress.tsx
│   └── lib/
│       ├── types.ts
│       ├── models.ts
│       ├── dataset.ts
│       └── utils.ts
├── package.json
├── README.md
└── ...
```

---

## Extending the Tool

### Add more models
Edit `src/lib/models.ts` and add entries that exist on Together AI.

### Switch to self-hosted training (Unsloth + RunPod)
Replace the Together AI calls inside `src/app/api/train/route.ts` with a job that:
1. Uploads the dataset to object storage
2. Spins up a RunPod pod with the Unsloth Docker image
3. Runs the training command
4. Downloads the resulting adapter

### Hide the API key
Move the Together API key to an environment variable (`TOGETHER_API_KEY`) and never send it from the client.

---

## License

MIT — free to use, modify, and commercialize.

---

Built for people who want fine-tuning to feel as simple as uploading a file.
