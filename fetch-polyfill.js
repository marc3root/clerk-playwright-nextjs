/**
 * Fetch polyfill to fix Clerk API connectivity issue.
 * 
 * Problem: Node.js built-in fetch (v20+) triggers Cloudflare's bot protection
 * when connecting to api.clerk.com, resulting in 400 Bad Request errors.
 * 
 * Solution: Intercept fetch calls to api.clerk.com and use Node's https module
 * instead, which Cloudflare accepts. This polyfill only affects Clerk API requests;
 * all other fetch calls use the original implementation.
 */

const https = require('https');

// Polyfill fetch for Clerk API to work around Cloudflare + Node.js fetch issue
const originalFetch = global.fetch;

global.fetch = async function(url, options = {}) {
  // Only intercept Clerk API requests
  if (typeof url === 'string' && url.includes('api.clerk.com')) {
    const urlObj = new URL(url);
    
    return new Promise((resolve, reject) => {
      const postData = options.body || '';
      
      // Convert Headers object to plain object if needed
      let headers = {};
      if (options.headers) {
        if (options.headers instanceof Headers || typeof options.headers.forEach === 'function') {
          options.headers.forEach((value, key) => {
            headers[key] = value;
          });
        } else {
          headers = { ...options.headers };
        }
      }
      
      const reqOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Length': Buffer.byteLength(postData),
          ...headers
        }
      };
      
      const req = https.request(reqOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const response = {
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: new Map(Object.entries(res.headers)),
            json: async () => JSON.parse(data),
            text: async () => data,
            arrayBuffer: async () => Buffer.from(data),
            blob: async () => new Blob([data])
          };
          resolve(response);
        });
      });
      
      req.on('error', reject);
      
      if (postData) {
        req.write(postData);
      }
      req.end();
    });
  }
  
  // Use original fetch for other requests
  return originalFetch(url, options);
};

module.exports = {};
