import api, { extractData } from "../utils/api";
import {
  ApiResponse,
  AuthPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from "../types";

export const authService = {
  login: async (payload: LoginPayload) =>
    extractData(
      await api.post<ApiResponse<AuthPayload>>("/auth/login", payload, {
        headers: { "Content-Type": "application/json" },
      })
    ),

  register: async (payload: RegisterPayload) =>
    extractData(
      await api.post<ApiResponse<AuthPayload>>("/auth/register", payload, {
        headers: { "Content-Type": "application/json" },
      })
    ),

  getCurrentUser: async () =>
    extractData(await api.get<ApiResponse<User>>("/auth/me")),

  updateProfile: async (payload: UpdateProfilePayload) =>
    extractData(
      await api.patch<ApiResponse<User>>("/auth/me", payload, {
        headers: { "Content-Type": "application/json" },
      })
    ),
};
