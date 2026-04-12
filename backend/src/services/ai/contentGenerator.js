import axios from "axios";
import { env } from "../../config/env.js";
import { buildMultiPlatformPrompt } from "../../utils/promptBuilder.js";
import { normalizePlatformContent } from "./formatter.js";

async function callHFModel(model, prompt) {
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const headers = {
    "Content-Type": "application/json"
  };

  if (env.HF_API_KEY) {
    headers.Authorization = `Bearer ${env.HF_API_KEY}`;
  }

  const { data } = await axios.post(
    url,
    {
      inputs: prompt,
      parameters: {
        max_new_tokens: 700,
        temperature: 0.8,
        return_full_text: false
      }
    },
    { headers, timeout: 120000 }
  );

  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data?.generated_text) {
    return data.generated_text;
  }

  throw new Error("Unexpected model response format");
}

export async function generateMultiPlatformContent({
  topic,
  idea,
  niche,
  audience,
  tone = "motivational",
  goal,
  priority,
  top_posts
}) {
  const prompt = buildMultiPlatformPrompt({
    topic,
    idea,
    niche,
    audience,
    tone,
    goal,
    priority,
    top_posts
  });

  try {
    const primary = await callHFModel(env.HF_TEXT_MODEL, prompt);
    return normalizePlatformContent(primary);
  } catch (error) {
    if (!env.HF_FALLBACK_TEXT_MODEL) throw error;
    const fallback = await callHFModel(env.HF_FALLBACK_TEXT_MODEL, prompt);
    return normalizePlatformContent(fallback);
  }
}
