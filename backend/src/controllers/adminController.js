import User from "../models/User.js";
import PlatformPost from "../models/PlatformPost.js";

export async function getMRR(_req, res, next) {
  try {
    const users = await User.find({ "subscription.status": "active" });
    const mrr = users.reduce((sum, u) => sum + Number(u.subscription?.amount || 0), 0);

    res.json({
      mrr,
      activeUsers: users.length
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminOverview(_req, res, next) {
  try {
    const [activeSubs, totalUsers, postsToday, totalPosts] = await Promise.all([
      User.countDocuments({ "subscription.status": "active" }),
      User.countDocuments({}),
      PlatformPost.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      PlatformPost.countDocuments({})
    ]);

    res.json({
      activeSubscriptions: activeSubs,
      totalUsers,
      postsToday,
      totalPosts
    });
  } catch (error) {
    next(error);
  }
}
