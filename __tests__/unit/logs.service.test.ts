import { HealthCheckLogModel } from '../../src/api/logs/logs.models';
import { getLogs, getLogsByEndpointId } from '../../src/api/logs/logs.service';

// Mock do Mongoose Model
jest.mock('../../src/api/logs/logs.models');

describe('Logs Service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getLogs', () => {
        it('should call HealthCheckLogModel.find with correct sorting and limit', async () => {
            const mockLimit = jest.fn().mockResolvedValue([]);
            const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
            (HealthCheckLogModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

            await getLogs();

            expect(HealthCheckLogModel.find).toHaveBeenCalledTimes(1);
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockLimit).toHaveBeenCalledWith(200);
        });
    });

    describe('getLogsByEndpointId', () => {
        it('should call HealthCheckLogModel.find with correct id, sorting, and limit', async () => {
            const endpointId = 'some-id';
            const mockLogs = [{ status: 'Online' }];

            const mockLimit = jest.fn().mockResolvedValue(mockLogs);
            const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
            (HealthCheckLogModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

            const result = await getLogsByEndpointId(endpointId);

            expect(HealthCheckLogModel.find).toHaveBeenCalledWith({ endpointId });
            expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockLimit).toHaveBeenCalledWith(200);
            expect(result).toEqual(mockLogs);
        });
    });
});
