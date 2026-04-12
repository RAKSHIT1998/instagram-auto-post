import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToLinkedIn({ content }) {
  if (!env.LINKEDIN_ACCESS_TOKEN || !env.LINKEDIN_AUTHOR_URN) {
    return { externalPostId: `li_mock_${Date.now()}`, mocked: true };
  }

  const { data } = await axios.post(
    `${env.LINKEDIN_API_BASE}/ugcPosts`,
    {
      author: env.LINKEDIN_AUTHOR_URN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE"
        }
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    },
    {
      headers: {
        Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      timeout: 30000
    }
  );

  return { externalPostId: data?.id || `li_${Date.now()}`, mocked: false };
}
