import apiClient from "./client";
import type { User } from "../types";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/register", {
    email,
    password,
    display_name: displayName,
  });
  return data;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function refreshTokens(
  refreshToken: string,
): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", { refresh_token: refreshToken });
}
