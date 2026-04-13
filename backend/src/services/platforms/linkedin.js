import axios from "axios";
import { env } from "../../config/env.js";

export async function publishToLinkedIn({ content, credentials = {} }) {
  const accessToken = credentials.accessToken || env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn =
    credentials.metadata?.authorUrn ||
    credentials.metadata?.linkedinAuthorUrn ||
    env.LINKEDIN_AUTHOR_URN;

  if (!accessToken || !authorUrn) {
    return { externalPostId: `li_mock_${Date.now()}`, mocked: true };
  }

  const { data } = await axios.post(
    `${env.LINKEDIN_API_BASE}/ugcPosts`,
    {
      author: authorUrn,
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
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0"
      },
      timeout: 30000
    }
  );

  return { externalPostId: data?.id || `li_${Date.now()}`, mocked: false };
}
