import { ModelOption } from "./types";

/**
 * Build a complete Unsloth Google Colab notebook (.ipynb JSON).
 * Dataset is embedded so the user only needs to Run all on free T4 GPU.
 */
export function buildUnslothNotebook(opts: {
  model: ModelOption;
  datasetJsonl: string;
  epochs: number;
  learningRate: number;
  maxSeqLength?: number;
}): string {
  const {
    model,
    datasetJsonl,
    epochs,
    learningRate,
    maxSeqLength = 2048,
  } = opts;

  const escapedData = datasetJsonl
    .replace(/\\/g, "\\\\")
    .replace(/'''/g, "\\'\\'\\'");

  const cells: any[] = [
    {
      cell_type: "markdown",
      metadata: {},
      source: [
        `# EasyFineTune — Free training with Unsloth\n`,
        `\n`,
        `**Model:** ${model.name} (\`${model.unslothId}\`)\n`,
        `\n`,
        `1. Runtime → Change runtime type → **T4 GPU**\n`,
        `2. Runtime → **Run all**\n`,
        `3. Wait until training finishes (usually 10–40 min on free Colab)\n`,
        `4. Download the adapter folder or push to Hugging Face Hub\n`,
        `\n`,
        `Training runs on **Google's free GPU** — nothing uses your laptop.\n`,
      ],
    },
    {
      cell_type: "code",
      metadata: {},
      source: [
        `# Install Unsloth (optimized for free Colab T4)\n`,
        `!pip install -q unsloth\n`,
        `!pip install -q --upgrade --no-cache-dir transformers trl datasets accelerate bitsandbytes\n`,
      ],
      outputs: [],
      execution_count: null,
    },
    {
      cell_type: "code",
      metadata: {},
      source: [
        `from unsloth import FastLanguageModel\n`,
        `import torch\n`,
        `\n`,
        `max_seq_length = ${maxSeqLength}\n`,
        `dtype = None  # auto\n`,
        `load_in_4bit = True\n`,
        `\n`,
        `model, tokenizer = FastLanguageModel.from_pretrained(\n`,
        `    model_name = "${model.unslothId}",\n`,
        `    max_seq_length = max_seq_length,\n`,
        `    dtype = dtype,\n`,
        `    load_in_4bit = load_in_4bit,\n`,
        `)\n`,
        `\n`,
        `model = FastLanguageModel.get_peft_model(\n`,
        `    model,\n`,
        `    r = 16,\n`,
        `    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",\n`,
        `                      "gate_proj", "up_proj", "down_proj"],\n`,
        `    lora_alpha = 16,\n`,
        `    lora_dropout = 0,\n`,
        `    bias = "none",\n`,
        `    use_gradient_checkpointing = "unsloth",\n`,
        `    random_state = 3407,\n`,
        `)\n`,
        `print("Model ready for training")\n`,
      ],
      outputs: [],
      execution_count: null,
    },
    {
      cell_type: "code",
      metadata: {},
      source: [
        `# Your dataset (embedded by EasyFineTune)\n`,
        `import json, tempfile, os\n`,
        `from datasets import load_dataset\n`,
        `\n`,
        `RAW_DATA = r'''${escapedData}'''\n`,
        `\n`,
        `with tempfile.NamedTemporaryFile(mode="w", suffix=".jsonl", delete=False) as f:\n`,
        `    f.write(RAW_DATA.strip() + "\\n")\n`,
        `    path = f.name\n`,
        `\n`,
        `dataset = load_dataset("json", data_files=path, split="train")\n`,
        `print(f"Loaded {len(dataset)} examples")\n`,
        `print(dataset[0])\n`,
      ],
      outputs: [],
      execution_count: null,
    },
    {
      cell_type: "code",
      metadata: {},
      source: [
        `from unsloth.chat_templates import get_chat_template\n`,
        `\n`,
        `tokenizer = get_chat_template(\n`,
        `    tokenizer,\n`,
        `    chat_template = "chatml",\n`,
        `)\n`,
        `\n`,
        `def formatting_prompts_func(examples):\n`,
        `    convos = examples["messages"]\n`,
        `    texts = [\n`,
        `        tokenizer.apply_chat_template(convo, tokenize=False, add_generation_prompt=False)\n`,
        `        for convo in convos\n`,
        `    ]\n`,
        `    return { "text": texts }\n`,
        `\n`,
        `dataset = dataset.map(formatting_prompts_func, batched=True)\n`,
      ],
      outputs: [],
      execution_count: null,
    },
    {
      cell_type: "code",
      metadata: {},
      source: [
        `from trl import SFTTrainer\n`,
        `from transformers import TrainingArguments\n`,
        `from unsloth import is_bfloat16_supported\n`,
        `\n`,
        `trainer = SFTTrainer(\n`,
        `    model = model,\n`,
        `    tokenizer = tokenizer,\n`,
        `    train_dataset = dataset,\n`,
        `    dataset_text_field = "text",\n`,
        `    max_seq_length = max_seq_length,\n`,
        `    dataset_num_proc = 2,\n`,
        `    packing = False,\n`,
        `    args = TrainingArguments(\n`,
        `        per_device_train_batch_size = 2,\n`,
        `        gradient_accumulation_steps = 4,\n`,
        `        warmup_steps = 5,\n`,
        `        num_train_epochs = ${Math.min(Math.max(epochs, 1), 5)},\n`,
        `        learning_rate = ${learningRate},\n`,
        `        fp16 = not is_bfloat16_supported(),\n`,
        `        bf16 = is_bfloat16_supported(),\n`,
        `        logging_steps = 1,\n`,
        `        optim = "adamw_8bit",\n`,
        `        weight_decay = 0.01,\n`,
        `        lr_scheduler_type = "linear",\n`,
        `        seed = 3407,\n`,
        `        output_dir = "outputs",\n`,
        `        report_to = "none",\n`,
        `    ),\n`,
        `)\n`,
        `\n`,
        `trainer_stats = trainer.train()\n`,
        `print(trainer_stats)\n`,
      ],
      outputs: [],
      execution_count: null,
    },
    {
      cell_type: "code",
      metadata: {},
      source: [
        `# Save LoRA adapter locally (download from Colab file browser)\n`,
        `model.save_pretrained("lora_model")\n`,
        `tokenizer.save_pretrained("lora_model")\n`,
        `print("Saved to ./lora_model — download this folder from the Colab file sidebar")\n`,
        `\n`,
        `# Optional: push to Hugging Face Hub (uncomment & add your token)\n`,
        `# from google.colab import userdata\n`,
        `# model.push_to_hub("your-username/easyfinetune-adapter", token=userdata.get("HF_TOKEN"))\n`,
        `# tokenizer.push_to_hub("your-username/easyfinetune-adapter", token=userdata.get("HF_TOKEN"))\n`,
      ],
      outputs: [],
      execution_count: null,
    },
    {
      cell_type: "markdown",
      metadata: {},
      source: [
        `## Done!\n`,
        `\n`,
        `- Open the left **Files** panel in Colab\n`,
        `- Download the \`lora_model\` folder\n`,
        `- Use it with the base model via PEFT / Unsloth / Ollama (after converting)\n`,
      ],
    },
  ];

  const notebook = {
    nbformat: 4,
    nbformat_minor: 5,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3",
      },
      language_info: {
        name: "python",
        version: "3.10.0",
      },
      accelerator: "GPU",
    },
    cells,
  };

  return JSON.stringify(notebook, null, 2);
}
