import request from 'supertest';
import app from '../../src/app';

describe('GET /health', () => {
  it('should respond with 200 and a health message', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Orchestrator is healthy!');
  });
});
