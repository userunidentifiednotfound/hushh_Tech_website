import { expect, test, type Page } from "@playwright/test";

const summaryPayload = {
  generatedAt: "2026-05-11T12:00:00.000Z",
  timezone: "America/Los_Angeles",
  window: {
    days: 7,
    startDate: "2026-05-05",
    endDate: "2026-05-11",
  },
  businessFunnel: {
    source: "supabase",
    overview: {
      signups: 10,
      persistedUsers: 8,
      onboardingStarted: 6,
      onboardingCompleted: 4,
      profilesCreated: 3,
      profilesConfirmed: 2,
    },
    conversionRates: {
      signupToPersistedUsers: 0.8,
      signupToOnboardingStarted: 0.6,
      onboardingCompletionRate: 0.67,
      profileConfirmationRate: 0.67,
    },
    onboardingStepBreakdown: [{ step: "step-1", users: 6 }],
    series: [
      {
        date: "2026-05-11",
        signups: 10,
        persistedUsers: 8,
        onboardingStarted: 6,
        onboardingCompleted: 4,
        profilesCreated: 3,
        profilesConfirmed: 2,
      },
    ],
  },
  audience: {
    source: "site",
    dau: 4,
    wau: 12,
    mau: 20,
    sessions: 14,
    pageViews: 40,
    events: 50,
  },
  search: {
    totalSearches: 7,
    resultClickRate: 0.4,
    noResultRate: 0.1,
    bySurface: [],
  },
  searchPerformance: {
    source: "search-console",
    available: true,
    realtime: false,
    dataState: "fresh",
    searchType: "web",
    overview: {
      clicks: 12,
      impressions: 120,
      ctr: 0.1,
      averagePosition: 4.2,
    },
    queries: [{ query: "hushh", clicks: 5, impressions: 50, ctr: 0.1, averagePosition: 2 }],
    pages: [{ pageUrl: "/profile", clicks: 3, impressions: 30, ctr: 0.1, averagePosition: 5 }],
    countries: [{ country: "US", clicks: 4, impressions: 40, ctr: 0.1, averagePosition: 3 }],
    devices: [{ device: "mobile", clicks: 2, impressions: 20, ctr: 0.1, averagePosition: 6 }],
    searchAppearance: [{ appearance: "Web result", clicks: 1, impressions: 10, ctr: 0.1, averagePosition: 7 }],
    state: {
      source: "ga4",
      available: true,
      byRegion: [{ state: "California", activeUsers: 4, sessions: 5 }],
    },
  },
  gcp: {
    source: "monitoring",
    available: true,
    services: [],
    requestCount: 100,
    errorRate: 0.01,
    p50LatencyMs: 100,
    p95LatencyMs: 200,
    instanceCount: 2,
    uptimeAvailability: 0.99,
  },
  traffic: {
    source: "GA4 Data API",
    available: true,
    overview: {
      active1DayUsers: 4,
      active7DayUsers: 12,
      active28DayUsers: 20,
      sessions: 14,
      engagedSessions: 10,
      screenPageViews: 40,
      newUsers: 5,
      engagementRate: 0.7,
      averageSessionDuration: 90,
      realtimeActiveUsers: 2,
    },
    series: [
      {
        date: "2026-05-11",
        activeUsers: 4,
        sessions: 14,
        screenPageViews: 40,
        engagedSessions: 10,
        newUsers: 5,
      },
    ],
  },
  legacy: {
    source: "legacy",
    available: true,
    overview: { usersCreated: 1 },
    series: [{ date: "2026-05-11", usersCreated: 1 }],
  },
  dataQualityWarnings: ["GA4 supporting metrics are using the latest cached payload."],
};

async function mockMetricsSummary(page: Page) {
  await page.route("**/api/shared/walletPassModel.js", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/javascript",
      body: `
        export const buildGoldPassPayload = () => ({});
        export const buildWalletCardContent = () => ({
          holderName: "Hushh Investor",
          organizationName: "Hushh",
          investmentClass: "Class C",
          membershipId: "hushh-investor",
          email: "investor@hushh.ai",
          passUrl: "https://hushhtech.com",
          profileUrl: null,
        });
      `,
    });
  });

  await page.route("**/api/metrics/summary?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(summaryPayload),
    });
  });
}

async function expectBadgeTextCentered(page: Page, accessibleName: string) {
  const badge = page.getByRole("status", { name: accessibleName });

  await expect(badge).toBeVisible();
  await expect(badge).toHaveCSS("display", "flex");
  await expect(badge).toHaveCSS("align-items", "center");
  await expect(badge).toHaveCSS("justify-content", "center");

  const centering = await badge.evaluate((element) => {
    const badgeRect = element.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(element);
    const textRect = range.getBoundingClientRect();

    return {
      horizontalDelta: Math.abs(
        badgeRect.left + badgeRect.width / 2 - (textRect.left + textRect.width / 2)
      ),
      verticalDelta: Math.abs(
        badgeRect.top + badgeRect.height / 2 - (textRect.top + textRect.height / 2)
      ),
    };
  });

  expect(centering.horizontalDelta).toBeLessThanOrEqual(2);
  expect(centering.verticalDelta).toBeLessThanOrEqual(2);
}

test.describe("/metrics status badge visual alignment", () => {
  for (const viewport of [
    { name: "mobile", width: 390, height: 900 },
    { name: "desktop", width: 1440, height: 1100 },
  ]) {
    test(`centers named status badge text on ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await mockMetricsSummary(page);

      const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173";
      await page.goto(`${baseURL}/metrics`);

      await expectBadgeTextCentered(page, "Funnel stack status: Live");
      await expectBadgeTextCentered(page, "Legacy appendix status: Not merged");
      await expectBadgeTextCentered(page, "Audit notes status: 1 note");

      await page.screenshot({
        path: testInfo.outputPath(`metrics-status-badges-${viewport.name}.png`),
        fullPage: true,
      });
    });
  }
});
