import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
  type ExpenseCreate,
  type ExpenseUpdate,
  type ExpensesQuery,
} from "../api/expenses";

const EXPENSES_KEY = "expenses";

export function useExpenses(filters: ExpensesQuery) {
  return useInfiniteQuery({
    queryKey: [EXPENSES_KEY, filters],
    queryFn: ({ pageParam }) =>
      getExpenses({ ...filters, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: [EXPENSES_KEY, id],
    queryFn: () => getExpense(id),
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ExpenseCreate) => createExpense(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ExpenseUpdate }) => updateExpense(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      queryClient.setQueryData([EXPENSES_KEY, data.id], data);
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
      queryClient.removeQueries({ queryKey: [EXPENSES_KEY, id] });
    },
  });
}

export function useCreateExpenseOptimistic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ExpenseCreate) => createExpense(body),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: [EXPENSES_KEY] });
      const previousData = queryClient.getQueriesData({ queryKey: [EXPENSES_KEY] });
      return { previousData };
    },
    onError: (_err, _body, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] });
    },
  });
}
