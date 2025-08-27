import { Worker } from 'bullmq';
import { config } from '../config';
import * as endpointService from '../api/endpoints/endpoint.service';
import { healthCheckJobsQueue } from './queue';

export function startSchedulerWorker(): Worker {
    const connectionOpts = { host: config.redis.host, port: config.redis.port };

    const worker = new Worker(config.queues.schedulerQueue, async (job) => {
        console.log(`🗓️ Job de agendamento #${job.id} iniciado...`);
        try {
            const endpoints = await endpointService.getAllEndpoints();
            if (!endpoints || endpoints.length === 0) {
                console.log('Nenhum endpoint para verificar.');
                return;
            }

            const jobPromises = endpoints.map((endpoint: { url: any; _id: { toString: () => any; }; }) => {
                return healthCheckJobsQueue.add('check', {
                    url: endpoint.url,
                    endpointId: endpoint._id.toString(),
                });
            });

            await Promise.all(jobPromises);
            console.log(`✅ ${jobPromises.length} jobs de health check adicionados à fila.`);
        } catch (error) {
            console.error('❌ Erro no job de agendamento:', error);
            throw error;
        }
    }, { connection: connectionOpts });

    console.log('👷 Worker do Agendador iniciado.');
    return worker;
}
