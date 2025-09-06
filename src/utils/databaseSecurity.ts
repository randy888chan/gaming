/**
 * Database security utilities for preventing SQL injection and ensuring data integrity
 */

// List of forbidden SQL keywords for basic injection prevention
const FORBIDDEN_SQL_KEYWORDS = [
  'DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE',
  'UNION', 'SELECT', 'FROM', 'WHERE', 'EXEC', 'EXECUTE'
];

// Regular expressions for detecting potentially dangerous patterns
const DANGEROUS_PATTERNS = [
  /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE)\b)/i,
  /(;|--|\/\*|\*\/|xp_)/i,
  /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i // Detect patterns like "OR 1=1"
];

/**
 * Sanitizes user input to prevent SQL injection
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove or escape dangerous characters
  return input
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, '') // Remove null bytes and other dangerous characters
    .trim();
}

/**
 * Validates if input contains potentially dangerous SQL patterns
 * @param input The input to check
 * @returns True if input is potentially dangerous, false otherwise
 */
export function isPotentiallyDangerous(input: string): boolean {
  if (typeof input !== 'string') {
    return true; // Non-string inputs are considered dangerous
  }
  
  const upperInput = input.toUpperCase();
  
  // Check for forbidden keywords
  for (const keyword of FORBIDDEN_SQL_KEYWORDS) {
    if (upperInput.includes(keyword)) {
      return true;
    }
  }
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validates and sanitizes database query parameters
 * @param params The parameters to validate
 * @returns The sanitized parameters
 */
export function validateQueryParams(params: any[]): any[] {
  return params.map(param => {
    if (typeof param === 'string') {
      // If it's a string, sanitize it
      if (isPotentiallyDangerous(param)) {
        throw new Error('Potentially dangerous input detected');
      }
      return sanitizeInput(param);
    } else if (typeof param === 'number') {
      // If it's a number, ensure it's a valid number
      if (isNaN(param) || !isFinite(param)) {
        throw new Error('Invalid number parameter');
      }
      return param;
    } else if (typeof param === 'boolean') {
      // Booleans are safe
      return param;
    } else if (param === null || param === undefined) {
      // Null and undefined are safe
      return param;
    } else {
      // For other types, convert to string and sanitize
      const stringParam = String(param);
      if (isPotentiallyDangerous(stringParam)) {
        throw new Error('Potentially dangerous input detected');
      }
      return sanitizeInput(stringParam);
    }
  });
}

/**
 * Creates a safe database query with parameter binding
 * @param query The SQL query with placeholders
 * @param params The parameters to bind
 * @returns An object with the query and sanitized parameters
 */
export function createSafeQuery(query: string, params: any[] = []): { query: string; params: any[] } {
  // Validate the query doesn't contain dangerous patterns
  if (isPotentiallyDangerous(query)) {
    throw new Error('Potentially dangerous query detected');
  }
  
  // Sanitize parameters
  const sanitizedParams = validateQueryParams(params);
  
  return {
    query: query,
    params: sanitizedParams
  };
}

/**
 * Escapes special characters in a string for LIKE queries
 * @param input The input string
 * @returns The escaped string
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/([%_\\])/g, '\\$1');
}

/**
 * Validates table or column names to prevent injection
 * @param name The name to validate
 * @returns True if valid, false otherwise
 */
export function isValidIdentifier(name: string): boolean {
  // Table and column names should only contain alphanumeric characters, underscores, and hyphens
  // and should not match SQL keywords
  if (typeof name !== 'string') {
    return false;
  }
  
  const upperName = name.toUpperCase();
  
  // Check if it's a SQL keyword
  if (FORBIDDEN_SQL_KEYWORDS.includes(upperName)) {
    return false;
  }
  
  // Check format (alphanumeric, underscore, hyphen only)
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Creates a parameterized query to prevent SQL injection
 * @param query The SQL query with placeholders
 * @param params The parameters to bind
 * @returns A safe query object
 */
export function createParameterizedQuery(query: string, params: any[]): { query: string; params: any[] } {
  // Validate that the query uses proper parameter placeholders
  if (!query.includes('?') && !query.includes('$1')) {
    throw new Error('Query must use parameter placeholders (? or $1, $2, etc.)');
  }
  
  // Validate parameters
  const validatedParams = validateQueryParams(params);
  
  return {
    query,
    params: validatedParams
  };
}

/**
 * Validates and sanitizes database identifiers (table names, column names)
 * @param identifier The identifier to validate
 * @returns The sanitized identifier
 */
export function sanitizeIdentifier(identifier: string): string {
  if (typeof identifier !== 'string') {
    throw new Error('Identifier must be a string');
  }
  
  // Remove any characters that are not alphanumeric, underscore, or hyphen
  const sanitized = identifier.replace(/[^a-zA-Z0-9_-]/g, '');
  
  if (!sanitized) {
    throw new Error('Invalid identifier');
  }
  
  // Check if it's a forbidden keyword
  const upperIdentifier = sanitized.toUpperCase();
  if (FORBIDDEN_SQL_KEYWORDS.includes(upperIdentifier)) {
    throw new Error('Identifier cannot be a SQL keyword');
  }
  
  return sanitized;
}