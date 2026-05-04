export const DEFAULT_AUTH_REDIRECT = "/hushh-user-profile";

/**
 * Only allow same-origin, app-internal redirects.
 *
 * Rejects:
 *  - External URLs (http://, https://, //)
 *  - Protocol-relative URLs
 *  - Paths containing encoded newlines (%0a, %0d) or null bytes (%00)
 *    which can be used to inject headers in some server configurations.
 *  - Paths that resolve to a different origin after URL parsing.
 *  - Values longer than 2 048 characters (prevents log-flooding).
 */
export function sanitizeInternalRedirect(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (!value) return fallback;

  const candidate = value.trim();

  // Hard length cap — prevents log-flooding and header-size attacks.
  if (candidate.length > 2048) return fallback;

  // Must start with a single slash (not //).
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }

  // Reject encoded control characters that can be used for header injection
  // or open-redirect bypasses (%00 null, %0a LF, %0d CR).
  if (/%(00|0a|0d)/i.test(candidate)) {
    return fallback;
  }

  try {
    const url = new URL(candidate, "https://hushh.local");
    if (url.origin !== "https://hushh.local") {
      return fallback;
    }

    // Reconstruct from the parsed URL to normalise any encoded sequences.
    const normalised = `${url.pathname}${url.search}${url.hash}`;
    return normalised || fallback;
  } catch {
    return fallback;
  }
}
