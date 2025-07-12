import { NextApiRequest, NextApiResponse } from 'next';

const rateLimit = new Map();

export const rateLimitMiddleware = (
  limit: number,
  windowMs: number,
) => (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!ip) {
    return res.status(500).json({ message: 'Internal Server Error: Could not determine IP address for rate limiting.' });
  }

  const key = `rate_limit_${ip}`;
  const now = Date.now();

  if (!rateLimit.has(key)) {
    rateLimit.set(key, { count: 0, lastReset: now });
  }

  const data = rateLimit.get(key);

  if (now - data.lastReset > windowMs) {
    data.count = 0;
    data.lastReset = now;
  }

  data.count++;

  if (data.count > limit) {
    res.setHeader('Retry-After', Math.ceil((data.lastReset + windowMs - now) / 1000));
    return res.status(429).json({ message: 'Too Many Requests' });
  }

  return handler(req, res);
};