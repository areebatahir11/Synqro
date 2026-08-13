import { apiClient } from "@/lib/api-client";

export const authService = {
  login: async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
  logout: async () => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },
};
