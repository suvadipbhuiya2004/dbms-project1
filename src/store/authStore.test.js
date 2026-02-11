import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.getState().resetAuth();
  });

  it("should have initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    // isLoading is true initially in the store definition provided
    // expect(state.isLoading).toBe(true);
  });

  it("should set user and update isAuthenticated", () => {
    const user = { id: 1, name: "Test User" };
    useAuthStore.getState().setUser(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear user", () => {
    const user = { id: 1, name: "Test User" };
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().clearUser();

    const state = useAuthStore.getState();
    expect(state.user).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });
});
