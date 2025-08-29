import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../../src/app';
import { schedulerQueue, healthCheckJobsQueue } from '../../src/jobs/queue';
import { startSchedulerWorker } from '../../src/jobs/scheduler.worker';
import { Worker, Job } from 'bullmq';

// Mock parcial para controlar o worker do agendador
jest.mock('../../src/jobs/scheduler.worker', () => ({
    ...jest.requireActual('../../src/jobs/scheduler.worker'),
    startSchedulerWorker: jest.fn(),
}));

describe('Jobs Integration Test', () => {
    let mongoServer: MongoMemoryServer;
    let schedulerWorker: Worker; // Manter referência para o worker real

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        // Inicia um worker real para o teste de integração
        // mas usamos a implementação original, não a mockada
        const originalScheduler = jest.requireActual('../../src/jobs/scheduler.worker');
        schedulerWorker = originalScheduler.startSchedulerWorker();
    });

    beforeEach(async () => {
        // Limpa as filas e o banco de dados
        await Promise.all([
            healthCheckJobsQueue.drain(),
            healthCheckJobsQueue.clean(0, 'wait'),
            schedulerQueue.drain(),
            schedulerQueue.clean(0, 'wait'),
        ]);
        await mongoose.connection.db.collection('endpoints').deleteMany({});
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        await healthCheckJobsQueue.close();
        await schedulerQueue.close();
        await schedulerWorker.close();
    });

    it('should queue a health check job when the scheduler runs', async () => {
        // 1. Criar um endpoint via API
        const endpointData = { name: 'Google', url: 'https://google.com' };
        const response = await request(app)
            .post('/api/endpoints')
            .send(endpointData)
            .expect(201);
        const endpointId = response.body._id;

        // 2. Adicionar um job à fila do agendador para ser processado pelo worker
        const job = await schedulerQueue.add('run-health-checks', {});

        // 3. Esperar um tempo para o worker processar o job
        // Idealmente, usaríamos um mecanismo mais determinístico, mas para este teste, um timeout é suficiente
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Verificar se o job de health check foi adicionado à fila correta
        const jobs = await healthCheckJobsQueue.getJobs(['waiting', 'active']);
        const checkJobs = jobs.filter(j => j.name === 'check');

        expect(checkJobs).toHaveLength(1);
        expect(checkJobs[0].data.url).toBe(endpointData.url);
        expect(checkJobs[0].data.endpointId).toBe(endpointId);
    });
});
