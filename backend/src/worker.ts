import { Queue, Worker } from "bullmq";
import { ScoringService } from "./services/scoring.service";

console.log('👷 Worker Service starting...');

/**
 * WORKER INVARIANTS:
 * 1. Worker is the ONLY place that modifies Scoring/Value.
 * 2. Worker updates are Eventual Consistency (5-60 mins).
 * 3. Worker logic derives value, it does not invent it (Source of Truth is User Interactions).
 */

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
};

const queue = new Queue("knowledge-queue", { connection });
// Note: QueueScheduler is deprecated/removed in BullMQ v5. 
// Delayed jobs are now handled automatically by the Queue/Worker.

const worker = new Worker("knowledge-queue", async (job) => {
    console.log(`Processing job ${job.id}:`, job.name, job.data);

    switch (job.name) {
        case "recalc-article-scores":
            return ScoringService.recalcArticleScores(200, job.data?.articleId);
        case "recalc-tier-pool":
            return ScoringService.recalcTierPool();
        case "recalc-user-scores":
            return ScoringService.recalcUserScores(200, job.data?.userId);
        default:
            console.warn(`Unknown job: ${job.name}`);
            return null;
    }
}, { connection });

async function scheduleJobs() {
    await queue.add("recalc-article-scores", {}, {
        repeat: { every: 5 * 60 * 1000 }, // WARNING: Minimum 5 minutes. Do not lower to "realtime" or DB will choke.
        jobId: "recalc-article-scores"
    });

    await queue.add("recalc-tier-pool", {}, {
        repeat: { every: 10 * 60 * 1000 },
        jobId: "recalc-tier-pool"
    });

    await queue.add("recalc-user-scores", {}, {
        repeat: { every: 60 * 60 * 1000 },
        jobId: "recalc-user-scores"
    });
}

scheduleJobs().catch((error) => {
    console.error("Failed to schedule scoring jobs", error);
});

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

// Keep process alive
process.on("SIGTERM", async () => {
    console.log("Worker is shutting down...");
    await worker.close();
    await queue.close();
    // Scheduler is intrinsic in v5
    process.exit(0);
});
