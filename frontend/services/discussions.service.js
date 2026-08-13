import { apiClient } from "@/lib/api-client";

export const discussionsService = {
  listForTask: async (taskId) => {
    const { data } = await apiClient.get(`/tasks/${taskId}/discussions`);
    return data;
  },
  post: async (taskId, message) => {
    const { data } = await apiClient.post(`/tasks/${taskId}/discussions`, { message });
    return data;
  },
};
