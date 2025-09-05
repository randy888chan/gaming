import { cn, formatCurrency, formatDate } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2', null, 'class3')).toBe('class1 class2 class3');
      expect(cn('class1', false, 'class2', true, 'class3')).toBe('class1 class2 class3');
    });

    it('handles empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn(undefined, null, false)).toBe('');
    });

    it('handles single class name', () => {
      expect(cn('single-class')).toBe('single-class');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency with default USD', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
      expect(formatCurrency(0)).toBe('$0');
    });

    it('formats currency with specified currency code', () => {
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000');
      expect(formatCurrency(1000, 'GBP')).toBe('£1,000');
    });

    it('handles decimal numbers', () => {
      expect(formatCurrency(1000.5)).toBe('$1,001'); // Rounds to nearest integer
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-06-15T14:30:00Z');
      // Note: The actual output may vary based on the user's timezone
      expect(formatDate(date)).toMatch(/\w{3} \d{1,2}, \d{1,2}:\d{2} [AP]M/);
    });

    it('formats different months correctly', () => {
      const janDate = new Date('2023-01-01T12:00:00Z');
      const decDate = new Date('2023-12-31T12:00:00Z');
      
      expect(formatDate(janDate)).toMatch(/Jan/);
      expect(formatDate(decDate)).toMatch(/Dec/);
    });
  });
});