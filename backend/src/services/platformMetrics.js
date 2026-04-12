export async function fetchMetrics(post) {
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
