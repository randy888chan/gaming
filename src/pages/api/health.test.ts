import { createMocks } from 'node-mocks-http';
import handler from './health';

describe('Health API', () => {
  it('should return healthy status for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      status: 'healthy',
      database: 'connected'
    });
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getData()).toBe('Method POST Not Allowed');
  });
});