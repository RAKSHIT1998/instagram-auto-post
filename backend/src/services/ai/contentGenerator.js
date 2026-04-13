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
  const resolvedTopic = topic || idea || "Consistency beats motivation";
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
    try {
      if (!env.HF_FALLBACK_TEXT_MODEL) throw error;
      const fallback = await callHFModel(env.HF_FALLBACK_TEXT_MODEL, prompt);
      return normalizePlatformContent(fallback);
    } catch {
      return {
        idea_summary: `${resolvedTopic} adapted for all platforms`,
        instagram: {
          caption: `${resolvedTopic}. Discipline compounds when motivation fades. Save this and build daily momentum.`,
          hashtags: [
            "#fitness",
            "#discipline",
            "#growth",
            "#motivation",
            "#mindset",
            "#selfimprovement",
            "#consistency",
            "#habits",
            "#success",
            "#dailygrind"
          ]
        },
        facebook: {
          post: `A quick reminder: ${resolvedTopic}. You do not need to feel inspired every day. You need a system you trust. Start small, stay consistent, and let results speak.`
        },
        twitter: {
          tweet: `${resolvedTopic}. Motivation is temporary. Systems are forever. Show up daily, even when no one claps.`
        },
        linkedin: {
          post: `Leadership lesson: ${resolvedTopic}. High-performing teams do not depend on mood; they depend on repeatable habits and accountability.`
        },
        image_prompt:
          "Cinematic portrait of focused athlete in modern gym, dramatic rim lighting, high contrast, realistic skin detail, premium editorial look",
        reel: {
          hook: "Motivation ends. Discipline wins.",
          script:
            "You will not feel motivated every day. That is normal. Build a routine and follow it anyway. Small actions, repeated daily, create massive transformation.",
          scenes: [
            "Close-up of alarm at 5 AM, athlete waking up",
            "Fast cuts of workout reps and sweat",
            "Final transformation pose with bold subtitle: Discipline wins"
          ]
        }
      };
    }
  }
}
