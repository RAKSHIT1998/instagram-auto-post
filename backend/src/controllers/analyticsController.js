import PlatformPost from "../models/PlatformPost.js";
import Analytics from "../models/Analytics.js";

function safeMetric(post, key) {
  return Number(post?.metrics?.[key] || 0);
}

export async function getAnalytics(_req, res, next) {
  try {
    const posts = await PlatformPost.find();

    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;

    posts.forEach((p) => {
      totalLikes += safeMetric(p, "likes");
      totalComments += safeMetric(p, "comments");
      totalShares += safeMetric(p, "shares");
    });

    res.json({
      totalLikes,
      totalComments,
      totalShares
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalyticsOverview(_req, res, next) {
  try {
    const [posts, topPosts] = await Promise.all([
      PlatformPost.find().sort({ createdAt: -1 }).limit(2000),
      Analytics.find().sort({ score: -1 }).limit(5).populate("platformPostId")
    ]);

    const totals = {
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0
    };

    const platformEngagement = {
      instagram: 0,
      facebook: 0,
      twitter: 0,
      linkedin: 0
    };

    const postsPerDayMap = {};

    for (const post of posts) {
      const likes = safeMetric(post, "likes");
      const comments = safeMetric(post, "comments");
      const shares = safeMetric(post, "shares");
      const saves = safeMetric(post, "saves");

      totals.likes += likes;
      totals.comments += comments;
      totals.shares += shares;
      totals.saves += saves;

      const score = likes + comments * 2 + shares * 3 + saves * 2;
      platformEngagement[post.platform] = (platformEngagement[post.platform] || 0) + score;

      const day = new Date(post.createdAt).toISOString().slice(0, 10);
      postsPerDayMap[day] = (postsPerDayMap[day] || 0) + 1;
    }

    const postsPerDay = Object.entries(postsPerDayMap)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-14)
      .map(([date, count]) => ({ date, count }));

    res.json({
      totals,
      postsPerDay,
      platformEngagement,
      topPerformingPosts: topPosts.map((t) => ({
        platform: t.platform,
        score: t.score,
        postId: t.platformPostId?._id,
        content: t.platformPostId?.content || ""
      }))
    });
  } catch (error) {
    next(error);
  }
}
