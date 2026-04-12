import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToInstagram({ content, mediaUrl }) {
  if (!env.IG_ACCESS_TOKEN || !env.IG_USER_ID) {
    return { externalPostId: `ig_mock_${Date.now()}`, mocked: true };
  }

  const base = `https://graph.facebook.com/${env.META_API_VERSION}`;

  const { data: container } = await axios.post(
    `${base}/${env.IG_USER_ID}/media`,
    null,
    {
      params: {
        image_url: mediaUrl,
        caption: content,
        access_token: env.IG_ACCESS_TOKEN
      },
      timeout: 30000
    }
  );

  const { data: published } = await axios.post(
    `${base}/${env.IG_USER_ID}/media_publish`,
    null,
    {
      params: {
        creation_id: container.id,
        access_token: env.IG_ACCESS_TOKEN
      },
      timeout: 30000
    }
  );

  return { externalPostId: published.id, mocked: false };
}
