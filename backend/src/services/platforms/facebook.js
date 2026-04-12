import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToFacebook({ content, mediaUrl }) {
  if (!env.FB_ACCESS_TOKEN || !env.FB_PAGE_ID) {
    return { externalPostId: `fb_mock_${Date.now()}`, mocked: true };
  }

  const base = `https://graph.facebook.com/${env.META_API_VERSION}`;

  const { data } = await axios.post(`${base}/${env.FB_PAGE_ID}/photos`, null, {
    params: {
      url: mediaUrl,
      caption: content,
      access_token: env.FB_ACCESS_TOKEN
    },
    timeout: 30000
  });

  return { externalPostId: data.post_id || data.id, mocked: false };
}
