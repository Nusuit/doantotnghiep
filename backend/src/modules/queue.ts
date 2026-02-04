import { Queue } from "bullmq";

let queue: Queue | null = null;

function getQueue() {
  if (queue) return queue;

  const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  };

  queue = new Queue("knowledge-queue", { connection });
  return queue;
}

import { redis } from "./redis";

export async function enqueueScoringJobs(params: { articleId?: number; userId?: number }) {
  const scoringQueue = getQueue();

  // DEBOUNCE LOGIC (5 mins)
  // Prevent spamming the queue for the same entity during viral spikes.
  // We allow the job to run once every 5 minutes per entity.
  const TTL = 300; // 5 minutes

  if (params.articleId) {
    const key = `debounce:score:article:${params.articleId}`;
    const acquired = await redis.set(key, "1", "EX", TTL, "NX");

    if (acquired === "OK") {
      await scoringQueue.add(
        "recalc-article-scores",
        { articleId: params.articleId },
        { jobId: `recalc-article:${params.articleId}`, removeOnComplete: true, removeOnFail: true }
      );
    }
  }

  if (params.userId) {
    const key = `debounce:score:user:${params.userId}`;
    const acquired = await redis.set(key, "1", "EX", TTL, "NX");

    if (acquired === "OK") {
      await scoringQueue.add(
        "recalc-user-scores",
        { userId: params.userId },
        { jobId: `recalc-user:${params.userId}`, removeOnComplete: true, removeOnFail: true }
      );
    }
  }

  // NOTE: Tier Pool recalc is heavy and global. 
  // We rely on the Periodic Worker (every 10m) for that, not triggering it on every interaction.
}
