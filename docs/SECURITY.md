# Security Implementation Guide

This document provides an overview of the security measures implemented in the gaming platform and how to use them effectively.

## Overview

The security implementation focuses on several key areas:

1. **Authentication & Authorization**
2. **Rate Limiting & Throttling**
3. **Input Validation & Sanitization**
4. **Database Security**
5. **Security Monitoring & Auditing**
6. **Performance Monitoring**

## Authentication & Authorization

### Particle Network JWT Verification

The platform uses Particle Network JWT tokens for authentication. The [particleAuth.ts](../src/utils/particleAuth.ts) utility provides functions for verifying these tokens:

```typescript
import { enhancedVerifyParticleToken } from '../../utils/particleAuth';

const particleUserId = await enhancedVerifyParticleToken(token, ipAddress, userAgent);
```

### Authentication Middleware

The [authMiddleware.ts](../src/utils/authMiddleware.ts) provides a middleware function for protecting API endpoints:

```typescript
import { withAuth } from '../../utils/authMiddleware';

export default withAuth(handler);
```

## Rate Limiting & Throttling

### Standard Rate Limiting

The [rateLimitMiddleware.ts](../src/utils/rateLimitMiddleware.ts) provides rate limiting middleware:

```typescript
import { withRateLimit, withSensitiveRateLimit } from '../../utils/rateLimitMiddleware';

// Standard rate limiting (30 requests per minute)
export default withRateLimit(handler);

// Sensitive rate limiting (5 requests per 15 minutes)
export default withSensitiveRateLimit(handler);
```

### Enhanced Security Middleware

The [securityMiddleware.ts](../src/utils/securityMiddleware.ts) provides enhanced security features including rate limiting, speed limiting, and security headers:

```typescript
import { withEnhancedSecurity } from '../../utils/securityMiddleware';

export default withEnhancedSecurity(handler);
```

## Input Validation & Sanitization

### Request Validation Middleware

The security middleware includes request validation capabilities:

```typescript
import { withRequestValidation } from '../../utils/securityMiddleware';

const validator = (req) => {
  // Validation logic here
  return { isValid: true };
};

export default withRequestValidation(validator)(handler);
```

### Database Security Utilities

The [databaseSecurity.ts](../src/utils/databaseSecurity.ts) provides utilities for preventing SQL injection:

```typescript
import { createSafeQuery, sanitizeInput } from '../../utils/databaseSecurity';

const safeQuery = createSafeQuery(
  "SELECT * FROM users WHERE id = ?",
  [sanitizeInput(userId)]
);
```

## Security Monitoring & Auditing

### Security Audit Logging

The [securityAudit.ts](../src/utils/securityAudit.ts) utility provides comprehensive security event logging:

```typescript
import { logSecurityEvent } from '../../utils/securityAudit';

logSecurityEvent({
  eventType: 'AUTH_FAILURE',
  ipAddress: req.socket.remoteAddress,
  userAgent: req.headers['user-agent'],
  endpoint: req.url,
  details: 'Authentication failed'
});
```

### Security Dashboard

The security dashboard API endpoint ([dashboard.ts](../src/pages/api/v1/security/dashboard.ts)) provides metrics and monitoring data:

```bash
GET /api/v1/security/dashboard
```

## Performance Monitoring

### Performance Monitoring Utility

The [performanceMonitor.ts](../src/utils/performanceMonitor.ts) utility tracks API performance:

```typescript
import { withPerformanceMonitoring } from '../../utils/performanceMonitor';

export default withPerformanceMonitoring(handler);
```

## Security Best Practices

### 1. Always Use Middleware

Protect all API endpoints with appropriate middleware:

```typescript
export default withPerformanceMonitoring(
  withRequestValidation(validator)(
    withEnhancedSecurity(withSensitiveRateLimit(handler))
  )
);
```

### 2. Validate All Inputs

Always validate and sanitize user inputs:

```typescript
const { walletAddress } = req.body;

if (!walletAddress) {
  return res.status(400).json({ error: "Wallet address is required" });
}

const sanitizedWalletAddress = sanitizeWalletAddress(walletAddress);
if (!isValidWalletAddress(sanitizedWalletAddress)) {
  return res.status(400).json({ error: "Invalid wallet address format" });
}
```

### 3. Use Safe Database Queries

Always use parameterized queries to prevent SQL injection:

```typescript
const safeQuery = createSafeQuery(
  "SELECT * FROM users WHERE walletAddress = ?",
  [sanitizedWalletAddress]
);

const user = await DB.prepare(safeQuery.query)
  .bind(...safeQuery.params)
  .first();
```

### 4. Implement Proper Error Handling

Never expose sensitive information in error messages:

```typescript
try {
  // Secure operation
} catch (error) {
  console.error("Error details:", error); // Log full details internally
  return res.status(500).json({ message: "Internal Server Error" }); // Generic message to user
}
```

## Testing Security Features

### Security Tests

Security features are tested with comprehensive unit tests:

- [securityMiddleware.test.ts](../src/utils/securityMiddleware.test.ts)
- [databaseSecurity.test.ts](../src/utils/databaseSecurity.test.ts)
- [particleAuth.test.ts](../src/utils/particleAuth.test.ts)
- [securityAudit.test.ts](../src/utils/securityAudit.test.ts)

Run tests with:

```bash
npm run test:services
```

## Database Security

### Security Indexes

Database migrations include security indexes for better performance:

- [005_add_security_indexes.sql](../infra/d1/migrations/005_add_security_indexes.sql)
- [006_add_additional_security_indexes.sql](../infra/d1/migrations/006_add_additional_security_indexes.sql)

## Environment Variables

Ensure the following environment variables are properly configured:

```env
PARTICLE_NETWORK_JWT_SECRET=your_jwt_secret_here
SUSPICIOUS_IPS=comma_separated_list_of_suspicious_ips
```

## Conclusion

This security implementation provides a comprehensive defense-in-depth approach to protecting the gaming platform. By following the best practices outlined in this document and using the provided utilities, you can ensure your API endpoints are secure and performant.