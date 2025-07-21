import dotenv from 'dotenv'
dotenv.config();

export const config = {
    redis: {
        host: process.env.REDIS_ROST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    queues: {
        healthCheckJobs: 'health-check-jobs',
        healthCheckResults: 'health-check-results',
    },
    apiPort: parseInt(process.env.API_PORT || '5000', 10),
    databeseUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/health-check-db',
    apiSecret: process.env.API_KEY 
};