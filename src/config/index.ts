import dotenv from 'dotenv'
dotenv.config();


export const config = {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6378', 10),
        cacheTtl: parseInt(process.env.REDIS_CACHE_TTL || '300', 10), // 5 minutes
    },
    queues: {
        healthCheckJobs: 'health-check-jobs',
        healthCheckResults: 'health-check-results',
        schedulerQueue: 'scheduler-queue',
    },
    apiPort: parseInt(process.env.API_PORT || '5000', 10),
    cronSchedule: process.env.CRON_SCHEDULE || '*/1 * * * *',
    databaseUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/health-check-db',
    apiSecret: process.env.API_KEY
};