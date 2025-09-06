/**
 * Database security utilities tests
 */

import {
  sanitizeInput,
  isPotentiallyDangerous,
  validateQueryParams,
  createSafeQuery,
  escapeLikePattern,
  isValidIdentifier,
  createParameterizedQuery,
  sanitizeIdentifier
} from './databaseSecurity';

describe('Database Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should sanitize dangerous characters', () => {
      const input = "test'; DROP TABLE users; --";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe("test' DROP TABLE users --");
    });

    it('should return empty string for non-string inputs', () => {
      expect(sanitizeInput(123 as any)).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    it('should trim whitespace', () => {
      const input = "  test input  ";
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe("test input");
    });
  });

  describe('isPotentiallyDangerous', () => {
    it('should detect dangerous SQL keywords', () => {
      expect(isPotentiallyDangerous("SELECT * FROM users")).toBe(true);
      expect(isPotentiallyDangerous("DROP TABLE users")).toBe(true);
      expect(isPotentiallyDangerous("INSERT INTO users VALUES (1)")).toBe(true);
    });

    it('should detect dangerous patterns', () => {
      expect(isPotentiallyDangerous("test'; DROP TABLE users; --")).toBe(true);
      expect(isPotentiallyDangerous("test OR 1=1")).toBe(true);
    });

    it('should return false for safe inputs', () => {
      expect(isPotentiallyDangerous("test input")).toBe(false);
      expect(isPotentiallyDangerous("user_data_123")).toBe(false);
    });

    it('should return true for non-string inputs', () => {
      expect(isPotentiallyDangerous(123 as any)).toBe(true);
      expect(isPotentiallyDangerous(null as any)).toBe(true);
      expect(isPotentiallyDangerous(undefined as any)).toBe(true);
    });
  });

  describe('validateQueryParams', () => {
    it('should sanitize string parameters', () => {
      const params = ["test'; DROP TABLE users; --", "safe input"];
      const validated = validateQueryParams(params);
      expect(validated[0]).toBe("test' DROP TABLE users --");
      expect(validated[1]).toBe("safe input");
    });

    it('should validate number parameters', () => {
      const params = [123, 45.67, NaN, Infinity];
      expect(() => validateQueryParams(params)).toThrow('Invalid number parameter');
    });

    it('should pass boolean parameters unchanged', () => {
      const params = [true, false];
      const validated = validateQueryParams(params);
      expect(validated).toEqual([true, false]);
    });

    it('should pass null/undefined parameters unchanged', () => {
      const params = [null, undefined];
      const validated = validateQueryParams(params);
      expect(validated).toEqual([null, undefined]);
    });

    it('should reject dangerous string parameters', () => {
      const params = ["SELECT * FROM users"];
      expect(() => validateQueryParams(params)).toThrow('Potentially dangerous input detected');
    });
  });

  describe('createSafeQuery', () => {
    it('should create a safe query with sanitized parameters', () => {
      const query = "SELECT * FROM users WHERE id = ?";
      const params = ["test'; DROP TABLE users; --"];
      const safeQuery = createSafeQuery(query, params);
      expect(safeQuery.query).toBe(query);
      expect(safeQuery.params[0]).toBe("test' DROP TABLE users --");
    });

    it('should reject dangerous queries', () => {
      const query = "SELECT * FROM users; DROP TABLE users;";
      const params = ["test"];
      expect(() => createSafeQuery(query, params)).toThrow('Potentially dangerous query detected');
    });
  });

  describe('escapeLikePattern', () => {
    it('should escape special LIKE characters', () => {
      const input = "test%_\\pattern";
      const escaped = escapeLikePattern(input);
      expect(escaped).toBe("test\\%\\_\\\\pattern");
    });
  });

  describe('isValidIdentifier', () => {
    it('should validate proper identifiers', () => {
      expect(isValidIdentifier("users")).toBe(true);
      expect(isValidIdentifier("user_data")).toBe(true);
      expect(isValidIdentifier("user-data")).toBe(true);
    });

    it('should reject SQL keywords', () => {
      expect(isValidIdentifier("SELECT")).toBe(false);
      expect(isValidIdentifier("DROP")).toBe(false);
    });

    it('should reject identifiers with special characters', () => {
      expect(isValidIdentifier("users;")).toBe(false);
      expect(isValidIdentifier("user data")).toBe(false);
    });
  });

  describe('createParameterizedQuery', () => {
    it('should validate parameterized queries', () => {
      const query = "SELECT * FROM users WHERE id = ?";
      const params = ["123"];
      const result = createParameterizedQuery(query, params);
      expect(result.query).toBe(query);
      expect(result.params).toEqual(["123"]);
    });

    it('should reject queries without placeholders', () => {
      const query = "SELECT * FROM users";
      const params = ["123"];
      expect(() => createParameterizedQuery(query, params)).toThrow('Query must use parameter placeholders');
    });
  });

  describe('sanitizeIdentifier', () => {
    it('should sanitize identifiers', () => {
      expect(sanitizeIdentifier("users")).toBe("users");
      expect(sanitizeIdentifier("user_data")).toBe("user_data");
      expect(sanitizeIdentifier("user-data")).toBe("user-data");
    });

    it('should remove special characters', () => {
      expect(sanitizeIdentifier("users;")).toBe("users");
      expect(sanitizeIdentifier("user data")).toBe("userdata");
    });

    it('should reject SQL keywords', () => {
      expect(() => sanitizeIdentifier("SELECT")).toThrow('Identifier cannot be a SQL keyword');
    });

    it('should reject non-string inputs', () => {
      expect(() => sanitizeIdentifier(123 as any)).toThrow('Identifier must be a string');
    });
  });
});