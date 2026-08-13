import { apiClient } from "@/lib/api-client";

export const notificationsService = {
  list: async (params = {}) => {
    const { data } = await apiClient.get("/notifications", { params });
    return data;
  },
  markRead: async (notificationId) => {
    const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await apiClient.patch("/notifications/read-all");
    return data;
  },
};
