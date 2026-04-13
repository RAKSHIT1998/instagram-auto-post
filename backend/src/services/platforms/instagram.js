import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToInstagram({ content, mediaUrl, credentials = {} }) {
  const accessToken = credentials.accessToken || env.IG_ACCESS_TOKEN;
  const igUserId = credentials.metadata?.igUserId || credentials.metadata?.userId || env.IG_USER_ID;

  if (!accessToken || !igUserId) {
    return { externalPostId: `ig_mock_${Date.now()}`, mocked: true };
  }

  const base = `https://graph.facebook.com/${env.META_API_VERSION}`;

  const { data: container } = await axios.post(
    `${base}/${igUserId}/media`,
    null,
    {
      params: {
        image_url: mediaUrl,
        caption: content,
        access_token: accessToken
      },
      timeout: 30000
    }
  );

  const { data: published } = await axios.post(
    `${base}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id: container.id,
        access_token: accessToken
      },
      timeout: 30000
    }
  );

  return { externalPostId: published.id, mocked: false };
}
