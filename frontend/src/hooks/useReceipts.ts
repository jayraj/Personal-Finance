import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteReceipt, uploadReceipt } from "../api/expenses";

const EXPENSES_KEY = "expenses";

export function useUploadReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, file }: { expenseId: string; file: File }) =>
      uploadReceipt(expenseId, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, variables.expenseId] });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, receiptId }: { expenseId: string; receiptId: string }) =>
      deleteReceipt(expenseId, receiptId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY, variables.expenseId] });
    },
  });
}
