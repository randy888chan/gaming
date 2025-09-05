// End-to-end test for pSEO and social media journey
// This test simulates the complete workflow from pSEO content generation to social media posting

import { createMocks } from 'node-mocks-http';
import * as aiAdapter from '../src/services/aiAdapter';
import pSeoGenerateApiHandler from '../src/pages/api/pSeo/generate';
import pSeoLatestApiHandler from '../src/pages/api/pSeo/latest';
import socialPostApiHandler from '../src/pages/api/social-post';
import pSeoGeneratorWorker from '../src/workers/pSeoGenerator/index';
import socialPosterWorker from '../src/workers/socialPoster/index';

// Mock the AI adapter
jest.mock('../src/services/aiAdapter', () => ({
  generatePSEOContent: jest.fn(),
  generateSocialPost: jest.fn(),
}));

describe('pSEO and Social Media Journey - E2E', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should complete the full pSEO and social media journey: generate content -> retrieve -> post to social media', async () => {
    // Mock AI generated content
    const mockPSEOContent = {
      title: 'Best Online Gaming Experience',
      description: 'Discover thrilling online games with fair play and big wins!',
      keywords: ['online gaming', 'casino games', 'play to earn'],
      htmlBody: '<p>Welcome to the ultimate destination for online gaming...</p>',
    };

    const mockSocialPost = 'Check out our latest gaming content! 🎮🏆 #gaming #crypto';

    (aiAdapter.generatePSEOContent as jest.Mock).mockResolvedValue(mockPSEOContent);
    (aiAdapter.generateSocialPost as jest.Mock).mockResolvedValue(mockSocialPost);

    // Step 1: Generate pSEO content via API
    const generateReq = createMocks({
      method: 'POST',
    });

    const generateRes = createMocks();

    await pSeoGenerateApiHandler(generateReq, generateRes);

    expect(generateRes._getStatusCode()).toBe(200);
    expect(JSON.parse(generateRes._getData())).toEqual({
      message: 'pSEO content generation initiated successfully.',
    });
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalled();

    // Step 2: Retrieve latest pSEO content via API
    const latestReq = createMocks({
      method: 'GET',
    });

    const latestRes = createMocks();

    await pSeoLatestApiHandler(latestReq, latestRes);

    expect(latestRes._getStatusCode()).toBe(200);
    const latestData = JSON.parse(latestRes._getData());
    expect(latestData).toHaveProperty('title');
    expect(latestData).toHaveProperty('description');
    expect(latestData).toHaveProperty('keywords');
    expect(latestData).toHaveProperty('content');

    // Step 3: Post to social media via API
    const socialPostReq = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        platforms: ['twitter', 'facebook'],
        scheduleAt: new Date().toISOString(),
      },
    });

    const socialPostRes = createMocks();

    await socialPostApiHandler(socialPostReq, socialPostRes);

    expect(socialPostRes._getStatusCode()).toBe(200);
    expect(JSON.parse(socialPostRes._getData())).toEqual({
      success: true,
      postedTo: expect.arrayContaining(['twitter', 'facebook']),
    });

    // Step 4: Simulate the pSeoGenerator worker running on schedule
    const mockDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      all: jest.fn().mockResolvedValue({ results: [] }),
      first: jest.fn().mockResolvedValue(null),
    };

    const mockQueue = {
      send: jest.fn().mockResolvedValue(undefined),
    };

    const mockEnv = {
      DB: mockDB,
      SOCIAL_POST_QUEUE: mockQueue,
    } as any;

    const controller = {} as any;
    const ctx = {} as any;

    await pSeoGeneratorWorker.scheduled(controller, mockEnv, ctx);

    // Verify that the AI adapter was called again
    expect(aiAdapter.generatePSEOContent).toHaveBeenCalledTimes(2);

    // Verify that the database methods were called
    expect(mockDB.prepare).toHaveBeenCalled();
    expect(mockDB.bind).toHaveBeenCalled();
    expect(mockDB.run).toHaveBeenCalled();

    // Verify that the social post queue was called
    expect(mockQueue.send).toHaveBeenCalled();

    // Step 5: Simulate the socialPoster worker processing a queue message
    const mockContentDB = {
      prepare: jest.fn().mockReturnThis(),
      bind: jest.fn().mockReturnThis(),
      run: jest.fn().mockResolvedValue({ success: true }),
      first: jest.fn().mockResolvedValue({
        id: 'content123',
        urlPath: '/content/content123',
        title: mockPSEOContent.title,
        metaDescription: mockPSEOContent.description,
        keywords: mockPSEOContent.keywords.join(','),
        generatedHtml: mockPSEOContent.htmlBody,
        imageUrl: '',
        generationDate: new Date().toISOString(),
        socialPostQueueId: null,
      }),
    };

    const socialPosterEnv = {
      DB: mockContentDB,
    } as any;

    const batch = {
      messages: [
        {
          id: 'message123',
          body: {
            contentId: 'content123',
          },
        },
      ],
    } as any;

    const socialPosterCtx = {} as any;

    await socialPosterWorker.queue(batch, socialPosterEnv, socialPosterCtx);

    // Verify that the content was retrieved from the database
    expect(mockContentDB.prepare).toHaveBeenCalledWith(
      'SELECT * FROM content_metadata WHERE id = ?'
    );
    expect(mockContentDB.bind).toHaveBeenCalledWith('content123');
    expect(mockContentDB.first).toHaveBeenCalled();

    // Verify that the AI adapter was called to generate social post
    expect(aiAdapter.generateSocialPost).toHaveBeenCalledWith(
      mockPSEOContent.title + ' ' + mockPSEOContent.description
    );

    // Verify that the content was updated with queue ID
    expect(mockContentDB.prepare).toHaveBeenCalledWith(
      'UPDATE content_metadata SET socialPostQueueId = ? WHERE id = ?'
    );
    expect(mockContentDB.bind).toHaveBeenCalledWith('message123', 'content123');
    expect(mockContentDB.run).toHaveBeenCalled();
  });

  it('should handle social media posting with invalid data', async () => {
    const socialPostReq = createMocks({
      method: 'POST',
      body: {
        // Missing required fields
        platforms: ['twitter'],
      },
    });

    const socialPostRes = createMocks();

    await socialPostApiHandler(socialPostReq, socialPostRes);

    expect(socialPostRes._getStatusCode()).toBe(400);
    expect(JSON.parse(socialPostRes._getData())).toEqual({
      success: false,
      error: 'Missing or invalid contentId.',
    });
  });

  it('should handle invalid schedule date for social media posting', async () => {
    const socialPostReq = createMocks({
      method: 'POST',
      body: {
        contentId: 'content123',
        platforms: ['twitter'],
        scheduleAt: 'invalid-date',
      },
    });

    const socialPostRes = createMocks();

    await socialPostApiHandler(socialPostReq, socialPostRes);

    expect(socialPostRes._getStatusCode()).toBe(400);
    expect(JSON.parse(socialPostRes._getData())).toEqual({
      success: false,
      error: 'Missing or invalid scheduleAt.',
    });
  });
});