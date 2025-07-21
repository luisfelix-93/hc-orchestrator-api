import { Queue } from "bullmq";
import { config } from "../config";

const connectionOpts = {
    host: config.redis.host,
    port: config.redis.port
};

export const healthCheckJobsQueue = new Queue(config.queues.healthCheckJobs, {
    connection: connectionOpts
});
