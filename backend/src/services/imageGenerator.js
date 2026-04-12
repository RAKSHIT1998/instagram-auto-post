import axios from "axios";
import { env } from "../config/env.js";

export async function generateImageFromIdea({ idea, niche }) {
  const model = env.HF_IMAGE_MODEL;
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const prompt = `${niche} social media visual, ${idea}, cinematic lighting, high quality`;

  const headers = {
    "Content-Type": "application/json"
  };

  if (env.HF_API_KEY) {
    headers.Authorization = `Bearer ${env.HF_API_KEY}`;
  }

  try {
    const { data } = await axios.post(
      url,
      { inputs: prompt },
      { headers, responseType: "arraybuffer", timeout: 120000 }
    );

    const base64 = Buffer.from(data).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}
