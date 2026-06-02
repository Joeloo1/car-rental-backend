import { Worker, Job } from "bullmq";
import { sendEmail } from "../utils/email";
import { EmailJobData } from "../config/queue";
import logger from "../config/winston";

const connection = process.env.REDIS_URL ? { url: process.env.REDIS_URL } : undefined;

export const startEmailWorker = () => {
  if (!connection) {
    // Queue is also null in this case — emails are sent inline as fallback.
    logger.warn("Email worker: Redis unavailable, worker not started");
    return null;
  }

  const worker = new Worker<EmailJobData>(
    "luxedrive-email",
    async (job: Job<EmailJobData>) => {
      const { email, subject, html } = job.data;
      await sendEmail({ email, subject, html });
      logger.info(`Email delivered to ${email} (job ${job.id})`);
    },
    {
      connection,
      concurrency: 5, // process up to 5 emails simultaneously
    },
  );

  worker.on("failed", (job, err) => {
    logger.error(`Email job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
  });

  worker.on("error", (err) => {
    logger.error(`Email worker error: ${err.message}`);
  });

  logger.info("Email worker started");
  return worker;
};

// Helper used by services to enqueue or fall back to a direct send.
// This keeps call-sites clean — they never need to import sendEmail directly.
export const dispatchEmail = async (data: EmailJobData): Promise<void> => {
  const { emailQueue } = await import("../config/queue");

  if (emailQueue) {
    // Non-blocking: enqueue and return immediately
    await emailQueue.add("send", data);
  } else {
    // Redis unavailable — send synchronously so the email isn't lost
    await sendEmail(data);
  }
};
