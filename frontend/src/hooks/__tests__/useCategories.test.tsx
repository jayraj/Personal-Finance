import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCategories } from "../useCategories";

vi.mock("../../api/categories", () => ({
  getCategories: vi.fn().mockResolvedValue([
    { id: "1", userId: "u1", name: "Food", isPredefined: true, createdAt: "2026-01-01" },
  ]),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCategories", () => {
  it("fetches and returns categories", async () => {
    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0].name).toBe("Food");
  });
});
