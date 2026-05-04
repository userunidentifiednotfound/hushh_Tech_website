import { describe, it, expect } from "vitest";
import { sendSafeError, sendUpstreamError } from "../api/shared/errorResponse.js";

function makeRes() {
  let _status = null;
  let _body = null;
  const res = {
    status(code) { _status = code; return res; },
    json(data) { _body = data; return res; },
    get _status() { return _status; },
    get _body() { return _body; },
  };
  return res;
}

describe("sendSafeError", () => {
  it("returns the given HTTP status code", () => {
    const res = makeRes();
    sendSafeError(res, new Error("db connection refused"), { status: 503 });
    expect(res._status).toBe(503);
  });

  it("never includes the raw error message in the response body", () => {
    const res = makeRes();
    const secret = "SUPABASE_SERVICE_ROLE_KEY=super_secret_value";
    sendSafeError(res, new Error(secret), { status: 500 });
    expect(JSON.stringify(res._body)).not.toContain(secret);
  });

  it("always includes a correlationId in the response", () => {
    const res = makeRes();
    sendSafeError(res, new Error("boom"), { status: 500 });
    expect(typeof res._body.correlationId).toBe("string");
    expect(res._body.correlationId.length).toBeGreaterThan(0);
  });

  it("uses the custom clientMessage when provided", () => {
    const res = makeRes();
    sendSafeError(res, new Error("internal"), { status: 400, clientMessage: "Bad input." });
    expect(res._body.error).toBe("Bad input.");
  });

  it("falls back to a generic message for unknown status codes", () => {
    const res = makeRes();
    sendSafeError(res, new Error("weird"), { status: 418 });
    expect(typeof res._body.error).toBe("string");
    expect(res._body.error.length).toBeGreaterThan(0);
  });

  it("handles non-Error objects without throwing", () => {
    const res = makeRes();
    expect(() => sendSafeError(res, { code: "ECONNRESET" }, { status: 500 })).not.toThrow();
    expect(res._status).toBe(500);
  });
});

describe("sendUpstreamError", () => {
  it("always returns 502 regardless of upstream status", () => {
    const res = makeRes();
    sendUpstreamError(res, { upstream: "openai", status: 401, body: "Unauthorized" });
    expect(res._status).toBe(502);
  });

  it("does not forward the upstream body to the client", () => {
    const res = makeRes();
    const sensitiveBody = '{"error":"invalid_api_key","message":"sk-proj-abc123"}';
    sendUpstreamError(res, { upstream: "openai", status: 401, body: sensitiveBody });
    expect(JSON.stringify(res._body)).not.toContain("sk-proj-abc123");
    expect(JSON.stringify(res._body)).not.toContain("invalid_api_key");
  });

  it("includes a correlationId", () => {
    const res = makeRes();
    sendUpstreamError(res, { upstream: "openai", status: 500, body: "Server Error" });
    expect(typeof res._body.correlationId).toBe("string");
  });
});
