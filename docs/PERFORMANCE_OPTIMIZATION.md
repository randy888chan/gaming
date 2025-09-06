# Performance Optimization Guide

This document provides guidance on optimizing the performance of the gaming platform to improve user experience and reduce load times.

## 1. Bundle Analysis

### Installation
The `@next/bundle-analyzer` package has been installed to help identify large dependencies and optimize bundle size.

### Usage
Run the following commands to analyze the bundle:

```bash
# Analyze both server and browser bundles
npm run analyze

# Analyze only server bundle
npm run analyze:server

# Analyze only browser bundle
npm run analyze:browser
```

### Interpreting Results
The bundle analyzer will generate reports in the `.next/analyze` directory:
- `server.html` - Server-side bundle analysis
- `browser.html` - Browser bundle analysis

Look for:
1. Large dependencies that can be replaced or removed
2. Duplicate code that can be deduplicated
3. Unused code that can be tree-shaken

## 2. Code Splitting

### Dynamic Imports
Game components are now loaded using dynamic imports with lazy loading to improve initial page load time:

```typescript
// Before
import Dice from "./Dice";

// After
const DiceGame = dynamic(() => import("./Dice"), { 
  ssr: false, 
  loading: () => <div>Loading Dice...</div> 
});
```

### Benefits
- Reduced initial bundle size
- Faster initial page load
- Games loaded on-demand
- Better user experience

## 3. Caching Strategy

### Next.js Caching
The following caching optimizations have been implemented in `next.config.js`:

1. **Static Asset Caching**:
   - Images: 24-hour cache with revalidation
   - Static files: 1-year immutable cache

2. **Webpack Optimization**:
   - Split chunks for better caching
   - Vendor chunk separation
   - Common module deduplication

### HTTP Caching Headers
Custom headers have been added for optimal caching:

```javascript
// Cache static assets for longer periods
{
  source: '/_next/static/(.*)',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

## 4. Tree Shaking

### Implementation
To enable effective tree shaking:

1. Use ES6 module syntax (`import`/`export`)
2. Avoid default imports when only specific functions are needed
3. Remove unused dependencies

### Example
```typescript
// Instead of importing the entire library
import * as lodash from 'lodash';

// Import only what you need
import { debounce } from 'lodash/debounce';
```

## 5. Image Optimization

### Next.js Image Component
Use the Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/games/logo.png"
  alt="Game Logo"
  width={100}
  height={100}
  priority={true} // For above-the-fold images
/>
```

### Benefits
- Automatic resizing and optimization
- Lazy loading by default
- Modern image formats (WebP, AVIF)
- Responsive images

## 6. Component Optimization

### React.memo
Use `React.memo` for components that render frequently with the same props:

```tsx
import { memo } from 'react';

const GameCard = memo(({ game }) => {
  // Component implementation
});

export default GameCard;
```

### useMemo and useCallback
Memoize expensive computations and callback functions:

```tsx
import { useMemo, useCallback } from 'react';

const GameComponent = () => {
  const expensiveValue = useMemo(() => {
    // Expensive computation
    return computeExpensiveValue();
  }, [dependencies]);

  const handleClick = useCallback(() => {
    // Handle click
  }, [dependencies]);

  return <div>{expensiveValue}</div>;
};
```

## 7. Server-Side Rendering (SSR) Optimization

### getServerSideProps Optimization
When using `getServerSideProps`, implement caching where possible:

```typescript
export async function getServerSideProps(context) {
  // Implement caching logic
  const cacheKey = `game-data-${context.params.id}`;
  
  // Check cache first
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) {
    return { props: { data: cachedData } };
  }
  
  // Fetch data and cache it
  const data = await fetchData();
  await setCache(cacheKey, data, 300); // Cache for 5 minutes
  
  return { props: { data } };
}
```

## 8. Database Query Optimization

### Indexing
Ensure proper database indexing for frequently queried fields:

```sql
-- Example indexes for better query performance
CREATE INDEX idx_user_preferences_particle_user_id ON user_preferences(particle_user_id);
CREATE INDEX idx_users_wallet_address ON users(walletAddress);
CREATE INDEX idx_polymarket_markets_cache_condition_id ON polymarket_markets_cache(condition_id);
```

### Query Optimization
Use parameterized queries and avoid N+1 query problems:

```typescript
// Use JOINs instead of multiple queries
const query = `
  SELECT u.*, up.*
  FROM users u
  LEFT JOIN user_preferences up ON u.id = up.user_id
  WHERE u.id = ?
`;
```

## 9. API Performance

### Rate Limiting
Implement appropriate rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

### Response Caching
Cache API responses where appropriate:

```typescript
// Add cache headers to API responses
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
```

## 10. Monitoring and Measurement

### Web Vitals
Monitor Core Web Vitals:
- **Largest Contentful Paint (LCP)**: Measure loading performance
- **First Input Delay (FID)**: Measure interactivity
- **Cumulative Layout Shift (CLS)**: Measure visual stability

### Performance Monitoring
Implement performance monitoring with tools like:
- Next.js Speed Insights
- Web Vitals reporting
- Custom performance logging

```typescript
// Log performance metrics
useEffect(() => {
  const handleRouteChange = (url) => {
    // Log page view and performance metrics
    logPerformanceMetrics(url);
  };
  
  router.events.on('routeChangeComplete', handleRouteChange);
  return () => {
    router.events.off('routeChangeComplete', handleRouteChange);
  };
}, [router.events]);
```

## 11. Best Practices Summary

### Development
1. Regularly run bundle analysis
2. Monitor bundle size increases
3. Remove unused dependencies
4. Use dynamic imports for non-critical components
5. Implement proper error boundaries

### Production
1. Enable compression (gzip/brotli)
2. Use a CDN for static assets
3. Implement proper caching strategies
4. Monitor performance metrics
5. Set up performance budgets

### Tools
1. **Bundle Analyzer**: `npm run analyze`
2. **Lighthouse**: Chrome DevTools Audits
3. **WebPageTest**: Detailed performance analysis
4. **Next.js Speed Insights**: Real user monitoring

## 12. Future Optimizations

### Planned Improvements
1. Implement Progressive Web App (PWA) features
2. Add service worker caching
3. Implement prefetching for game navigation
4. Optimize Three.js components in games
5. Implement code splitting for admin/dashboard sections

### Monitoring
1. Set up performance alerts
2. Implement user experience tracking
3. Monitor API response times
4. Track error rates and performance degradation

By following these optimization strategies, the gaming platform should see significant improvements in load times, user experience, and overall performance.