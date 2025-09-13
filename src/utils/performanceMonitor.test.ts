import { createMocks } from 'node-mocks-http';
import { performanceMonitor, withPerformanceMonitoring } from './performanceMonitor';

describe('withPerformanceMonitoring', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
  });

  it('should record the correct status code when using res.json', (done) => {
    const handler = async (req: any, res: any) => {
      res.status(201).json({ message: 'Created' });
    };
    const wrappedHandler = withPerformanceMonitoring(handler);

    const { req, res } = createMocks({
      method: 'POST',
      url: '/api/test',
    });

    res.on('finish', () => {
      const metrics = performanceMonitor.getRecentMetrics(1);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].statusCode).toBe(201);
      done();
    });

    wrappedHandler(req, res);
  });

  it('should record the correct status code when using res.send', (done) => {
    const handler = async (req: any, res: any) => {
      res.status(202).send('Accepted');
    };
    const wrappedHandler = withPerformanceMonitoring(handler);

    const { req, res } = createMocks({
      method: 'PUT',
      url: '/api/test',
    });

    res.on('finish', () => {
      const metrics = performanceMonitor.getRecentMetrics(1);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].statusCode).toBe(202);
      done();
    });

    wrappedHandler(req, res);
  });

  it('should record the correct status code when no status is explicitly set', (done) => {
    const handler = async (req: any, res: any) => {
      res.end('OK');
    };
    const wrappedHandler = withPerformanceMonitoring(handler);

    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/test',
    });

    res.on('finish', () => {
      const metrics = performanceMonitor.getRecentMetrics(1);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].statusCode).toBe(200);
      done();
    });

    wrappedHandler(req, res);
  });

  it('should record a 500 status code if the handler throws an error', async () => {
    const handler = async (req: any, res: any) => {
      throw new Error('Something went wrong');
    };
    const wrappedHandler = withPerformanceMonitoring(handler);

    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/error',
    });

    await expect(wrappedHandler(req, res)).rejects.toThrow('Something went wrong');

    const metrics = performanceMonitor.getRecentMetrics(1);
    expect(metrics).toHaveLength(1);
    expect(metrics[0].statusCode).toBe(500);
  });

  it('should record the memory usage delta, not the total heap size', (done) => {
    const handler = async (req: any, res: any) => {
      res.status(200).send('OK');
    };
    const wrappedHandler = withPerformanceMonitoring(handler);

    const { req, res } = createMocks({
      method: 'GET',
      url: '/api/memory',
    });

    const memoryUsageSpy = jest.spyOn(process, 'memoryUsage');
    memoryUsageSpy.mockReturnValueOnce({ heapUsed: 1000 } as any);
    memoryUsageSpy.mockReturnValueOnce({ heapUsed: 3000 } as any);

    res.on('finish', () => {
      const metrics = performanceMonitor.getRecentMetrics(1);
      expect(metrics).toHaveLength(1);
      expect(metrics[0].memoryUsage).toBe(2000);
      memoryUsageSpy.mockRestore();
      done();
    });

    wrappedHandler(req, res);
  });
});
