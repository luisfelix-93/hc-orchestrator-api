import { Request, Response } from 'express';
import * as endpointService from '../../src/api/endpoints/endpoint.service';
import {
    list,
    create,
    deleteEndpoint,
    getEndpointById
} from '../../src/api/endpoints/endpoint.controller';

// Mock do service
jest.mock('../../src/api/endpoints/endpoint.service');

// Tipagem para o mock do service para facilitar o uso
const mockedEndpointService = endpointService as jest.Mocked<typeof endpointService>;

describe('Endpoint Controller', () => {

    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseJson: jest.Mock;
    let responseStatus: jest.Mock;

    beforeEach(() => {
        // Resetamos os mocks antes de cada teste
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
        it('should get all endpoints and return a 200 status', async () => {
            const endpoints = [{ name: 'Test', url: 'http://test.com' }];
            mockedEndpointService.getAllEndpoints.mockResolvedValue(endpoints as any);

            await list(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.getAllEndpoints).toHaveBeenCalledTimes(1);
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(endpoints);
        });
    });

    describe('create', () => {
        it('should create an endpoint and return a 201 status', async () => {
            const newEndpoint = { name: 'New', url: 'http://new.com' };
            mockRequest.body = newEndpoint;
            mockedEndpointService.create.mockResolvedValue(newEndpoint as any);

            await create(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.create).toHaveBeenCalledWith('New', 'http://new.com');
            expect(responseStatus).toHaveBeenCalledWith(201);
            expect(responseJson).toHaveBeenCalledWith(newEndpoint);
        });

        it('should return a 400 status if name or url are missing', async () => {
            mockRequest.body = {}; // Body vazio

            await create(mockRequest as Request, mockResponse as Response);

            expect(responseStatus).toHaveBeenCalledWith(400);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Nome e URL são obrigatórios' });
            expect(mockedEndpointService.create).not.toHaveBeenCalled();
        });
    });

    describe('deleteEndpoint', () => {
        it('should delete an endpoint and return a 200 status', async () => {
            const endpointId = 'some-id';
            mockRequest.params = { id: endpointId };
            mockedEndpointService.deleteEndpoint.mockResolvedValue({} as any); // Simula endpoint encontrado e deletado

            await deleteEndpoint(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.deleteEndpoint).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(200);
        });

        it('should return a 404 status if endpoint to delete is not found', async () => {
            const endpointId = 'not-found-id';
            mockRequest.params = { id: endpointId };
            mockedEndpointService.deleteEndpoint.mockResolvedValue(null); // Simula endpoint não encontrado

            await deleteEndpoint(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.deleteEndpoint).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(404);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Endpoint não encontrado' });
        });
    });

    describe('getEndpointById', () => {
        it('should get an endpoint by id and return a 200 status', async () => {
            const endpointId = 'some-id';
            const endpoint = { name: 'Test', url: 'http://test.com' };
            mockRequest.params = { id: endpointId };
            mockedEndpointService.getEndpointById.mockResolvedValue(endpoint as any);

            await getEndpointById(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.getEndpointById).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(200);
            expect(responseJson).toHaveBeenCalledWith(endpoint);
        });

        it('should return a 404 status if endpoint is not found', async () => {
            const endpointId = 'not-found-id';
            mockRequest.params = { id: endpointId };
            mockedEndpointService.getEndpointById.mockResolvedValue(null);

            await getEndpointById(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.getEndpointById).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(404);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Endpoint não encontrado' });
        });

        it('should return a 500 status on service error', async () => {
            const endpointId = 'error-id';
            const error = new Error('DB Error');
            mockRequest.params = { id: endpointId };
            mockedEndpointService.getEndpointById.mockRejectedValue(error);

            await getEndpointById(mockRequest as Request, mockResponse as Response);

            expect(mockedEndpointService.getEndpointById).toHaveBeenCalledWith(endpointId);
            expect(responseStatus).toHaveBeenCalledWith(500);
            expect(responseJson).toHaveBeenCalledWith({ error: 'Erro interno ao buscar o endpoint.' });
        });
    });
});
