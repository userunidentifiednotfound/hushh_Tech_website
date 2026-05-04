/**
 * Tests for api/shared/rateLimiter.js
 *
 * Covers:
 *  - checkRateLimit sliding-window logic
 *  - getClientIp extraction (X-Forwarded-For, socket, fallback)
 *  - isAllowedOrigin allowlist
 *  - applyCors header injection and 403 rejection
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, getClientIp, isAllowedOrigin, applyCors } from "../api/shared/rateLimiter.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeReq(overrides = {}) {
  return {
    headers: {},
    socket: { remoteAddress: "1.2.3.4" },
    ip: undefined,
    method: "POST",
    ...overrides,
  };
}

function makeRes() {
  const headers = {};
  let statusCode = null;
  let body = null;

  const res = {
    _headers: headers,
    _status: null,
    _body: null,
    setHeader(name, value) {
      headers[name] = value;
    },
    status(code) {
      statusCode = code;
      res._status = code;
      return res;
    },
    json(data) {
      body = data;
      res._body = data;
      return res;
    },
    end() {
      return res;
    },
  };

  return res;
}

// ---------------------------------------------------------------------------
// getClientIp
// ---------------------------------------------------------------------------

describe("getClientIp", () => {
  it("prefers X-Forwarded-For first IP", () => {
    const req = makeReq({ headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2" } });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("falls back to socket.remoteAddress", () => {
    const req = makeReq({ headers: {} });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to req.ip when socket is absent", () => {
    const req = makeReq({ headers: {}, socket: undefined, ip: "5.6.7.8" });
    expect(getClientIp(req)).toBe("5.6.7.8");
  });

  it("returns 'unknown' when nothing is available", () => {
    const req = makeReq({ headers: {}, socket: undefined, ip: undefined });
    expect(getClientIp(req)).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// checkRateLimit
// ---------------------------------------------------------------------------

describe("checkRateLimit", () => {
  it("allows the first request", () => {
    const req = makeReq({ headers: { "x-forwarded-for": `${Date.now()}.0.0.1` } });
    const result = checkRateLimit(req, { route: "test-route", maxRequests: 3, windowMs: 60_000 });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks after maxRequests is exceeded", () => {
    const ip = `${Date.now()}.1.1.1`;
    const req = makeReq({ headers: { "x-forwarded-for": ip } });
    const opts = { route: "block-test", maxRequests: 2, windowMs: 60_000 };

    checkRateLimit(req, opts); // 1
    checkRateLimit(req, opts); // 2
    const result = checkRateLimit(req, opts); // 3 — over limit

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const ip = `${Date.now()}.2.2.2`;
    const req = makeReq({ headers: { "x-forwarded-for": ip } });
    const opts = { route: "window-test", maxRequests: 1, windowMs: 50 };

    checkRateLimit(req, opts); // 1 — at limit
    const blocked = checkRateLimit(req, opts); // 2 — over limit
    expect(blocked.allowed).toBe(false);

    // Wait for the window to expire.
    await new Promise((r) => setTimeout(r, 60));

    const reset = checkRateLimit(req, opts); // fresh window
    expect(reset.allowed).toBe(true);
  });

  it("isolates different routes for the same IP", () => {
    const ip = `${Date.now()}.3.3.3`;
    const req = makeReq({ headers: { "x-forwarded-for": ip } });

    checkRateLimit(req, { route: "route-a", maxRequests: 1, windowMs: 60_000 });
    const overA = checkRateLimit(req, { route: "route-a", maxRequests: 1, windowMs: 60_000 });
    const firstB = checkRateLimit(req, { route: "route-b", maxRequests: 1, windowMs: 60_000 });

    expect(overA.allowed).toBe(false);
    expect(firstB.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isAllowedOrigin
// ---------------------------------------------------------------------------

describe("isAllowedOrigin", () => {
  it("allows hushhtech.com", () => {
    expect(isAllowedOrigin("https://hushhtech.com")).toBe(true);
  });

  it("allows www.hushhtech.com", () => {
    expect(isAllowedOrigin("https://www.hushhtech.com")).toBe(true);
  });

  it("rejects an arbitrary external origin", () => {
    expect(isAllowedOrigin("https://evil.example.com")).toBe(false);
  });

  it("allows undefined origin (server-to-server)", () => {
    expect(isAllowedOrigin(undefined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// applyCors
// ---------------------------------------------------------------------------

describe("applyCors", () => {
  it("sets CORS headers for an allowed origin", () => {
    const req = makeReq({ headers: { origin: "https://hushhtech.com" }, method: "POST" });
    const res = makeRes();
    const result = applyCors(req, res);
    expect(result).toBe(true);
    expect(res._headers["Access-Control-Allow-Origin"]).toBe("https://hushhtech.com");
  });

  it("rejects POST from a disallowed origin with 403", () => {
    const req = makeReq({ headers: { origin: "https://attacker.io" }, method: "POST" });
    const res = makeRes();
    const result = applyCors(req, res);
    expect(result).toBe(false);
    expect(res._status).toBe(403);
  });

  it("allows GET from any origin (public read)", () => {
    const req = makeReq({ headers: { origin: "https://attacker.io" }, method: "GET" });
    const res = makeRes();
    const result = applyCors(req, res);
    expect(result).toBe(true);
  });

  it("allows OPTIONS preflight from any origin", () => {
    const req = makeReq({ headers: { origin: "https://attacker.io" }, method: "OPTIONS" });
    const res = makeRes();
    const result = applyCors(req, res);
    expect(result).toBe(true);
  });
});
