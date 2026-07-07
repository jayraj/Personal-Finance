import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useExpenses } from "../useExpenses";

vi.mock("../../api/expenses", () => ({
  getExpenses: vi.fn().mockResolvedValue({
    items: [
      {
        id: "1",
        userId: "u1",
        categoryId: "c1",
        categoryName: "Food",
        amount: 25.0,
        date: "2026-07-01",
        notes: null,
        receipts: [],
        createdAt: "2026-07-01T00:00:00Z",
        updatedAt: "2026-07-01T00:00:00Z",
      },
    ],
    next_cursor: null,
  }),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  uploadReceipt: vi.fn(),
  deleteReceipt: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useExpenses", () => {
  it("fetches and returns expenses", async () => {
    const { result } = renderHook(() => useExpenses({ sort_by: "date", sort_order: "desc" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const expenses = result.current.data?.pages.flatMap((p) => p.items) ?? [];
    expect(expenses).toHaveLength(1);
    expect(expenses[0].categoryName).toBe("Food");
    expect(expenses[0].amount).toBe(25.0);
  });
});
