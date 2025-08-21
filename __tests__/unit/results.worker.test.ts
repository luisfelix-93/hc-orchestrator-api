import { Worker } from 'bullmq';
import { HealthCheckLogModel } from '../../src/api/logs/logs.models';
import { startResultsWorker } from '../../src/jobs/results.worker';

// Mock das dependências
jest.mock('bullmq');
jest.mock('../../src/api/logs/logs.models');

describe('Results Worker', () => {
    let workerProcessor: (job: { data: any; }) => Promise<void>;

    beforeAll(() => {
        // Mock da implementação do Worker para capturar o processador
        (Worker as jest.Mock).mockImplementation((queueName, processor) => {
            workerProcessor = processor;
            return { // Retorna um objeto worker mockado se necessário
                on: jest.fn(),
                close: jest.fn(),
            };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should process a job and save the log to the database', async () => {
        const mockJob = {
            data: {
                status: 'Online',
                statusCode: 200,
                responseTimeInMs: 123,
                endpointId: 'endpoint-123',
            },
        };

        // Inicia o worker para que o processador seja registrado
        startResultsWorker();

        // Executa o processador com o job mockado
        await workerProcessor(mockJob);

        // Verifica se o método de criação de log foi chamado com os dados corretos
        expect(HealthCheckLogModel.create).toHaveBeenCalledTimes(1);
        expect(HealthCheckLogModel.create).toHaveBeenCalledWith({
            status: 'Online',
            statusCode: 200,
            responseTimeInMs: 123,
            endpointId: 'endpoint-123',
        });
    });

    it('should handle errors during log creation', async () => {
        const mockJob = {
            data: { status: 'Offline', endpointId: 'error-id' },
        };
        const dbError = new Error('Database connection failed');

        // Configura o mock para rejeitar a promessa
        (HealthCheckLogModel.create as jest.Mock).mockRejectedValue(dbError);

        startResultsWorker();

        // O teste espera que o processador lide com o erro internamente (com console.error)
        // e não lance uma exceção que falhe o teste.
        await expect(workerProcessor(mockJob)).resolves.not.toThrow();

        expect(HealthCheckLogModel.create).toHaveBeenCalledTimes(1);
    });
});
