import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToFacebook({ content, mediaUrl, credentials = {} }) {
  const accessToken = credentials.accessToken || env.FB_ACCESS_TOKEN;
  const pageId = credentials.metadata?.pageId || credentials.metadata?.fbPageId || env.FB_PAGE_ID;

  if (!accessToken || !pageId) {
    return { externalPostId: `fb_mock_${Date.now()}`, mocked: true };
  }

  const base = `https://graph.facebook.com/${env.META_API_VERSION}`;

  const { data } = await axios.post(`${base}/${pageId}/photos`, null, {
    params: {
      url: mediaUrl,
      caption: content,
      access_token: accessToken
    },
    timeout: 30000
  });

  return { externalPostId: data.post_id || data.id, mocked: false };
}
