import { Request, Response, NextFunction } from "express";
import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";
//import { sendMoodUpdateEvent } from "../utils/inngestEvents";

// Create a new mood entry
export const createMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { score, note, context, activities } = req.body;
    const userId = req.user?._id; // From auth middleware

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const mood = new Mood({
      userId,
      score,
      note,
      context,
      activities,
      timestamp: new Date(),
    });

    await mood.save();
    logger.info(`Mood entry created for user ${userId}`);

    // Send mood update event to Inngest
    // await sendMoodUpdateEvent({
    //   userId,
    //   mood: score,
    //   note,
    //   context,
    //   activities,
    //   timestamp: mood.timestamp,
    // });
const now = new Date();

// Start of today (00:00:00)
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

// End of today (23:59:59.999)
const endOfDay = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  23,
  59,
  59,
  999
);

    const moodsToday = await Mood.find({
  userId,
  timestamp: { $gte: startOfDay, $lte: endOfDay },
});

// Include the new score in average calculation
const total = moodsToday.reduce((acc, m) => acc + m.score, 0) + score;
const avgMoodScore = total / (moodsToday.length + 1);

res.status(201).json({ success: true, avgMoodScore });

  } catch (error) {
    next(error);
  }
};