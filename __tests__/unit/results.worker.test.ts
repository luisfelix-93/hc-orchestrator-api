import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { HealthCheckLogModel } from '../../src/api/logs/logs.models';
import { startResultsWorker } from '../../src/jobs/results.worker';

// Mock das dependências
jest.mock('bullmq');
jest.mock('../../src/api/logs/logs.models');

// Usar timers falsos para controlar o setTimeout do buffer
jest.useFakeTimers();

describe('Results Worker with Buffering', () => {
    let workerProcessor: (job: { data: any; }) => Promise<void>;
    const BATCH_SIZE = 50; // Deve ser o mesmo valor do worker
    const FLUSH_INTERVAL = 10000; // Deve ser o mesmo valor do worker

    beforeAll(() => {
        (Worker as jest.Mock).mockImplementation((queueName, processor) => {
            workerProcessor = processor;
            return { on: jest.fn(), close: jest.fn() };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers(); // Limpa os timers falsos
    });

    it('should add results to buffer and flush when BATCH_SIZE is reached', async () => {
        startResultsWorker();

        const jobs = Array.from({ length: BATCH_SIZE }, (_, i) => ({
            data: {
                status: 'Online',
                statusCode: 200,
                responseTimeInMs: 100 + i,
                endpointId: new mongoose.Types.ObjectId().toString(),
            },
        }));

        // Processa BATCH_SIZE - 1 jobs, o buffer não deve ser esvaziado
        for (let i = 0; i < BATCH_SIZE - 1; i++) {
            await workerProcessor(jobs[i]);
        }
        expect(HealthCheckLogModel.insertMany).not.toHaveBeenCalled();

        // Processa o último job, o que deve disparar o flush
        await workerProcessor(jobs[BATCH_SIZE - 1]);

        expect(HealthCheckLogModel.insertMany).toHaveBeenCalledTimes(1);
        expect(HealthCheckLogModel.insertMany).toHaveBeenCalledWith(expect.any(Array));
        const insertedDocs = (HealthCheckLogModel.insertMany as jest.Mock).mock.calls[0][0];
        expect(insertedDocs.length).toBe(BATCH_SIZE);
    });

    it('should flush the buffer when FLUSH_INTERVAL is reached', async () => {
        startResultsWorker();

        const job = {
            data: {
                status: 'Offline',
                statusCode: 500,
                responseTimeInMs: 50,
                endpointId: new mongoose.Types.ObjectId().toString(),
            },
        };

        await workerProcessor(job);

        // O buffer ainda não foi esvaziado
        expect(HealthCheckLogModel.insertMany).not.toHaveBeenCalled();

        // Avança o tempo para disparar o setTimeout
        jest.advanceTimersByTime(FLUSH_INTERVAL);

        // Agora o buffer deve ter sido esvaziado
        expect(HealthCheckLogModel.insertMany).toHaveBeenCalledTimes(1);
        const insertedDocs = (HealthCheckLogModel.insertMany as jest.Mock).mock.calls[0][0];
        expect(insertedDocs.length).toBe(1);
        expect(insertedDocs[0].status).toBe('Offline');
    });

    it('should handle errors during insertMany and not crash', async () => {
        const dbError = new Error('DB write error');
        (HealthCheckLogModel.insertMany as jest.Mock).mockRejectedValue(dbError);

        startResultsWorker();

        const job = { data: { status: 'Online', endpointId: new mongoose.Types.ObjectId().toString() } };
        await workerProcessor(job);

        // Força o flush avançando o tempo
        // O teste espera que o erro seja capturado e logado, sem que o worker quebre
        jest.advanceTimersByTime(FLUSH_INTERVAL);

        expect(HealthCheckLogModel.insertMany).toHaveBeenCalledTimes(1);
    });
});
