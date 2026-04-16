import axios, { AxiosResponse } from "axios";
import { ApiResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const extractData = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data.data;

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default api;
