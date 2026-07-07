import apiClient from "./client";
import type { Category } from "../types";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}

export async function createCategory(name: string): Promise<Category> {
  const { data } = await apiClient.post<Category>("/categories", { name });
  return data;
}

export async function updateCategory(
  id: string,
  body: { name?: string },
): Promise<Category> {
  const { data } = await apiClient.put<Category>(`/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
