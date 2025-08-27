import { EndpointModel } from '../../src/api/endpoints/endpoint.model';
import {
    create,
    deleteEndpoint,
    getAllEndpoints,
    getEndpointById
} from '../../src/api/endpoints/endpoint.service';
import redisClient from '../../src/lib/redis';

jest.mock('redis');
jest.mock('../../src/api/endpoints/endpoint.model');

describe('Endpoint Service', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllEndpoints', () => {
        it('should return cached endpoints if available', async () => {
            const mockEndpoints = [{ name: 'Test', url: 'http://test.com' }];
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockEndpoints));

            const result = await getAllEndpoints();

            expect(redisClient.get).toHaveBeenCalledWith('endpoints');
            expect(EndpointModel.find).not.toHaveBeenCalled();
            expect(result).toEqual(mockEndpoints);
        });

        it('should fetch endpoints from DB and cache them if not cached', async () => {
            const mockEndpoints = [{ name: 'Test', url: 'http://test.com' }];
            (redisClient.get as jest.Mock).mockResolvedValue(null);
            (EndpointModel.find as jest.Mock).mockResolvedValue(mockEndpoints);

            const result = await getAllEndpoints();

            expect(redisClient.get).toHaveBeenCalledWith('endpoints');
            expect(EndpointModel.find).toHaveBeenCalledTimes(1);
            expect(redisClient.set).toHaveBeenCalledWith('endpoints', JSON.stringify(mockEndpoints), { EX: 300 });
            expect(result).toEqual(mockEndpoints);
        });
    });

    describe('create', () => {
        it('should create an endpoint and invalidate the cache', async () => {
            const newEndpoint = { name: 'New', url: 'http://new.com' };
            (EndpointModel.create as jest.Mock).mockResolvedValue(newEndpoint);

            const result = await create('New', 'http://new.com');

            expect(EndpointModel.create).toHaveBeenCalledWith({ name: 'New', url: 'http://new.com' });
            expect(redisClient.del).toHaveBeenCalledWith('endpoints');
            expect(result).toEqual(newEndpoint);
        });
    });

    describe('deleteEndpoint', () => {
        it('should delete an endpoint and invalidate the cache', async () => {
            const endpointId = 'some-id';
            (EndpointModel.findByIdAndDelete as jest.Mock).mockResolvedValue({});

            await deleteEndpoint(endpointId);

            expect(EndpointModel.findByIdAndDelete).toHaveBeenCalledWith(endpointId);
            expect(redisClient.del).toHaveBeenCalledWith('endpoints');
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
