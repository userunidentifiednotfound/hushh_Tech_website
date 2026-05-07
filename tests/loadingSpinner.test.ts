// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import LoadingSpinner from "../src/components/LoadingSpinner";

describe("LoadingSpinner", () => {
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

  async function renderSpinner(props?: React.ComponentProps<typeof LoadingSpinner>) {
    await act(async () => {
      root.render(React.createElement(LoadingSpinner, props));
    });
  }

  it("announces loading state without exposing the decorative spinner", async () => {
    await renderSpinner({ color: "slate", label: "Loading account data" });

    const status = container.querySelector('[role="status"]');
    const spinner = status?.querySelector('[aria-hidden="true"]');

    expect(status).not.toBeNull();
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.textContent).toBe("Loading account data");
    expect(spinner).not.toBeNull();
    expect(spinner?.className).toContain("border-t-slate-700");
  });

  it("keeps full-page loading accessible inside the overlay", async () => {
    await renderSpinner({ fullPage: true });

    const overlay = container.querySelector(".fixed.inset-0");
    const status = overlay?.querySelector('[role="status"]');

    expect(overlay).not.toBeNull();
    expect(status).not.toBeNull();
    expect(status?.textContent).toBe("Loading");
  });
});
