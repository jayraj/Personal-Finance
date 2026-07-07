import apiClient from "./client";
import type { User } from "../types";

export interface ProfileUpdate {
  display_name?: string;
  preferred_currency?: string;
}

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>("/profile");
  return data;
}

export async function updateProfile(body: ProfileUpdate): Promise<User> {
  const { data } = await apiClient.put<User>("/profile", body);
  return data;
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete("/profile");
}
