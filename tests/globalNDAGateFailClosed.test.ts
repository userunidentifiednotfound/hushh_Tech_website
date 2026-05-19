// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigateMock = vi.fn();
const checkNDAStatusMock = vi.fn();

let authSessionMock = {
  status: "authenticated",
  session: {
    user: {
      id: "unsigned-user",
    },
  },
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../src/auth/AuthSessionProvider", () => ({
  useAuthSession: () => authSessionMock,
}));

vi.mock("../src/services/nda/ndaService", () => ({
  checkNDAStatus: (...args: unknown[]) => checkNDAStatusMock(...args),
}));

import GlobalNDAGate from "../src/components/GlobalNDAGate";

describe("GlobalNDAGate fail-closed rendering", () => {
  let container: HTMLDivElement;
  let root: Root;

  const flushPromises = async () => {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    window.sessionStorage.clear();
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    authSessionMock = {
      status: "authenticated",
      session: {
        user: {
          id: "unsigned-user",
        },
      },
    };
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it("does not render protected children for an authenticated user without a signed NDA", async () => {
    checkNDAStatusMock.mockResolvedValue({
      hasSignedNda: false,
      signedAt: null,
      ndaVersion: null,
    });

    await act(async () => {
      root.render(
        React.createElement(
          ChakraProvider,
          null,
          React.createElement(
            MemoryRouter,
            { initialEntries: ["/onboarding/step5"] },
            React.createElement(
              GlobalNDAGate,
              null,
              React.createElement("main", { "data-testid": "protected-child" }),
            ),
          ),
        ),
      );
    });

    await flushPromises();

    expect(checkNDAStatusMock).toHaveBeenCalledWith("unsigned-user");
    expect(navigateMock).toHaveBeenCalledWith("/sign-nda", { replace: true });
    expect(window.sessionStorage.getItem("nda_redirect_after")).toBe(
      "/onboarding/step5",
    );
    expect(
      container.querySelector("[data-testid='protected-child']"),
    ).toBeNull();
  });
});
