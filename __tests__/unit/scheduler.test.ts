import { Worker } from 'bullmq';
import * as endpointService from '../../src/api/endpoints/endpoint.service';
import { healthCheckJobsQueue } from '../../src/jobs/queue';
import { startSchedulerWorker } from '../../src/jobs/scheduler.worker';

jest.mock('bullmq');
jest.mock('../../src/api/endpoints/endpoint.service');
jest.mock('../../src/jobs/queue', () => ({
    ...jest.requireActual('../../src/jobs/queue'), // Mantém implementações originais que não queremos mocar
    healthCheckJobsQueue: {
        add: jest.fn(),
    },
}));

const mockedEndpointService = endpointService as jest.Mocked<typeof endpointService>;


describe('Scheduler Worker', () => {
    let workerProcessor: (job: { id: string }) => Promise<void>;

    beforeAll(() => {
        (Worker as jest.Mock).mockImplementation((queueName, processor) => {
            workerProcessor = processor;
            return { on: jest.fn(), close: jest.fn() };
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch endpoints and add them to the health check queue', async () => {
        const mockEndpoints = [
            { _id: { toString: () => '1' }, url: 'http://test1.com' },
            { _id: { toString: () => '2' }, url: 'http://test2.com' },
        ];
        mockedEndpointService.getAllEndpoints.mockResolvedValue(mockEndpoints as any);

        // Inicia o worker para registrar o processador
        startSchedulerWorker();

        // Executa manualmente o processador
        await workerProcessor({ id: 'test-job-1' });

        // Verifica se os endpoints foram buscados
        expect(mockedEndpointService.getAllEndpoints).toHaveBeenCalledTimes(1);

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

    it('should handle the case where there are no endpoints', async () => {
        mockedEndpointService.getAllEndpoints.mockResolvedValue([]);

        startSchedulerWorker();
        await workerProcessor({ id: 'test-job-2' });

        expect(mockedEndpointService.getAllEndpoints).toHaveBeenCalledTimes(1);
        expect(healthCheckJobsQueue.add).not.toHaveBeenCalled();
    });

    it('should throw an error if fetching endpoints fails', async () => {
        const dbError = new Error('Database error');
        mockedEndpointService.getAllEndpoints.mockRejectedValue(dbError);

        startSchedulerWorker();

        // Verifica se o worker lança o erro para o BullMQ poder tratar o retry
        await expect(workerProcessor({ id: 'test-job-3' })).rejects.toThrow('Database error');

        expect(healthCheckJobsQueue.add).not.toHaveBeenCalled();
    });
});
