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

function getRazorpayClient() {
  if (!env.RAZORPAY_KEY || !env.RAZORPAY_SECRET) return null;
  return new Razorpay({ key_id: env.RAZORPAY_KEY, key_secret: env.RAZORPAY_SECRET });
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
