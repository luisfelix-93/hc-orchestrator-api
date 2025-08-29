import { createClient } from 'redis';
import { config } from '../config';

const redisClient = createClient({
    url: `redis://${config.redis.host}:${config.redis.port}`
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect();

export default redisClient;