import { createMocks } from 'node-mocks-http';
import handler from './cron';
import * as pSeoGenerator from '../../../workers/pSeoGenerator';

// Mock the pSeoGenerator
jest.mock('../../../workers/pSeoGenerator', () => ({
  generatePSeoContent: jest.fn()
}));

describe('/api/pSeo/cron', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger pSEO content generation for POST request', async () => {
    (pSeoGenerator.generatePSeoContent as jest.Mock).mockResolvedValue(undefined);

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Daily pSEO content generation triggered successfully.',
    });
    expect(pSeoGenerator.generatePSeoContent).toHaveBeenCalled();
  });

  it('should return 500 if pSEO content generation fails', async () => {
    (pSeoGenerator.generatePSeoContent as jest.Mock).mockRejectedValue(new Error('Generation failed'));

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Failed to trigger daily pSEO content generation.',
    });
  });

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow');
  });
});