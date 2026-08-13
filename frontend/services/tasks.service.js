import { apiClient } from "@/lib/api-client";

export const tasksService = {
  listForProject: async (projectId, params = {}) => {
    const { data } = await apiClient.get(`/projects/${projectId}/tasks`, { params });
    return data;
  },
  get: async (taskId) => {
    const { data } = await apiClient.get(`/tasks/${taskId}`);
    return data;
  },
  create: async (projectId, payload) => {
    const { data } = await apiClient.post(`/projects/${projectId}/tasks`, payload);
    return data;
  },
  update: async (taskId, payload) => {
    const { data } = await apiClient.patch(`/tasks/${taskId}`, payload);
    return data;
  },
  updateStatus: async (taskId, status) => {
    const { data } = await apiClient.patch(`/tasks/${taskId}/status`, { status });
    return data;
  },
  remove: async (taskId) => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};
