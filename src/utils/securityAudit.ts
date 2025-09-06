/**
 * Security audit utility for monitoring and logging security-related events
 */

interface SecurityEvent {
  eventType: 'AUTH_FAILURE' | 'AUTH_SUCCESS' | 'RATE_LIMIT_EXCEEDED' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS' | 'INPUT_VALIDATION_FAILURE' | 'SECURITY_VIOLATION';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  details?: string;
  timestamp: number;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class SecurityAudit {
  private events: SecurityEvent[] = [];
  private maxEvents: number = 10000; // Keep only the last 10,000 events

  /**
   * Log a security event
   * @param event The security event to log
   */
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for immediate visibility
    const severity = event.severity || 'MEDIUM';
    const logMessage = `SECURITY EVENT: ${event.eventType} (${severity}) - ${event.details || ''}`;
    
    switch (severity) {
      case 'CRITICAL':
        console.error(logMessage);
        break;
      case 'HIGH':
        console.warn(logMessage);
        break;
      case 'MEDIUM':
        console.warn(logMessage);
        break;
      case 'LOW':
        console.info(logMessage);
        break;
    }
    
    // For critical events, consider sending alerts or notifications
    if (this.isCriticalEvent(event.eventType) || severity === 'CRITICAL') {
      this.sendAlert(fullEvent);
    }
  }

  /**
   * Check if an event type is critical
   * @param eventType The event type to check
   * @returns True if the event is critical
   */
  private isCriticalEvent(eventType: SecurityEvent['eventType']): boolean {
    return [
      'AUTH_FAILURE',
      'RATE_LIMIT_EXCEEDED',
      'SUSPICIOUS_ACTIVITY',
      'SECURITY_VIOLATION'
    ].includes(eventType);
  }

  /**
   * Send an alert for critical security events
   * @param event The critical event
   */
  private sendAlert(event: SecurityEvent): void {
    // In a real implementation, this would send alerts via email, SMS, or other channels
    // For now, we'll just log it
    console.error(`CRITICAL SECURITY ALERT: ${event.eventType} at ${new Date(event.timestamp).toISOString()}`);
    
    // Example of what might be implemented in production:
    // - Send to a monitoring service like Sentry
    // - Send an email to security team
    // - Trigger a webhook to a security information and event management (SIEM) system
  }

  /**
   * Get recent security events
   * @param count Number of events to retrieve
   * @returns Array of recent security events
   */
  getRecentEvents(count: number = 50): SecurityEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Get events by type
   * @param eventType The event type to filter by
   * @param count Number of events to retrieve
   * @returns Array of events of the specified type
   */
  getEventsByType(eventType: SecurityEvent['eventType'], count: number = 50): SecurityEvent[] {
    const filteredEvents = this.events.filter(event => event.eventType === eventType);
    return filteredEvents.slice(-count);
  }

  /**
   * Get events by user ID
   * @param userId The user ID to filter by
   * @param count Number of events to retrieve
   * @returns Array of events for the specified user
   */
  getEventsByUser(userId: string, count: number = 50): SecurityEvent[] {
    const filteredEvents = this.events.filter(event => event.userId === userId);
    return filteredEvents.slice(-count);
  }

  /**
   * Get events by IP address
   * @param ipAddress The IP address to filter by
   * @param count Number of events to retrieve
   * @returns Array of events from the specified IP
   */
  getEventsByIP(ipAddress: string, count: number = 50): SecurityEvent[] {
    const filteredEvents = this.events.filter(event => event.ipAddress === ipAddress);
    return filteredEvents.slice(-count);
  }

  /**
   * Get events by severity
   * @param severity The severity level to filter by
   * @param count Number of events to retrieve
   * @returns Array of events with the specified severity
   */
  getEventsBySeverity(severity: SecurityEvent['severity'], count: number = 50): SecurityEvent[] {
    const filteredEvents = this.events.filter(event => event.severity === severity);
    return filteredEvents.slice(-count);
  }

  /**
   * Get security statistics
   * @returns Object containing security statistics
   */
  getStats(): {
    totalEvents: number;
    authFailures: number;
    rateLimitExceeded: number;
    suspiciousActivity: number;
    inputValidationFailures: number;
    criticalEvents: number;
    securityViolations: number;
  } {
    const authFailures = this.events.filter(e => e.eventType === 'AUTH_FAILURE').length;
    const rateLimitExceeded = this.events.filter(e => e.eventType === 'RATE_LIMIT_EXCEEDED').length;
    const suspiciousActivity = this.events.filter(e => e.eventType === 'SUSPICIOUS_ACTIVITY').length;
    const inputValidationFailures = this.events.filter(e => e.eventType === 'INPUT_VALIDATION_FAILURE').length;
    const securityViolations = this.events.filter(e => e.eventType === 'SECURITY_VIOLATION').length;
    const criticalEvents = this.events.filter(e => this.isCriticalEvent(e.eventType) || e.severity === 'CRITICAL').length;

    return {
      totalEvents: this.events.length,
      authFailures,
      rateLimitExceeded,
      suspiciousActivity,
      inputValidationFailures,
      criticalEvents,
      securityViolations
    };
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Get events within a time range
   * @param startTime Start time (milliseconds since epoch)
   * @param endTime End time (milliseconds since epoch)
   * @returns Array of events within the time range
   */
  getEventsInTimeRange(startTime: number, endTime: number): SecurityEvent[] {
    return this.events.filter(event => event.timestamp >= startTime && event.timestamp <= endTime);
  }
}

// Export a singleton instance
export const securityAudit = new SecurityAudit();

/**
 * Middleware to log security events
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  securityAudit.logEvent(event);
}