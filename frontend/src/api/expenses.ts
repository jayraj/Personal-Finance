import apiClient from "./client";
import type { Expense } from "../types";

export interface ExpenseCreate {
  category_id: string;
  amount: number;
  date?: string;
  notes?: string | null;
}

export interface ExpenseUpdate {
  category_id?: string;
  amount?: number;
  date?: string;
  notes?: string | null;
}

export interface PaginatedExpenses {
  items: Expense[];
  next_cursor?: string | null;
  total?: number | null;
}

export interface ExpensesQuery {
  cursor?: string;
  category_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  sort_by?: string;
  sort_order?: string;
}

export async function createExpense(body: ExpenseCreate): Promise<Expense> {
  const { data } = await apiClient.post<Expense>("/expenses", body);
  return data;
}

export async function getExpenses(
  params: ExpensesQuery = {},
): Promise<PaginatedExpenses> {
  const { data } = await apiClient.get<PaginatedExpenses>("/expenses", {
    params,
  });
  return data;
}

export async function getExpense(id: string): Promise<Expense> {
  const { data } = await apiClient.get<Expense>(`/expenses/${id}`);
  return data;
}

export async function updateExpense(
  id: string,
  body: ExpenseUpdate,
): Promise<Expense> {
  const { data } = await apiClient.put<Expense>(`/expenses/${id}`, body);
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  await apiClient.delete(`/expenses/${id}`);
}

export async function uploadReceipt(
  expenseId: string,
  file: File,
): Promise<{ id: string; url: string; file_name: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post(
    `/expenses/${expenseId}/receipts`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function deleteReceipt(
  expenseId: string,
  receiptId: string,
): Promise<void> {
  await apiClient.delete(`/expenses/${expenseId}/receipts/${receiptId}`);
}
