import { Worker } from 'bullmq';
import { config } from '../config';
import { HealthCheckLogModel } from '../api/logs/logs.models';
import mongoose from 'mongoose';

// Interface para o resultado do job
interface HealthCheckResult {
    url: string;
    status: 'Online' | 'Offline';
    statusCode: number | null;
    data?: any;
    responseTimeInMs: number;
    endpointId: string;
}

// Interface explícita para o objeto que vai para o buffer e para o insertMany
interface HealthCheckLogInsert {
    status: 'Online' | 'Offline';
    statusCode: number | null;
    data?: any;
    responseTimeInMs: number;
    endpointId: mongoose.Types.ObjectId;
}

let resultsBuffer: HealthCheckLogInsert[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

const FLUSH_INTERVAL = 10000; // 10 segundos
const BATCH_SIZE = 50; // Tamanho do lote

async function flushResults() {
    if (flushTimeout) {
        clearTimeout(flushTimeout);
        flushTimeout = null;
    }

    if (resultsBuffer.length === 0) {
        return;
    }

    const batch = resultsBuffer.splice(0, resultsBuffer.length);

    try {
        await HealthCheckLogModel.insertMany(batch);
        console.log(`✅ Lote de ${batch.length} logs salvo com sucesso.`);
    } catch (error) {
        console.error(`❌ Erro ao salvar lote de logs:`, error);
    }
}

function scheduleFlush() {
    if (!flushTimeout) {
        flushTimeout = setTimeout(flushResults, FLUSH_INTERVAL);
    }
}

export function startResultsWorker(): Worker<HealthCheckResult> {
    const connectionOpts = { host: config.redis.host, port: config.redis.port };
    console.log('👂 Ouvinte de resultados iniciado com buffer.');

    const worker = new Worker<HealthCheckResult>(config.queues.healthCheckResults,
        async (job) => {
            const result = job.data;
            console.log(`💾 Recebido resultado para endpoint ID ${result.endpointId}: ${result.status}`);

            resultsBuffer.push({
                status: result.status,
                statusCode: result.statusCode,
                data: result.data,
                responseTimeInMs: result.responseTimeInMs,
                endpointId: new mongoose.Types.ObjectId(result.endpointId),
            });

            if (resultsBuffer.length >= BATCH_SIZE) {
                await flushResults();
            } else {
                scheduleFlush();
            }
        },
        { connection: connectionOpts }
    );

    // Garante que o buffer seja limpo ao encerrar o worker
    worker.on('closing', flushResults);

    return worker;
}
