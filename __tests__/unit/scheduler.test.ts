import cron from 'node-cron';
import { EndpointModel } from '../../src/api/endpoints/endpoint.model';
import { healthCheckJobsQueue } from '../../src/jobs/queue';
import { startScheduler } from '../../src/jobs/scheduler';

// Mock das dependências externas
jest.mock('node-cron');
jest.mock('../../src/api/endpoints/endpoint.model');
jest.mock('../../src/jobs/queue', () => ({
    healthCheckJobsQueue: {
        add: jest.fn(),
    },
}));

describe('Scheduler', () => {
    let cronCallback: () => Promise<void>;

    beforeAll(() => {
        // Captura o callback passado para cron.schedule
        (cron.schedule as jest.Mock).mockImplementation((pattern, callback) => {
            cronCallback = callback;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should schedule a job and execute it', async () => {
        const mockEndpoints = [
            { id: '1', url: 'http://test1.com' },
            { id: '2', url: 'http://test2.com' },
        ];

        // Configura o mock do Model
        (EndpointModel.find as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            cursor: jest.fn().mockReturnValue(mockEndpoints),
        });

        // Inicia o agendador para registrar o callback
        startScheduler();

        // Executa o callback do cron manualmente
        await cronCallback();

        // Verifica se a busca no banco foi feita
        expect(EndpointModel.find).toHaveBeenCalled();

        // Verifica se os jobs foram adicionados à fila
        expect(healthCheckJobsQueue.add).toHaveBeenCalledTimes(2);
        expect(healthCheckJobsQueue.add).toHaveBeenCalledWith('check', {
            url: 'http://test1.com',
            endpointId: '1',
        });
        expect(healthCheckJobsQueue.add).toHaveBeenCalledWith('check', {
            url: 'http://test2.com',
            endpointId: '2',
        });
    });

    it('should handle the case with no endpoints', async () => {
        // Configura o mock para não retornar endpoints
        (EndpointModel.find as jest.Mock).mockReturnValue({
            select: jest.fn().mockReturnThis(),
            cursor: jest.fn().mockReturnValue([]),
        });

        startScheduler();
        await cronCallback();

        expect(EndpointModel.find).toHaveBeenCalled();
        expect(healthCheckJobsQueue.add).not.toHaveBeenCalled();
    });
});
