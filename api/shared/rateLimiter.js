/**
 * In-process rate limiter for Cloud Run API routes.
 *
 * Uses a sliding-window counter keyed by (route, clientIp).
 * Entries are evicted lazily to keep memory bounded.
 *
 * Limits are intentionally conservative for sensitive routes
 * (email, profile generation, account deletion) and more
 * permissive for analytics/public reads.
 */

const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 20;

/** @type {Map<string, { count: number; windowStart: number }>} */
const store = new Map();

// Evict stale entries every 5 minutes to prevent unbounded growth.
const EVICTION_INTERVAL_MS = 5 * 60 * 1000;
let lastEviction = Date.now();

function evictStaleEntries(windowMs) {
  const now = Date.now();
  if (now - lastEviction < EVICTION_INTERVAL_MS) return;
  lastEviction = now;

  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > windowMs * 2) {
      store.delete(key);
    }
  }
}

/**
 * Extract the best available client IP from the request.
 * Cloud Run sits behind Google's load balancer which sets X-Forwarded-For.
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    // Take the first (leftmost) IP — the original client.
    return forwarded.split(",")[0].trim();
  }
  return (
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

/**
 * Check whether the request is within the allowed rate limit.
 *
 * @param {import('express').Request} req
 * @param {object} options
 * @param {string}  options.route       - Logical route name used as part of the key.
 * @param {number} [options.windowMs]   - Rolling window in milliseconds.
 * @param {number} [options.maxRequests] - Max requests allowed per window.
 * @returns {{ allowed: boolean; remaining: number; resetAt: number }}
 */
export function checkRateLimit(req, {
  route,
  windowMs = DEFAULT_WINDOW_MS,
  maxRequests = DEFAULT_MAX_REQUESTS,
} = {}) {
  evictStaleEntries(windowMs);

  const ip = getClientIp(req);
  const key = `${route}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    // Start a fresh window.
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetAt = entry.windowStart + windowMs;

  return { allowed: entry.count <= maxRequests, remaining, resetAt };
}

/**
 * Express middleware factory.
 *
 * Usage:
 *   app.post('/api/send-email-notification', rateLimitMiddleware({ route: 'send-email', maxRequests: 5 }), handler);
 *
 * @param {object} options
 * @param {string}  options.route
 * @param {number} [options.windowMs]
 * @param {number} [options.maxRequests]
 * @returns {import('express').RequestHandler}
 */
export function rateLimitMiddleware({ route, windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS }) {
  return (req, res, next) => {
    const result = checkRateLimit(req, { route, windowMs, maxRequests });

    // Always expose rate-limit headers so clients can back off gracefully.
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", result.remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetAt / 1000));

    if (!result.allowed) {
      res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
      return res.status(429).json({
        error: "Too many requests. Please slow down and try again shortly.",
        retryAfterSeconds: Math.ceil(windowMs / 1000),
      });
    }

    next();
  };
}

/**
 * Allowed origins for CORS on API routes.
 * Requests from unlisted origins receive a 403 on non-GET routes.
 */
const ALLOWED_ORIGINS = new Set([
  "https://hushhtech.com",
  "https://www.hushhtech.com",
  // Allow localhost variants for local development only.
  ...(process.env.NODE_ENV !== "production"
    ? ["http://localhost:5173", "http://localhost:3000", "http://localhost:3005"]
    : []),
]);

/**
 * Validate the Origin header against the allowlist.
 *
 * @param {string | undefined} origin
 * @returns {boolean}
 */
export function isAllowedOrigin(origin) {
  if (!origin) return true; // Server-to-server calls have no Origin.
  return ALLOWED_ORIGINS.has(origin.trim());
}

/**
 * Apply strict CORS headers to a response.
 * Returns false and sends a 403 if the origin is not allowed on a mutating method.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {boolean} true if the request should proceed, false if it was rejected.
 */
export function applyCors(req, res) {
  const origin = req.headers?.origin;
  const allowed = isAllowedOrigin(origin);

  if (origin && allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "600");

  // Reject mutating requests from disallowed origins.
  if (!allowed && req.method !== "GET" && req.method !== "OPTIONS") {
    res.status(403).json({ error: "Origin not allowed" });
    return false;
  }

  return true;
}
