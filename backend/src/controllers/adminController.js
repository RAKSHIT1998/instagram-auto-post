import User from "../models/User.js";
import PlatformPost from "../models/PlatformPost.js";

function ensureAdmin(req, res) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }

  return true;
}

export async function getMRR(req, res, next) {
  try {
    if (!ensureAdmin(req, res)) return;

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

export async function getAdminOverview(req, res, next) {
  try {
    if (!ensureAdmin(req, res)) return;

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
