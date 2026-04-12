function extractJsonObject(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const first = rawText.indexOf("{");
    const last = rawText.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const sliced = rawText.slice(first, last + 1);
      return JSON.parse(sliced);
    }
    throw new Error("Model response is not valid JSON");
  }
}

function normalizeHashtags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t.replace(/\s+/g, "")}`))
    .slice(0, 10);
}

export function normalizePlatformContent(rawText) {
  const parsed = extractJsonObject(rawText);

  return {
    idea_summary: parsed?.idea_summary || "",
    instagram: {
      caption: parsed?.instagram?.caption || "",
      hashtags: normalizeHashtags(parsed?.instagram?.hashtags)
    },
    facebook: {
      post: parsed?.facebook?.post || ""
    },
    twitter: {
      tweet: parsed?.twitter?.tweet || ""
    },
    linkedin: {
      post: parsed?.linkedin?.post || ""
    },
    image_prompt: parsed?.image_prompt || "",
    reel: {
      script: parsed?.reel?.script || "",
      hook: parsed?.reel?.hook || "",
      scenes: Array.isArray(parsed?.reel?.scenes)
        ? parsed.reel.scenes.map((s) => String(s).trim()).filter(Boolean).slice(0, 8)
        : []
    }
  };
}
