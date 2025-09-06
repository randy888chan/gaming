import { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../../utils/authMiddleware";
import { securityAudit } from "../../../../utils/securityAudit";
import { performanceMonitor } from "../../../../utils/performanceMonitor";

/**
 * Security Dashboard API Endpoint
 * Provides security metrics and performance data
 */

interface SecurityStats {
  totalEvents: number;
  authFailures: number;
  rateLimitExceeded: number;
  suspiciousActivity: number;
  inputValidationFailures: number;
  criticalEvents: number;
  securityViolations: number;
}

interface PerformanceStats {
  averageResponseTime: number;
  slowestEndpoint: string;
  errorRate: number;
  totalRequests: number;
  slowRequests: number;
}

interface DashboardData {
  securityStats: SecurityStats;
  performanceStats: PerformanceStats;
  recentSecurityEvents: any[];
  recentPerformanceMetrics: any[];
  topSlowEndpoints: any[];
  userActivity: any[];
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // Get security statistics
    const securityStats = securityAudit.getStats();
    
    // Get performance statistics
    const performanceStats = performanceMonitor.getStats();
    
    // Get recent security events (last 20)
    const recentSecurityEvents = securityAudit.getRecentEvents(20);
    
    // Get recent performance metrics (last 20)
    const recentPerformanceMetrics = performanceMonitor.getRecentMetrics(20);
    
    // Get top slow endpoints
    const topSlowEndpoints = performanceMonitor.getSlowRequests(1000, 10);
    
    // Compile dashboard data
    const dashboardData: DashboardData = {
      securityStats,
      performanceStats,
      recentSecurityEvents,
      recentPerformanceMetrics,
      topSlowEndpoints,
      userActivity: [] // This would be implemented based on your specific needs
    };

    // Add security headers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Error fetching security dashboard data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default withAuth(handler);