// Security headers middleware (replaces helmet which has issues with Node 24).
// Sets recommended HTTP security headers to protect against common attacks.

export function securityHeaders(req, res, next) {
  // Prevents MIME type sniffing (e.g., treating a .txt as .html)
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Controls how much referrer info is sent with requests
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Prevents the page from being embedded in iframes (clickjacking protection)
  res.setHeader("X-Frame-Options", "DENY");

  // Enables browser XSS protection
  res.setHeader("X-XSS-Protection", "0");

  // Controls which browser features the site can use
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Enforces HTTPS (only effective when served over HTTPS)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  next();
}
