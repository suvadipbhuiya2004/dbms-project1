import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EnrollButton from "./EnrollButton";

// Mock dependencies
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

global.fetch = vi.fn();
global.alert = vi.fn();

describe("EnrollButton Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders enroll button initially", () => {
    render(<EnrollButton courseId="123" />);
    
    expect(screen.getByRole("button")).toBeDefined();
    expect(screen.getByText("Enroll in Course")).toBeDefined();
  });

  it("shows loading state when clicked", async () => {
    // Mock a slow response
    global.fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));
    
    render(<EnrollButton courseId="123" />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(button.disabled).toBe(true);
    // Assuming Loader2 renders something, but we can check for disability first
    // or we can wait for the promise to resolve in the next test
  });

  it("handles successful enrollment", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<EnrollButton courseId="123" />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Enrolled")).toBeDefined();
    });

    expect(mockRefresh).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith("/api/courses/123/enroll", {
      method: "POST",
    });
  });

  it("handles enrollment failure", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Course full" }),
    });

    render(<EnrollButton courseId="123" />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Course full");
    });
    
    // Should still be a button (not enrolled state)
    expect(screen.getByRole("button")).toBeDefined();
  });
});
