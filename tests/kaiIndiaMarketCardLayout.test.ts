// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MarketCard } from "../src/kai-india/components/MarketCard";
import type { MarketItem } from "../src/kai-india/types";

describe("Kai India MarketCard layout", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it("reserves matching widget rows while market data is loading", async () => {
    await act(async () => {
      root.render(React.createElement(MarketCard, { title: "Top 10 Market Movers", isLoading: true }));
    });

    const scrollRegion = container.querySelector(".custom-scrollbar");
    const skeletonRows = Array.from(container.querySelectorAll("[aria-hidden='true'] > div"));

    expect(scrollRegion?.className).toContain("[scrollbar-gutter:stable]");
    expect(skeletonRows).toHaveLength(10);
    for (const row of skeletonRows) {
      expect(row.className).toContain("min-h-[57px]");
      expect(row.className).toContain("py-3");
    }
  });

  it("uses the same reserved row height for loaded market widgets", async () => {
    const items: MarketItem[] = [
      { name: "Nifty 50", price: "22,500", change: "+1.2%", category: "Index" },
    ];

    await act(async () => {
      root.render(
        React.createElement(MarketCard, {
          title: "Top 10 Market Movers",
          items,
          onSelect: () => undefined,
        })
      );
    });

    const loadedRow = container.querySelector("button");

    expect(loadedRow?.className).toContain("min-h-[57px]");
    expect(loadedRow?.className).toContain("py-3");
  });
});
