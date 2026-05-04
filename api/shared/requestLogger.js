/**
 * Structured request/response logger for Cloud Run.
 * Emits JSON lines that Cloud Logging parses natively via httpRequest fields.
 * Sensitive headers (Authorization, Cookie, Set-Cookie) are redacted.
 */

import { randomUUID } from "node:crypto";

const REDACTED_REQUEST_HEADERS = new Set(["authorization", "cookie", "x-api-key", "x-auth-token"]);
const REDACTED_RESPONSE_HEADERS = new Set(["set-cookie"]);

function sanitiseHeaders(headers, redactSet) {
  const out = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    const lower = key.toLowerCase();
    out[lower] = redactSet.has(lower) ? "[REDACTED]" : (Array.isArray(value) ? value.join(", ") : String(value ?? ""));
  }
  return out;
}

export function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? req.ip ?? "unknown";
}

function severityFromStatus(status) {
  if (status >= 500) return "ERROR";
  if (status >= 400) return "WARNING";
  return "INFO";
}

export function requestLoggerMiddleware(req, res, next) {
  const startMs = Date.now();
  const correlationId = randomUUID();
  req.correlationId = correlationId;

  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const latencyMs = Date.now() - startMs;
    const status = res.statusCode ?? 0;
    process.stdout.write(JSON.stringify({
      severity: severityFromStatus(status),
      correlationId,
      message: `${req.method} ${req.path} ${status} ${latencyMs}ms`,
      httpRequest: {
        requestMethod: req.method,
        requestUrl: req.originalUrl ?? req.url,
        status,
        latency: `${(latencyMs / 1000).toFixed(3)}s`,
        remoteIp: getClientIp(req),
        userAgent: req.headers?.["user-agent"] ?? "",
        referer: req.headers?.referer ?? req.headers?.referrer ?? "",
        protocol: req.protocol ?? "https",
      },
      requestHeaders: sanitiseHeaders(req.headers, REDACTED_REQUEST_HEADERS),
      responseHeaders: sanitiseHeaders(res.getHeaders?.() ?? {}, REDACTED_RESPONSE_HEADERS),
    }) + "\n");
    return originalEnd(...args);
  };

  next();
}

export function logEvent(severity, message, extra = {}) {
  process.stdout.write(JSON.stringify({ severity, message, timestamp: new Date().toISOString(), ...extra }) + "\n");
}
