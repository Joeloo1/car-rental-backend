import { Queue } from "bullmq";
import logger from "./winston";

export type EmailJobData = {
  email: string;
  subject: string;
  html: string;
};

// BullMQ manages its own ioredis connection internally; we only pass the URL.
const connection = process.env.REDIS_URL ? { url: process.env.REDIS_URL } : undefined;

const defaultJobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 },
  removeOnComplete: 100,
  removeOnFail: 200,
};
export const emailQueue: Queue<EmailJobData> | null = connection
  ? new Queue<EmailJobData>("luxedrive:email", {
      connection,
      defaultJobOptions: defaultJobOptions,
      // defaultJobOptions: {
      //   attempts: 3,
      //   backoff: { type: "exponential", delay: 5000 },
      //   removeOnComplete: 100,
      //   removeOnFail: 200,
      // },
    })
  : null;

if (!emailQueue) {
  logger.warn("Email queue: REDIS_URL not set — emails will be sent synchronously");
}
