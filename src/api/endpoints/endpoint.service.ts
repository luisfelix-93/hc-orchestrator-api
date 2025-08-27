import { EndpointModel } from "./endpoint.model";
import redisClient from "../../lib/redis";
import { config } from "../../config";

const ENDPOINTS_CACHE_KEY = 'endpoints';

export async function getAllEndpoints() {
    const cachedEndpoints = await redisClient.get(ENDPOINTS_CACHE_KEY);
    if (cachedEndpoints) {
        console.log('[Service] Cache hit for endpoints.');
        return JSON.parse(cachedEndpoints);
    }

    console.log('[Service] Cache miss for endpoints. Fetching from database.');
    const endpoints = await EndpointModel.find();
    await redisClient.set(ENDPOINTS_CACHE_KEY, JSON.stringify(endpoints), {
        EX: config.redis.cacheTtl
    });
    return endpoints;
}

export async function create(name: string, url: string) {
    const newEndpoint = await EndpointModel.create({ name, url });
    await redisClient.del(ENDPOINTS_CACHE_KEY);
    return newEndpoint;
}

export async function deleteEndpoint(id: string) {
    const deletedEndpoint = await EndpointModel.findByIdAndDelete(id);
    await redisClient.del(ENDPOINTS_CACHE_KEY);
    return deletedEndpoint;

}

export async function getEndpointById(id: string) {
    console.log(`[Service] 2. Consultando o MongoDB por Endpoint ID: ${id}`);
    const result = await EndpointModel.findById(id);
    console.log(`[Service] 3. Consulta ao MongoDB por Endpoint finalizada.`);
    return result;
}