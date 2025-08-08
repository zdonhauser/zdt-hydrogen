interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
}

// In-memory rate limiting (resets on server restart)
// For production, consider using Redis or a database
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries when checking (passive cleanup)
function cleanupOldEntries() {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.firstAttempt < oneHourAgo) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkForSpam(formData: FormData, clientIP?: string): SpamCheckResult {
  // 1. Check honeypot field (hidden field that should be empty)
  const honeypot = formData.get('website') || formData.get('url') || formData.get('company');
  if (honeypot && String(honeypot).trim() !== '') {
    return { isSpam: true, reason: 'Honeypot field filled' };
  }

  // 2. Check submission time (forms submitted too quickly are likely spam)
  const submissionTime = formData.get('submission_time');
  if (submissionTime) {
    const timeTaken = Date.now() - parseInt(String(submissionTime), 10);
    if (timeTaken < 3000) { // Less than 3 seconds
      return { isSpam: true, reason: 'Form submitted too quickly' };
    }
  }

  // 3. Rate limiting by IP
  if (clientIP) {
    // Clean up old entries periodically (passive cleanup)
    if (rateLimitMap.size > 100) {
      cleanupOldEntries();
    }
    
    const now = Date.now();
    const rateLimitWindow = 60 * 1000; // 1 minute
    const maxRequests = 3; // Max 3 submissions per minute

    const entry = rateLimitMap.get(clientIP);
    
    if (entry) {
      const timeSinceFirst = now - entry.firstAttempt;
      
      if (timeSinceFirst < rateLimitWindow) {
        if (entry.count >= maxRequests) {
          return { isSpam: true, reason: 'Too many submissions' };
        }
        entry.count++;
      } else {
        // Reset the window
        rateLimitMap.set(clientIP, { count: 1, firstAttempt: now });
      }
    } else {
      rateLimitMap.set(clientIP, { count: 1, firstAttempt: now });
    }
  }

  // 4. Content-based checks
  const message = String(formData.get('message') || '');
  const email = String(formData.get('email') || '');
  const name = String(formData.get('name') || formData.get('contactName') || '');

  // Check for common spam patterns
  const spamPatterns = [
    /viagra|cialis|levitra|pharmaceutical/i,
    /casino|poker|blackjack|slots/i,
    /cryptocurrency|bitcoin|ethereum|nft/i,
    /click here|buy now|limited time offer/i,
    /congratulations.*won|winner.*selected/i,
    /earn.*money.*fast|make.*\$\d+.*day/i,
    /free.*money|cash.*bonus/i,
    /weight.*loss|diet.*pill/i,
    /nigerian.*prince|inheritance.*million/i,
    /http[s]?:\/\/[^\s]+/g, // Multiple URLs in message
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(message) || pattern.test(name)) {
      return { isSpam: true, reason: 'Spam content detected' };
    }
  }

  // Check for excessive URLs
  const urlMatches = message.match(/http[s]?:\/\/[^\s]+/g) || [];
  if (urlMatches.length > 2) {
    return { isSpam: true, reason: 'Too many URLs' };
  }

  // Check for suspicious email patterns
  const suspiciousEmailPatterns = [
    /^[a-z0-9]{20,}@/, // Very long random email prefix
    /@(mailinator|guerrillamail|10minutemail|tempmail)/i, // Temporary email services
  ];

  for (const pattern of suspiciousEmailPatterns) {
    if (pattern.test(email)) {
      return { isSpam: true, reason: 'Suspicious email address' };
    }
  }

  // 5. Check for gibberish or repeated characters
  if (containsGibberish(message) || containsGibberish(name)) {
    return { isSpam: true, reason: 'Gibberish content detected' };
  }

  return { isSpam: false };
}

function containsGibberish(text: string): boolean {
  if (!text) return false;
  
  // Check for excessive repeated characters
  if (/(.)\1{4,}/i.test(text)) {
    return true;
  }
  
  // Check for random character sequences (consonant clusters)
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (word.length > 5) {
      const consonantRatio = (word.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length / word.length;
      if (consonantRatio > 0.75) {
        return true;
      }
    }
  }
  
  return false;
}

export function getClientIP(request: Request): string | undefined {
  // Try various headers that might contain the client IP
  const headers = request.headers;
  
  // Common headers set by proxies and load balancers
  const possibleHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'fastly-client-ip', // Fastly
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];
  
  for (const header of possibleHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for might contain multiple IPs, get the first one
      const ip = value.split(',')[0].trim();
      if (ip) return ip;
    }
  }
  
  return undefined;
}

export function generateHoneypotField(): string {
  return `
    <div style="position: absolute; left: -9999px; top: -9999px; opacity: 0; height: 0; width: 0; pointer-events: none;">
      <label htmlFor="website" aria-hidden="true" tabIndex={-1}>
        Website
      </label>
      <input
        type="text"
        id="website"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
    </div>
  `;
}