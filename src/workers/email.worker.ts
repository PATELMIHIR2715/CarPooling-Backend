import { Worker } from "bullmq";
import { emailQueueConnection } from "../config/queue.js";
import { EMAIL_QUEUE_NAME } from "../constants/labels.js";
import {
  EMAIL_JOB_COMPLETED,
  EMAIL_JOB_COMPLETED_FOR,
  EMAIL_JOB_FAILED,
  EMAIL_WORKER_STARTED,
} from "../constants/messages.js";
import { processEmailJob } from "../utils/emailJobHandler.utils.js";

export const startEmailWorker = () => {
  const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { data } = job;

      await processEmailJob(job.name, data);
      console.log(`${EMAIL_JOB_COMPLETED_FOR} ${job.name}: ${data.to}`);
    },
    { connection: emailQueueConnection }
  );

  worker.on("completed", (job) => {
    console.log(`${EMAIL_JOB_COMPLETED}: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`${EMAIL_JOB_FAILED}: ${job?.id}: ${err.message}`);
  });

  worker.on("error", (err) => {
    console.error(`${EMAIL_JOB_FAILED}: worker: ${err.message}`);
  });

  console.log(EMAIL_WORKER_STARTED);

  return worker;
};
