import { apiClient } from "@/lib/api-client";

export const projectsService = {
  list: async (params = {}) => {
    const { data } = await apiClient.get("/projects", { params });
    return data;
  },
  get: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await apiClient.post("/projects", payload);
    return data;
  },
  update: async (projectId, payload) => {
    const { data } = await apiClient.patch(`/projects/${projectId}`, payload);
    return data;
  },
  remove: async (projectId) => {
    await apiClient.delete(`/projects/${projectId}`);
  },
  listMembers: async (projectId) => {
    const { data } = await apiClient.get(`/projects/${projectId}/members`);
    return data;
  },
  addMember: async (projectId, memberId) => {
    const { data } = await apiClient.post(`/projects/${projectId}/members`, { member_id: memberId });
    return data;
  },
  removeMember: async (projectId, memberId) => {
    await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
  },
};
