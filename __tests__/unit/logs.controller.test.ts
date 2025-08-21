import { Request, Response } from 'express';
import * as logService from '../../src/api/logs/logs.service';
import { list, findById } from '../../src/api/logs/logs.controller';

// Mock do service
jest.mock('../../src/api/logs/logs.service');

// Tipagem para o mock do service
const mockedLogService = logService as jest.Mocked<typeof logService>;

describe('Logs Controller', () => {

    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseJson: jest.Mock;
    let responseStatus: jest.Mock;

    beforeEach(() => {
        responseJson = jest.fn();
        responseStatus = jest.fn().mockReturnValue({ json: responseJson });
        mockRequest = {};
        mockResponse = {
            status: responseStatus,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('list', () => {
        it('should get all logs and return a 200 status', async () => {
            const logs = [{ status: 'Online' }];
            mockedLogService.getLogs.mockResolvedValue(logs as any);

            await list(mockRequest as Request, mockResponse as Response);

            expect(mockedLogService.getLogs).toHaveBeenCalledTimes(1);
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(logs);
        });
    });

    describe('findById', () => {
        it('should get logs for a specific endpoint and return a 200 status', async () => {
            const endpointId = 'some-id';
            const logs = [{ status: 'Online', endpointId }];
            mockRequest.params = { endpointId };
            mockedLogService.getLogsByEndpointId.mockResolvedValue(logs as any);

            await findById(mockRequest as Request, mockResponse as Response);

            expect(mockedLogService.getLogsByEndpointId).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(logs);
        });

        it('should return a 500 status on service error', async () => {
            const endpointId = 'error-id';
            const error = new Error('DB Error');
            mockRequest.params = { endpointId };
            mockedLogService.getLogsByEndpointId.mockRejectedValue(error);

            await findById(mockRequest as Request, mockResponse as Response);

            expect(mockedLogService.getLogsByEndpointId).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(500);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Erro interno ao buscar os logs do endpoint.' });
        });
    });
});
