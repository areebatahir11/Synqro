import { apiClient } from "@/lib/api-client";

export const usersService = {
  list: async (params = {}) => {
    const { data } = await apiClient.get("/users", { params });
    return data;
  },
  create: async (payload) => {
    const { data } = await apiClient.post("/users", payload);
    return data;
  },
  update: async (userId, payload) => {
    const { data } = await apiClient.patch(`/users/${userId}`, payload);
    return data;
  },
  remove: async (userId) => {
    await apiClient.delete(`/users/${userId}`);
  },
  getMe: async () => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },
  updateMe: async (payload) => {
    const { data } = await apiClient.patch("/users/me", payload);
    return data;
  },
  getPublic: async (userId) => {
    const { data } = await apiClient.get(`/users/${userId}`);
    return data;
  },
};