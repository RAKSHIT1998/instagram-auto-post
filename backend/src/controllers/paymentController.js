import crypto from "node:crypto";
import Razorpay from "razorpay";
import { z } from "zod";
import { env } from "../config/env.js";
import User from "../models/User.js";

const createOrderSchema = z.object({
  plan: z.enum(["pro"])
});

const activateSchema = z.object({
  paymentId: z.string().min(4)
});

const webhookSchema = z.object({
  userId: z.string().min(6),
  amount: z.number().nonnegative(),
  plan: z.enum(["pro", "agency"]).default("pro")
});

function getRazorpayClient() {
  if (!env.RAZORPAY_KEY || !env.RAZORPAY_SECRET) return null;
  return new Razorpay({ key_id: env.RAZORPAY_KEY, key_secret: env.RAZORPAY_SECRET });
}

function verifyWebhookSignature(req) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return true;

  const incoming = req.headers["x-razorpay-signature"];
  const signature = Array.isArray(incoming) ? incoming[0] : incoming;
  if (!signature) return false;

  const rawPayload = req.rawBody || JSON.stringify(req.body || {});
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawPayload)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

export async function createSubscriptionOrder(req, res, next) {
  try {
    const { plan } = createOrderSchema.parse(req.body);
    const razorpay = getRazorpayClient();

    if (!razorpay) {
      return res.json({ mocked: true, amount: 99900, currency: "INR", plan });
    }

    const order = await razorpay.orders.create({
      amount: 99900,
      currency: "INR",
      receipt: `pro_${Date.now()}`,
      notes: {
        userId: req.user.sub,
        plan
      }
    });

    res.json(order);
  } catch (error) {
    next(error);
  }
}

export async function activateProPlan(req, res, next) {
  try {
    const body = activateSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      {
        plan: "pro",
        subscription: {
          status: "active",
          amount: 999,
          startedAt: new Date()
        },
        postsUsedThisMonth: 0,
        billingCycleStart: new Date(),
        lastPaymentId: body.paymentId
      },
      { new: true }
    ).select("name email plan postsUsedThisMonth billingCycleStart");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
}

export async function handleWebhook(req, res, next) {
  try {
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    const body = webhookSchema.parse(req.body);
    const user = await User.findById(body.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.subscription = {
      status: "active",
      amount: body.amount,
      startedAt: new Date()
    };
    user.plan = body.plan;
    user.postsUsedThisMonth = 0;
    user.billingCycleStart = new Date();

    await user.save();
    res.send("OK");
  } catch (error) {
    next(error);
  }
}
