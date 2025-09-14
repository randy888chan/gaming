import { createMocks } from 'node-mocks-http';
import handler from './generate';
import * as aiAdapter from '../../../services/aiAdapter';

// Mock the aiAdapter
jest.mock('../../../services/aiAdapter', () => ({
  generatePSEOContent: jest.fn()
}));

describe('/api/pSeo/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initiate pSEO content generation for POST request', async () => {
    (aiAdapter.generatePSEOContent as jest.Mock).mockResolvedValue(undefined);

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'pSEO content generation initiated successfully.',
    });
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalled();
  });

  it('should return 500 if pSEO content generation fails', async () => {
    (aiAdapter.generatePSEOContent as jest.Mock).mockRejectedValue(new Error('Generation failed'));

    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Failed to initiate pSEO content generation.',
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