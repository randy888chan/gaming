/**
 * Performance monitoring utility for tracking API response times and resource usage
 */

interface PerformanceMetrics {
  timestamp: number;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  memoryUsage: number;
  cpuUsage?: NodeJS.CpuUsage;
  userId?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = 1000; // Keep only the last 1000 metrics

  /**
   * Start timing an operation
   * @returns A function to call when the operation completes
   */
  startTiming(endpoint: string, method: string, userId?: string): () => { responseTime: number; memoryUsage: number } {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;
    
    return () => {
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage().heapUsed;
      
      return {
        responseTime: Number(endTime - startTime) / 1000000, // Convert to milliseconds
        memoryUsage: endMemory - startMemory
      };
    };
  }

  /**
   * Record performance metrics for an API call
   */
  recordMetrics(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    userId?: string
  ): void {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      endpoint,
      method,
      responseTime,
      statusCode,
      memoryUsage: process.memoryUsage().heapUsed,
      userId
    };

    this.metrics.push(metrics);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request detected: ${method} ${endpoint} took ${responseTime}ms`);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    averageResponseTime: number;
    slowestEndpoint: string;
    errorRate: number;
    totalRequests: number;
    slowRequests: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageResponseTime: 0,
        slowestEndpoint: '',
        errorRate: 0,
        totalRequests: 0,
        slowRequests: 0
      };
    }

    const totalResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0);
    const averageResponseTime = totalResponseTime / this.metrics.length;
    
    const slowest = this.metrics.reduce((slowest, current) => 
      current.responseTime > slowest.responseTime ? current : slowest
    );
    
    const errors = this.metrics.filter(m => m.statusCode >= 500).length;
    const errorRate = errors / this.metrics.length;
    
    const slowRequests = this.metrics.filter(m => m.responseTime > 1000).length;

    return {
      averageResponseTime,
      slowestEndpoint: `${slowest.method} ${slowest.endpoint}`,
      errorRate,
      totalRequests: this.metrics.length,
      slowRequests
    };
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 50): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get metrics for a specific endpoint
   */
  getEndpointMetrics(endpoint: string, count: number = 50): PerformanceMetrics[] {
    const filteredMetrics = this.metrics.filter(m => m.endpoint === endpoint);
    return filteredMetrics.slice(-count);
  }

  /**
   * Get metrics for a specific user
   */
  getUserMetrics(userId: string, count: number = 50): PerformanceMetrics[] {
    const filteredMetrics = this.metrics.filter(m => m.userId === userId);
    return filteredMetrics.slice(-count);
  }

  /**
   * Get slow requests
   */
  getSlowRequests(threshold: number = 1000, count: number = 50): PerformanceMetrics[] {
    const slowRequests = this.metrics.filter(m => m.responseTime > threshold);
    return slowRequests.slice(-count);
  }
}

// Export a singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware to wrap API handlers with performance monitoring
 */
export function withPerformanceMonitoring(
  handler: (req: any, res: any) => Promise<void>
) {
  return async (req: any, res: any) => {
    const userId = req.headers.authorization ? 
      req.headers.authorization.split(" ")[1] : 
      undefined;
      
    const stopTimer = performanceMonitor.startTiming(req.url, req.method, userId);
    
    const originalSend = res.send;
    let statusCode = 200;
    
    // Override res.send to capture status code
    res.send = function(body: any) {
      statusCode = res.statusCode;
      return originalSend.call(this, body);
    };
    
    try {
      await handler(req, res);
    } finally {
      const { responseTime, memoryUsage } = stopTimer();
      performanceMonitor.recordMetrics(
        req.url,
        req.method,
        responseTime,
        statusCode,
        userId
      );
    }
  };
}