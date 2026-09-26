# EasyFineTune

**One-click free fine-tuning for open-source LLMs.**

Upload a dataset → pick a model → click **Train**.  
Training runs on **Google’s free Colab GPU** via Unsloth. Your laptop is never used.

---

## How it works

### Free path (default — no API key)

1. Upload JSONL dataset  
2. Choose a model (3B–9B, all fit free Colab T4)  
3. Click **Train for Free**  
4. Download the generated Unsloth notebook  
5. Open [Google Colab](https://colab.research.google.com) → Upload notebook → Runtime → **T4 GPU** → **Run all**  
6. Download the `lora_model` folder when training finishes  

**Cost: $0.** Hardware used: Google’s free T4 only.

### Paid path (optional)

Paste a [Together AI](https://api.together.xyz) API key before clicking Train.  
Job runs fully managed on Together’s infrastructure.

---

## Features

- Same simple UI for free and paid paths  
- Dataset validation + auto-normalize to chat `messages` format  
- Unsloth-optimized models that fit free Colab T4  
- Ready-to-run `.ipynb` with your data embedded  
- Optional Together AI managed fine-tuning  
- Deployable on Vercel  

---

## Quick Start (Local)

```bash
cd easyfinetune
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy on Vercel

1. Push this repo to GitHub  
2. Import in [Vercel](https://vercel.com)  
3. Deploy (no env vars required for free Colab path)  

---

## Dataset format

**JSONL** — one example per line.

Chat format (preferred):

```json
{"messages":[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there!"}]}
```

Or prompt/completion:

```json
{"prompt":"Hello","completion":"Hi there!"}
```

---

## Models (free Colab)

| Model | Size | Fits free T4 |
|-------|------|--------------|
| Llama 3.2 1B / 3B | 1–3B | Yes |
| Llama 3.1 8B | 8B | Yes (Unsloth 4-bit) |
| Qwen 2.5 7B | 7B | Yes |
| Gemma 2 9B | 9B | Tight, short context |
| Phi-3.5 Mini | 3.8B | Yes |

---

## License

MIT
