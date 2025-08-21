import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import cron from 'node-cron';
import app from '../../src/app';
import { startScheduler } from '../../src/jobs/scheduler';
import { healthCheckJobsQueue } from '../../src/jobs/queue';

// Mock de node-cron para controle manual
jest.mock('node-cron');

describe('Jobs Integration Test', () => {
    let mongoServer: MongoMemoryServer;
    let cronCallback: () => Promise<void>;

    // 1. Inicia o banco de dados em memória antes de todos os testes
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        // Captura o callback do cron para disparo manual
        (cron.schedule as jest.Mock).mockImplementation((pattern, callback) => {
            cronCallback = callback;
        });
    });

    // 2. Limpa a fila e o banco antes de cada teste
    beforeEach(async () => {
        // Limpa a fila de jobs
        await healthCheckJobsQueue.drain();
        // Limpa a coleção de endpoints
        if (mongoose.connection.db) {
            const collections = await mongoose.connection.db.collections();
            for (let collection of collections) {
                await collection.deleteMany({});
            }
        }
    });

    // 3. Para o servidor e a conexão após todos os testes
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
        await healthCheckJobsQueue.close();
    });

    it('should create an endpoint via API and have the scheduler queue a job for it', async () => {
        // Etapa 1: Criar um novo endpoint usando a API
        const endpointData = { name: 'Google', url: 'https://google.com' };
        const response = await request(app)
            .post('/api/endpoints')
            .send(endpointData)
            .expect(201);

        expect(response.body.name).toBe(endpointData.name);
        const endpointId = response.body._id;

        // Etapa 2: Iniciar o agendador (que registra o callback mockado)
        startScheduler();

        // Etapa 3: Disparar manualmente a rotina do cron
        await cronCallback();

        // Etapa 4: Verificar se o job correto foi adicionado à fila
        const jobs = await healthCheckJobsQueue.getJobs(['waiting', 'active']);
        expect(jobs).toHaveLength(1);
        expect(jobs[0].name).toBe('check');
        expect(jobs[0].data.url).toBe(endpointData.url);
        expect(jobs[0].data.endpointId).toBe(endpointId);
    });
});
1