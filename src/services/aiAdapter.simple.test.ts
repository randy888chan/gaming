/**
 * Simple test for aiAdapter
 */

describe('aiAdapter', () => {
  it('should be able to import the adapter', async () => {
    // This is a very basic test just to ensure the file can be imported
    const module = await import('./aiAdapter');
    expect(module).toBeDefined();
    expect(typeof module.getSmartBetSuggestion).toBe('function');
    expect(typeof module.generateTextContent).toBe('function');
    expect(typeof module.generatePSEOContent).toBe('function');
    expect(typeof module.generateSocialPost).toBe('function');
  });

  describe('aiAdapter functions', () => {
    let originalFetch: typeof fetch;
    
    beforeEach(() => {
      // Save the original fetch
      originalFetch = global.fetch;
    });
    
    afterEach(() => {
      // Restore the original fetch
      global.fetch = originalFetch;
    });

    it('should have getSmartBetSuggestion function', async () => {
      const module = await import('./aiAdapter');
      expect(typeof module.getSmartBetSuggestion).toBe('function');
    });

    it('should have generateTextContent function', async () => {
      const module = await import('./aiAdapter');
      expect(typeof module.generateTextContent).toBe('function');
    });

    it('should have generatePSEOContent function', async () => {
      const module = await import('./aiAdapter');
      expect(typeof module.generatePSEOContent).toBe('function');
    });

    it('should have generateSocialPost function', async () => {
      const module = await import('./aiAdapter');
      expect(typeof module.generateSocialPost).toBe('function');
    });
  });
});