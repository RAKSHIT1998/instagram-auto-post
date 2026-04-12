import { z } from "zod";
import WaitlistLead from "../models/WaitlistLead.js";

const joinSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  niche: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional()
});

export async function joinWaitlist(req, res, next) {
  try {
    const body = joinSchema.parse(req.body);

    const lead = await WaitlistLead.findOneAndUpdate(
      { email: body.email.toLowerCase() },
      {
        $set: {
          name: body.name,
          niche: body.niche,
          source: body.source || "landing",
          notes: body.notes
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, leadId: lead._id });
  } catch (error) {
    next(error);
  }
}
