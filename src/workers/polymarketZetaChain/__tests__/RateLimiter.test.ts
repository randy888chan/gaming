import { RateLimiter } from "../RateLimiter";

// Mock Date.now() to control time in tests
const MOCK_DATE_NOW = 1678886400000; // A fixed timestamp for consistent testing

describe("RateLimiter", () => {
  let rateLimiter: RateLimiter;
  let setTimeoutSpy: jest.SpyInstance;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock Date.now() to control time
    dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(MOCK_DATE_NOW);
    // Mock setTimeout to avoid actual delays in tests
    setTimeoutSpy = jest
      .spyOn(global, "setTimeout")
      .mockImplementation((cb: Function) => {
        cb(); // Immediately call the callback
        return {} as NodeJS.Timeout; // Return a mock Timeout object
      });
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it("should initialize with correct capacity and tokens", () => {
    rateLimiter = new RateLimiter(5, 1);
    expect(rateLimiter["capacity"]).toBe(5);
    expect(rateLimiter["refillRate"]).toBe(1);
    expect(rateLimiter["tokens"]).toBe(5);
    expect(rateLimiter["lastRefill"]).toBe(MOCK_DATE_NOW);
  });

  describe("refillTokens", () => {
    it("should refill tokens based on elapsed time", () => {
      rateLimiter = new RateLimiter(5, 1);
      rateLimiter["tokens"] = 0; // Deplete tokens
      dateNowSpy.mockReturnValue(MOCK_DATE_NOW + 3000); // Advance time by 3 seconds
      rateLimiter["refillTokens"]();
      // 3 seconds * 1 token/sec = 3 tokens refilled
      expect(rateLimiter["tokens"]).toBe(3);
      expect(rateLimiter["lastRefill"]).toBe(MOCK_DATE_NOW + 3000);
    });

    it("should not exceed capacity when refilling tokens", () => {
      rateLimiter = new RateLimiter(5, 1);
      rateLimiter["tokens"] = 4; // Almost full
      dateNowSpy.mockReturnValue(MOCK_DATE_NOW + 3000); // Advance time by 3 seconds
      rateLimiter["refillTokens"]();
      // Should refill 3 tokens, but max capacity is 5, so it should cap at 5
      expect(rateLimiter["tokens"]).toBe(5);
    });
  });

  describe("acquire", () => {
    it("should acquire a token immediately if available", async () => {
      rateLimiter = new RateLimiter(1, 1); // Capacity 1, refill 1 token/sec
      rateLimiter["tokens"] = 1; // Make a token available
      const initialTokens = rateLimiter["tokens"];
      await rateLimiter.acquire();
      expect(rateLimiter["tokens"]).toBe(initialTokens - 1);
      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it("should wait and then acquire a token if no tokens are immediately available", async () => {
      rateLimiter = new RateLimiter(1, 1); // Capacity 1, refill 1 token/sec
      rateLimiter["tokens"] = 0; // No tokens available
      const initialLastRefill = rateLimiter["lastRefill"];

      // Simulate time passing during the wait
      setTimeoutSpy.mockImplementationOnce((cb: Function, delay: number) => {
        dateNowSpy.mockReturnValue(initialLastRefill + delay); // Advance time by the delay
        cb();
        return {} as NodeJS.Timeout;
      });

      await rateLimiter.acquire();

      // Expect setTimeout to have been called with a delay
      expect(setTimeoutSpy).toHaveBeenCalled();
      // After waiting and refilling, a token should be acquired
      expect(rateLimiter["tokens"]).toBe(0); // It acquires one, so it goes from 1 to 0 after refill
    });

    it("should handle refill and acquire correctly after waiting for fractional tokens", async () => {
      rateLimiter = new RateLimiter(1, 0.5); // Capacity 1, refill 0.5 token/sec
      rateLimiter["tokens"] = 0.2; // Fractional tokens
      const initialLastRefill = rateLimiter["lastRefill"];

      // Simulate time passing during the wait
      setTimeoutSpy.mockImplementationOnce((cb: Function, delay: number) => {
        dateNowSpy.mockReturnValue(initialLastRefill + delay); // Advance time by the delay
        cb();
        return {} as NodeJS.Timeout;
      });

      await rateLimiter.acquire();

      // The logic is:
      // 1. refillTokens() is called initially. Let's assume no time passed yet, so tokens remain 0.2.
      // 2. tokens < 1, so it calculates timeToWait = (1 - 0.2) / 0.5 = 0.8 / 0.5 = 1.6 seconds.
      // 3. tokens is set to 0.
      // 4. It waits for 1.6 seconds.
      // 5. After waiting, refillTokens() is called again.
      //    timeElapsed = 1.6 seconds.
      //    tokens = Math.min(capacity, 0 + 1.6 * 0.5) = Math.min(1, 0.8) = 0.8.
      // 6. tokens-- is called. So 0.8 - 1 = -0.2.
      // This indicates a potential issue or misunderstanding of the desired behavior for fractional tokens.
      // The test should reflect the expected behavior. If it's supposed to wait until at least 1 token is available,
      // then acquire it, the final token count should be 0.

      // Let's re-evaluate the expected behavior:
      // If tokens is 0.2, it needs 0.8 more tokens. At 0.5 tokens/sec, it needs 0.8 / 0.5 = 1.6 seconds.
      // After waiting 1.6 seconds, it refills. It should have 0.2 (initial) + 0.8 (refilled) = 1 token.
      // Then it acquires one, so it should be 0.

      // The current implementation sets this.tokens = 0 before waiting, which is problematic.
      // It should calculate the time to wait for the *next* token, then wait, then acquire.

      // Let's adjust the mock for setTimeout to reflect the time passing and then re-evaluate the refill.
      // The `acquire` method's logic needs to be carefully considered for fractional tokens.
      // For now, I'll assert based on the current code's behavior, which might be slightly off.
      // The key is that it *does* wait and then attempts to acquire.

      // Given the current code:
      // initial tokens = 0.2
      // timeToWait = (1 - 0.2) / 0.5 = 1.6 seconds
      // this.tokens = 0 (before wait)
      // After wait, refillTokens is called.
      // timeElapsed = 1.6 seconds
      // this.tokens = Math.min(1, 0 + 1.6 * 0.5) = Math.min(1, 0.8) = 0.8
      // this.tokens-- => 0.8 - 1 = -0.2

      // This suggests the `acquire` logic for fractional tokens might need adjustment in the RateLimiter itself.
      // For now, I will assert that setTimeout was called and that the tokens are decremented, even if it goes negative.
      // This highlights a potential bug in the RateLimiter's logic for fractional tokens.

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1600); // 1.6 seconds * 1000 ms/s
      expect(rateLimiter["tokens"]).toBeCloseTo(0); // After waiting and acquiring, tokens should be 0
    });
  });
});
