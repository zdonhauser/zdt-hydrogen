import {redirect} from '@shopify/remix-oxygen';

/**
 * Domain-based functionality detection
 * Determines if the current request is from a demo subdomain
 */

export function isDemoSite(request: Request): boolean {
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();
  
  // Check for demo subdomain
  return hostname.startsWith('demo.') || hostname.startsWith('localhost')  || hostname.startsWith('10.0') || hostname.startsWith('react.'); 
}

export function getDisplayMode(request: Request): 'demo' | 'public' {
  return isDemoSite(request) ? 'demo' : 'public';
}

/**
 * Protects a route by redirecting to homepage if not on demo site
 * Allows certain collections (like assets) to be accessible on public sites
 */
export function requireDemo(request: Request, allowedHandles: string[] = []) {
  if (!isDemoSite(request)) {
    // Check if this is an allowed collection handle
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // For collections routes like /collections/assets
    if (pathParts[1] === 'collections' && pathParts[2]) {
      const handle = pathParts[2];
      if (allowedHandles.includes(handle)) {
        return; // Allow access to this specific collection
      }
    }
    
    throw redirect('/');
  }
}