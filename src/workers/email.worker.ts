import { Worker, UnrecoverableError } from "bullmq";
import { emailQueueConnection } from "../config/queue.js";
import { EMAIL_QUEUE_NAME } from "../constants/labels.js";
import {
  EMAIL_JOB_COMPLETED,
  EMAIL_JOB_COMPLETED_FOR,
  EMAIL_JOB_FAILED,
  EMAIL_WORKER_STARTED,
} from "../constants/messages.js";
import { processEmailJob } from "../utils/emailJobHandler.utils.js";
import {
  isUpstashLimitError,
  tripCircuit,
  isDirectEmailModeEnabled,
} from "../utils/redisCircuitBreaker.utils.js";

export const startEmailWorker = () => {
  // If direct mode is forced or email queue is disabled via env, do not start worker
  if (isDirectEmailModeEnabled()) {
    console.log(
      "[EmailWorker] Queue worker disabled via configuration (direct SMTP delivery active). Zero Redis commands used."
    );
    return null;
  }

  let isWorkerPaused = false;

  const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { data } = job;

      try {
        await processEmailJob(job.name, data);
        console.log(`${EMAIL_JOB_COMPLETED_FOR} ${job.name}: ${data.to}`);
      } catch (err: any) {
        if (isUpstashLimitError(err)) {
          tripCircuit("Upstash Redis command quota exceeded during job execution");

          // Directly send the email via Nodemailer SMTP fallback so it is not lost
          try {
            await processEmailJob(job.name, data);
            console.log(
              `[EmailWorker Fallback] Direct SMTP delivery succeeded for ${job.name} to ${data.to}`
            );
          } catch (directErr) {
            console.error(
              `[EmailWorker Fallback] Direct SMTP delivery also failed:`,
              directErr
            );
          }

          // Mark unrecoverable to prevent BullMQ from hammering Redis with retries
          throw new UnrecoverableError(
            "Upstash Redis quota exceeded; job marked unrecoverable to prevent retry loops."
          );
        }
        throw err;
      }
    },
    {
      connection: emailQueueConnection,
      concurrency: 1,
      drainDelay: 30, // Wait 30 seconds when queue is empty to avoid rapid polling
      stalledInterval: 60000, // Check for stalled jobs every 60 seconds (default 30s)
      lockDuration: 60000,
    }
  );

  worker.on("completed", (job) => {
    console.log(`${EMAIL_JOB_COMPLETED}: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`${EMAIL_JOB_FAILED}: ${job?.id}: ${err.message}`);
  });

  worker.on("error", async (err: any) => {
    if (isUpstashLimitError(err)) {
      tripCircuit("Upstash Redis request limit exceeded in worker connection");

      if (!isWorkerPaused) {
        isWorkerPaused = true;
        console.error(
          `[EmailWorker Circuit Breaker] ERR max requests limit exceeded. Pausing BullMQ worker to halt Redis command polling.`
        );

        try {
          await worker.pause(true);
        } catch (pauseErr) {
          // Worker connection may already be failing commands
        }

        // Schedule check to resume worker polling after a 15-minute cooldown
        setTimeout(async () => {
          try {
            if (!isDirectEmailModeEnabled()) {
              console.log("[EmailWorker] Cooldown expired. Resuming BullMQ worker polling...");
              await worker.resume();
              isWorkerPaused = false;
            }
          } catch (resumeErr) {
            console.warn("[EmailWorker] Worker resume failed:", resumeErr);
          }
        }, 15 * 60 * 1000);
      }
      return;
    }

    console.error(`${EMAIL_JOB_FAILED}: worker: ${err.message}`);
  });

  console.log(EMAIL_WORKER_STARTED);

  return worker;
};
