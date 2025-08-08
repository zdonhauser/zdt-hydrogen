/**
 * Security utilities for form data sanitization and validation
 */

// HTML entities that need escaping to prevent XSS
const htmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

/**
 * Escape HTML characters to prevent XSS attacks
 */
export function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text).replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize form input to prevent injection attacks
 * - Removes script tags
 * - Escapes HTML entities
 * - Trims whitespace
 * - Limits length
 */
export function sanitizeInput(
  input: FormDataEntryValue | null,
  maxLength: number = 10000
): string {
  if (!input) return '';
  
  let sanitized = String(input);
  
  // Remove any script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove any on* event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);
  
  return sanitized;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  // Check if it's a valid phone number (10-15 digits)
  return /^\+?\d{10,15}$/.test(cleaned);
}

/**
 * Check for SQL injection patterns
 */
export function containsSqlInjectionPatterns(text: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|FROM|WHERE)\b)/i,
    /(--|#|\/\*|\*\/)/,  // SQL comment patterns
    /(\bOR\b.*=.*)/i,     // OR 1=1 pattern
    /(\bAND\b.*=.*)/i,    // AND 1=1 pattern
    /(';|";)/,            // Quote semicolon combinations
  ];
  
  return sqlPatterns.some(pattern => pattern.test(text));
}

/**
 * Check for NoSQL injection patterns
 */
export function containsNoSqlInjectionPatterns(text: string): boolean {
  const noSqlPatterns = [
    /\$\{.*\}/,           // Template literal injection
    /\$where/i,           // MongoDB $where
    /\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin/i, // MongoDB operators
    /{.*:.*}/,            // JSON-like object patterns
  ];
  
  return noSqlPatterns.some(pattern => pattern.test(text));
}

/**
 * Comprehensive security check for form data
 */
export interface SecurityCheckResult {
  isValid: boolean;
  errors: string[];
  sanitizedData: Record<string, string>;
}

export function performSecurityCheck(
  formData: FormData,
  requiredFields: string[] = []
): SecurityCheckResult {
  const errors: string[] = [];
  const sanitizedData: Record<string, string> = {};
  
  // Check required fields
  for (const field of requiredFields) {
    const value = formData.get(field);
    if (!value || String(value).trim() === '') {
      errors.push(`${field} is required`);
    }
  }
  
  // Process all form fields
  for (const [key, value] of formData.entries()) {
    const stringValue = String(value);
    
    // Skip honeypot and system fields
    if (key === 'website' || key === 'url' || key === 'company' || key === 'submission_time') {
      continue;
    }
    
    // Check for injection patterns
    if (containsSqlInjectionPatterns(stringValue)) {
      errors.push(`Invalid characters detected in ${key}`);
      console.warn(`Potential SQL injection attempt in field: ${key}`);
    }
    
    if (containsNoSqlInjectionPatterns(stringValue)) {
      errors.push(`Invalid characters detected in ${key}`);
      console.warn(`Potential NoSQL injection attempt in field: ${key}`);
    }
    
    // Sanitize and store
    sanitizedData[key] = sanitizeInput(value);
    
    // Additional validation for specific fields
    if (key === 'email' && value) {
      if (!isValidEmail(stringValue)) {
        errors.push('Invalid email format');
      }
    }
    
    if ((key === 'phone' || key.includes('Phone')) && value && stringValue.trim() !== '') {
      if (!isValidPhone(stringValue)) {
        errors.push(`Invalid phone number format for ${key}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
}

/**
 * Create a Content Security Policy header
 */
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.shopify.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://eon2vfigqmpnne.m.pipedream.net",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}