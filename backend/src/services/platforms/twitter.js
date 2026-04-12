import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToTwitter({ content }) {
  if (!env.X_BEARER_TOKEN) {
    return { externalPostId: `x_mock_${Date.now()}`, mocked: true };
  }

  const { data } = await axios.post(
    `${env.X_API_BASE}/tweets`,
    { text: content },
    {
      headers: {
        Authorization: `Bearer ${env.X_BEARER_TOKEN}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  return { externalPostId: data?.data?.id || `x_${Date.now()}`, mocked: false };
}
