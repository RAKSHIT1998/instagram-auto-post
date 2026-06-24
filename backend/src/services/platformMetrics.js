import axios from "axios";
import { env } from "../config/env.js";
import { getUserPlatformCredentials } from "./platformCredentials.js";
import { ensureFreshCredentials } from "./tokenRefresh.js";

async function fetchTwitterMetrics({ externalPostId, userId }) {
  const credentials = await getUserPlatformCredentials(userId, "twitter");
  if (!credentials?.accessToken) return null;

  const fresh = await ensureFreshCredentials("twitter", credentials, userId);
  const bearerToken = fresh.accessToken || env.X_BEARER_TOKEN;
  if (!bearerToken) return null;

  const { data } = await axios.get(`${env.X_API_BASE}/tweets/${externalPostId}`, {
    params: { "tweet.fields": "public_metrics" },
    headers: { Authorization: `Bearer ${bearerToken}` },
    timeout: 15000
  });

  const metrics = data?.data?.public_metrics;
  if (!metrics) return null;

  return {
    likes: metrics.like_count || 0,
    comments: metrics.reply_count || 0,
    shares: metrics.quote_count || 0,
    retweets: metrics.retweet_count || 0,
    impressions: metrics.impression_count || 0,
    saves: 0,
    clicks: 0
  };
}

const FETCHERS = {
  twitter: fetchTwitterMetrics
};

function storedFallback(post) {
  return {
    likes: post.metrics?.likes || 0,
    comments: post.metrics?.comments || 0,
    shares: post.metrics?.shares || 0,
    saves: post.metrics?.saves || 0,
    impressions: post.metrics?.impressions || 0,
    clicks: post.metrics?.clicks || 0,
    retweets: post.metrics?.retweets || 0
  };
}

export async function fetchMetrics(post, userId) {
  const fallback = storedFallback(post);
  const fetcher = FETCHERS[post.platform];
  if (!fetcher || !post.externalPostId || !userId) return fallback;

  try {
    const real = await fetcher({ externalPostId: post.externalPostId, userId });
    return real || fallback;
  } catch {
    return fallback;
  }
}
