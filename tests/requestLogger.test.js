import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { requestLoggerMiddleware, logEvent } from "../api/shared/requestLogger.js";

function makeReq(overrides = {}) {
  return { method: "GET", path: "/api/test", originalUrl: "/api/test", protocol: "https", headers: { "user-agent": "vitest", "x-forwarded-for": "10.0.0.1" }, socket: { remoteAddress: "127.0.0.1" }, ip: undefined, correlationId: undefined, ...overrides };
}
function makeRes(statusCode = 200) {
  const _headers = {};
  return { statusCode, end: vi.fn(), getHeaders: () => _headers, setHeader(k, v) { _headers[k] = v; }, _headers };
}

describe("requestLoggerMiddleware", () => {
  let spy, lines;
  beforeEach(() => { lines = []; spy = vi.spyOn(process.stdout, "write").mockImplementation(l => { lines.push(l); return true; }); });
  afterEach(() => spy.mockRestore());

  it("calls next()", () => { const next = vi.fn(); requestLoggerMiddleware(makeReq(), makeRes(), next); expect(next).toHaveBeenCalledOnce(); });
  it("attaches correlationId to req", () => { const req = makeReq(); requestLoggerMiddleware(req, makeRes(), vi.fn()); expect(typeof req.correlationId).toBe("string"); });
  it("writes JSON log on res.end()", () => { const res = makeRes(200); requestLoggerMiddleware(makeReq(), res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).httpRequest.status).toBe(200); });
  it("sets WARNING for 4xx", () => { const res = makeRes(404); requestLoggerMiddleware(makeReq(), res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).severity).toBe("WARNING"); });
  it("sets ERROR for 5xx", () => { const res = makeRes(500); requestLoggerMiddleware(makeReq(), res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).severity).toBe("ERROR"); });
  it("redacts Authorization header", () => { const req = makeReq({ headers: { authorization: "Bearer secret-token", "user-agent": "v", "x-forwarded-for": "1.1.1.1" } }); const res = makeRes(); requestLoggerMiddleware(req, res, vi.fn()); res.end(); const parsed = JSON.parse(lines[0]); expect(parsed.requestHeaders.authorization).toBe("[REDACTED]"); expect(JSON.stringify(parsed)).not.toContain("secret-token"); });
  it("redacts Cookie header", () => { const req = makeReq({ headers: { cookie: "session=abc123", "user-agent": "v", "x-forwarded-for": "1.1.1.1" } }); const res = makeRes(); requestLoggerMiddleware(req, res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).requestHeaders.cookie).toBe("[REDACTED]"); });
  it("redacts Set-Cookie response header", () => { const res = makeRes(200); res.setHeader("set-cookie", "session=secret; HttpOnly"); requestLoggerMiddleware(makeReq(), res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).responseHeaders["set-cookie"]).toBe("[REDACTED]"); });
  it("includes correlationId in log", () => { const req = makeReq(); const res = makeRes(); requestLoggerMiddleware(req, res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).correlationId).toBe(req.correlationId); });
  it("uses X-Forwarded-For as remoteIp", () => { const req = makeReq({ headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1" } }); const res = makeRes(); requestLoggerMiddleware(req, res, vi.fn()); res.end(); expect(JSON.parse(lines[0]).httpRequest.remoteIp).toBe("203.0.113.5"); });
});

describe("logEvent", () => {
  let spy, lines;
  beforeEach(() => { lines = []; spy = vi.spyOn(process.stdout, "write").mockImplementation(l => { lines.push(l); return true; }); });
  afterEach(() => spy.mockRestore());

  it("writes valid JSON", () => { logEvent("INFO", "started", { port: 8080 }); const p = JSON.parse(lines[0]); expect(p.severity).toBe("INFO"); expect(p.port).toBe(8080); });
  it("includes timestamp", () => { logEvent("WARNING", "high mem"); expect(new Date(JSON.parse(lines[0]).timestamp).getTime()).not.toBeNaN(); });
});
