import { Worker } from 'bullmq';
import { config } from '../config';
import { HealthCheckLogModel } from '../api/logs/logs.models';


// A estrutura do resultado que esperamos do Worker
interface HealthCheckResult {
    url: string;
    status: 'Online' | 'Offline';
    statusCode: number | null;
    responseTimeInMs: number;
    endpointId: string; // Precisamos do ID para salvar corretamente
}

export function startResultsWorker(): Worker<HealthCheckResult> {
    const connectionOpts = { host: config.redis.host, port: config.redis.port };
    console.log('👂 Ouvinte de resultados iniciado.');

    const worker = new Worker<HealthCheckResult>(config.queues.healthCheckResults,
        async (job) => {
            const result = job.data;
            console.log(`💾 Recebido resultado para endpoint ID ${result.endpointId}: ${result.status}`);
            try {
                await HealthCheckLogModel.create({
                    status: result.status,  
                    statusCode: result.statusCode,
                    responseTimeInMs: result.responseTimeInMs,
                    endpointId: result.endpointId, // Associa o log ao endpoint
                });
                console.log(`✅ Log para endpoint ID ${result.endpointId} salvo com sucesso.`);
            } catch (error) {
                console.error(`❌ Erro ao salvar log para endpoint ID ${result.endpointId}:`, error);
            }
            // Salva o log no banco de dados, associado ao endpoint correto

        },
        { connection: connectionOpts }
    );

    return worker;
}