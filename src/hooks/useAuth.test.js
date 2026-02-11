import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { useAuthStore } from "@/store/authStore";

// Mock dependencies
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: null }),
  }),
);

describe("useAuth Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().resetAuth();
  });

  it("should return initial state", async () => {
    const { result } = renderHook(() => useAuth());

    // Wait for the initial effect to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  // Note: Testing useEffect and async fetch in hooks requires more setup
  // and waiting for updates. Keeping this simple for now.

  it("should expose auth methods", async () => {
    const { result } = renderHook(() => useAuth());

    // Wait for the initial effect to settle
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });
});
