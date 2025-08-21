import { EndpointModel } from '../../src/api/endpoints/endpoint.model';
import {
    create,
    deleteEndpoint,
    getAllEndpoints,
    getEndpointById
} from '../../src/api/endpoints/endpoint.service';

// Mock do Mongoose Model
jest.mock('../../src/api/endpoints/endpoint.model');

describe('Endpoint Service', () => {

    // Limpa todos os mocks após cada teste
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllEndpoints', () => {
        it('should call EndpointModel.find and return the result', async () => {
            const mockEndpoints = [{ name: 'Test', url: 'http://test.com' }];
            (EndpointModel.find as jest.Mock).mockResolvedValue(mockEndpoints);

            const result = await getAllEndpoints();

            expect(EndpointModel.find).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockEndpoints);
        });
    });

    describe('create', () => {
        it('should call EndpointModel.create with correct parameters and return the result', async () => {
            const newEndpoint = { name: 'New', url: 'http://new.com' };
            (EndpointModel.create as jest.Mock).mockResolvedValue(newEndpoint);

            const result = await create('New', 'http://new.com');

            expect(EndpointModel.create).toHaveBeenCalledWith({ name: 'New', url: 'http://new.com' });
            expect(result).toEqual(newEndpoint);
        });
    });

    describe('deleteEndpoint', () => {
        it('should call EndpointModel.findByIdAndDelete with the correct id', async () => {
            const endpointId = 'some-id';
            (EndpointModel.findByIdAndDelete as jest.Mock).mockResolvedValue({}); // Retorna um objeto vazio para indicar sucesso

            await deleteEndpoint(endpointId);

            expect(EndpointModel.findByIdAndDelete).toHaveBeenCalledWith(endpointId);
        });
    });

    describe('getEndpointById', () => {
        it('should call EndpointModel.findById with the correct id and return the result', async () => {
            const endpointId = 'some-id';
            const mockEndpoint = { name: 'Found', url: 'http://found.com' };
            (EndpointModel.findById as jest.Mock).mockResolvedValue(mockEndpoint);

            const result = await getEndpointById(endpointId);

            expect(EndpointModel.findById).toHaveBeenCalledWith(endpointId);
            expect(result).toEqual(mockEndpoint);
        });
    });
});
