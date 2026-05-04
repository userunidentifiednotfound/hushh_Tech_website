import { describe, it, expect } from "vitest";
import { sanitizeInternalRedirect, DEFAULT_AUTH_REDIRECT } from "../src/utils/security";

const FALLBACK = DEFAULT_AUTH_REDIRECT;

describe("sanitizeInternalRedirect — happy paths", () => {
  it("returns a simple internal path unchanged", () => {
    expect(sanitizeInternalRedirect("/hushh-user-profile")).toBe("/hushh-user-profile");
  });

  it("preserves query strings on internal paths", () => {
    expect(sanitizeInternalRedirect("/onboarding?step=2")).toBe("/onboarding?step=2");
  });

  it("preserves hash fragments on internal paths", () => {
    expect(sanitizeInternalRedirect("/profile#section")).toBe("/profile#section");
  });

  it("returns the fallback for null", () => {
    expect(sanitizeInternalRedirect(null)).toBe(FALLBACK);
  });

  it("returns the fallback for undefined", () => {
    expect(sanitizeInternalRedirect(undefined)).toBe(FALLBACK);
  });

  it("returns the fallback for an empty string", () => {
    expect(sanitizeInternalRedirect("")).toBe(FALLBACK);
  });
});

describe("sanitizeInternalRedirect — open-redirect rejection", () => {
  it("rejects an absolute external URL", () => {
    expect(sanitizeInternalRedirect("https://evil.com/steal")).toBe(FALLBACK);
  });

  it("rejects a protocol-relative URL", () => {
    expect(sanitizeInternalRedirect("//evil.com/steal")).toBe(FALLBACK);
  });

  it("rejects a javascript: URI", () => {
    expect(sanitizeInternalRedirect("javascript:alert(1)")).toBe(FALLBACK);
  });

  it("rejects a data: URI", () => {
    expect(sanitizeInternalRedirect("data:text/html,<script>alert(1)</script>")).toBe(FALLBACK);
  });
});

describe("sanitizeInternalRedirect — header-injection rejection", () => {
  it("rejects a path with an encoded newline (%0a)", () => {
    expect(sanitizeInternalRedirect("/path%0aSet-Cookie:evil=1")).toBe(FALLBACK);
  });

  it("rejects a path with an encoded carriage return (%0d)", () => {
    expect(sanitizeInternalRedirect("/path%0dSet-Cookie:evil=1")).toBe(FALLBACK);
  });

  it("rejects a path with an encoded null byte (%00)", () => {
    expect(sanitizeInternalRedirect("/path%00.txt")).toBe(FALLBACK);
  });

  it("rejects uppercase encoded newline (%0A)", () => {
    expect(sanitizeInternalRedirect("/path%0ASet-Cookie:evil=1")).toBe(FALLBACK);
  });
});

describe("sanitizeInternalRedirect — length cap", () => {
  it("rejects paths longer than 2048 characters", () => {
    const longPath = "/" + "a".repeat(2048);
    expect(sanitizeInternalRedirect(longPath)).toBe(FALLBACK);
  });

  it("accepts paths exactly at the 2048-character limit", () => {
    const borderPath = "/" + "a".repeat(2047);
    expect(sanitizeInternalRedirect(borderPath)).toBe(borderPath);
  });
});

describe("sanitizeInternalRedirect — custom fallback", () => {
  it("uses the provided fallback instead of the default", () => {
    expect(sanitizeInternalRedirect("https://evil.com", "/login")).toBe("/login");
  });
});
