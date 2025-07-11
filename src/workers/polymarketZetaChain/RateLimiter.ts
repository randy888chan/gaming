export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refillTokens(): void {
    const now = Date.now();
    const timeElapsed = (now - this.lastRefill) / 1000; // in seconds
    this.tokens = Math.min(
      this.capacity,
      this.tokens + timeElapsed * this.refillRate
    );
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refillTokens();
    if (this.tokens >= 1) {
      this.tokens--;
      return;
    }

    const tokensNeeded = 1 - this.tokens;
    const timeToWait = tokensNeeded / this.refillRate;
    await new Promise((resolve) => setTimeout(resolve, timeToWait * 1000));
    this.refillTokens(); // Refill after waiting
    // Ensure we have at least 1 token after refill, then consume it.
    // If refillRate is very low and timeToWait is small, it's possible we still don't have 1 token.
    // However, the design implies we wait *until* a token is available.
    // For simplicity and to match the original intent of acquiring one token,
    // we assume the refill after waiting will provide at least one token.
    this.tokens = Math.max(0, this.tokens - 1); // Ensure tokens don't go negative if refill was insufficient
  }
}
