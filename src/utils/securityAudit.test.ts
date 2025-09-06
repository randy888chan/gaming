/**
 * Security audit utilities tests
 */

import { securityAudit, logSecurityEvent } from './securityAudit';

describe('Security Audit Utilities', () => {
  beforeEach(() => {
    // Clear all events before each test
    securityAudit.clearEvents();
    
    // Mock console methods
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logEvent', () => {
    it('should log security events', () => {
      const event = {
        eventType: 'AUTH_FAILURE' as const,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        endpoint: '/api/test',
        details: 'Test authentication failure'
      };
      
      logSecurityEvent(event);
      
      const events = securityAudit.getRecentEvents(1);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject(event);
      expect(events[0].timestamp).toBeDefined();
      
      expect(console.warn).toHaveBeenCalledWith(
        'SECURITY EVENT: AUTH_FAILURE (MEDIUM) - Test authentication failure'
      );
    });

    it('should log critical events with error level', () => {
      const event = {
        eventType: 'AUTH_FAILURE' as const,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
        endpoint: '/api/test',
        details: 'Test authentication failure',
        severity: 'CRITICAL' as const
      };
      
      logSecurityEvent(event);
      
      expect(console.error).toHaveBeenCalledWith(
        'SECURITY EVENT: AUTH_FAILURE (CRITICAL) - Test authentication failure'
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL SECURITY ALERT')
      );
    });
  });

  describe('getRecentEvents', () => {
    it('should return recent events', () => {
      // Log multiple events
      for (let i = 0; i < 5; i++) {
        logSecurityEvent({
          eventType: 'AUTH_FAILURE',
          details: `Test event ${i}`
        });
      }
      
      const recentEvents = securityAudit.getRecentEvents(3);
      expect(recentEvents).toHaveLength(3);
      expect(recentEvents[0].details).toBe('Test event 2');
      expect(recentEvents[1].details).toBe('Test event 3');
      expect(recentEvents[2].details).toBe('Test event 4');
    });
  });

  describe('getEventsByType', () => {
    it('should filter events by type', () => {
      // Log different types of events
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        details: 'Auth failure'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        details: 'Auth success'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        details: 'Another auth failure'
      });
      
      const authFailures = securityAudit.getEventsByType('AUTH_FAILURE');
      expect(authFailures).toHaveLength(2);
      expect(authFailures[0].details).toBe('Auth failure');
      expect(authFailures[1].details).toBe('Another auth failure');
    });
  });

  describe('getEventsByUser', () => {
    it('should filter events by user ID', () => {
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        userId: 'user-1',
        details: 'User 1 login'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        userId: 'user-2',
        details: 'User 2 login'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        userId: 'user-1',
        details: 'User 1 another action'
      });
      
      const userEvents = securityAudit.getEventsByUser('user-1');
      expect(userEvents).toHaveLength(2);
      expect(userEvents[0].details).toBe('User 1 login');
      expect(userEvents[1].details).toBe('User 1 another action');
    });
  });

  describe('getEventsByIP', () => {
    it('should filter events by IP address', () => {
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        ipAddress: '127.0.0.1',
        details: 'Local login'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        ipAddress: '192.168.1.1',
        details: 'Remote login'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        ipAddress: '127.0.0.1',
        details: 'Another local login'
      });
      
      const ipEvents = securityAudit.getEventsByIP('127.0.0.1');
      expect(ipEvents).toHaveLength(2);
      expect(ipEvents[0].details).toBe('Local login');
      expect(ipEvents[1].details).toBe('Another local login');
    });
  });

  describe('getEventsBySeverity', () => {
    it('should filter events by severity', () => {
      logSecurityEvent({
        eventType: 'AUTH_SUCCESS',
        details: 'Low severity event',
        severity: 'LOW'
      });
      
      logSecurityEvent({
        eventType: 'AUTH_FAILURE',
        details: 'Medium severity event',
        severity: 'MEDIUM'
      });
      
      logSecurityEvent({
        eventType: 'RATE_LIMIT_EXCEEDED',
        details: 'High severity event',
        severity: 'HIGH'
      });
      
      const highSeverityEvents = securityAudit.getEventsBySeverity('HIGH');
      expect(highSeverityEvents).toHaveLength(1);
      expect(highSeverityEvents[0].details).toBe('High severity event');
    });
  });

  describe('getStats', () => {
    it('should return security statistics', () => {
      // Log various events
      logSecurityEvent({ eventType: 'AUTH_FAILURE', details: 'Failed auth' });
      logSecurityEvent({ eventType: 'AUTH_FAILURE', details: 'Another failed auth' });
      logSecurityEvent({ eventType: 'RATE_LIMIT_EXCEEDED', details: 'Rate limit exceeded' });
      logSecurityEvent({ eventType: 'SUSPICIOUS_ACTIVITY', details: 'Suspicious activity' });
      logSecurityEvent({ eventType: 'INPUT_VALIDATION_FAILURE', details: 'Input validation failed' });
      logSecurityEvent({ eventType: 'SECURITY_VIOLATION', details: 'Security violation', severity: 'CRITICAL' });
      
      const stats = securityAudit.getStats();
      
      expect(stats.totalEvents).toBe(6);
      expect(stats.authFailures).toBe(2);
      expect(stats.rateLimitExceeded).toBe(1);
      expect(stats.suspiciousActivity).toBe(1);
      expect(stats.inputValidationFailures).toBe(1);
      expect(stats.securityViolations).toBe(1);
      expect(stats.criticalEvents).toBe(1);
    });
  });

  describe('getEventsInTimeRange', () => {
    it('should filter events by time range', () => {
      // Mock Date.now() to control timestamps
      const baseTime = Date.now();
      jest.spyOn(global.Date, 'now').mockImplementation(() => baseTime);
      
      logSecurityEvent({ eventType: 'AUTH_SUCCESS', details: 'Event 1' });
      
      // Move time forward by 1 second
      jest.spyOn(global.Date, 'now').mockImplementation(() => baseTime + 1000);
      logSecurityEvent({ eventType: 'AUTH_SUCCESS', details: 'Event 2' });
      
      // Move time forward by 2 more seconds
      jest.spyOn(global.Date, 'now').mockImplementation(() => baseTime + 3000);
      logSecurityEvent({ eventType: 'AUTH_SUCCESS', details: 'Event 3' });
      
      const eventsInRange = securityAudit.getEventsInTimeRange(
        baseTime + 500, // 0.5 seconds after first event
        baseTime + 2500 // 2.5 seconds after first event
      );
      
      expect(eventsInRange).toHaveLength(1);
      expect(eventsInRange[0].details).toBe('Event 2');
    });
  });
});