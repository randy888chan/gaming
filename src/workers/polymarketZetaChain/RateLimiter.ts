export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number, // tokens per second
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  private refillTokens(): void {
    const now = Date.now();
    const timeElapsed = (now - this.lastRefill) / 1000; // in seconds
    this.tokens = Math.min(this.capacity, this.tokens + timeElapsed * this.refillRate);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refillTokens();
    if (this.tokens >= 1) {
      this.tokens--;
      return;
    }

    const timeToWait = (1 - this.tokens) / this.refillRate;
    this.tokens = 0;
    await new Promise((resolve) => setTimeout(resolve, timeToWait * 1000));
    this.refillTokens(); // Refill again after waiting
    this.tokens--; // Acquire the token
  }
}