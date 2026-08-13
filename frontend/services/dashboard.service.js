import { apiClient } from "@/lib/api-client";

export const dashboardService = {
  admin: async () => {
    const { data } = await apiClient.get("/dashboard/admin");
    return data;
  },
  pm: async () => {
    const { data } = await apiClient.get("/dashboard/pm");
    return data;
  },
  member: async () => {
    const { data } = await apiClient.get("/dashboard/member");
    return data;
  },
};
// import { apiClient } from "@/lib/api-client";

// export const dashboardService = {
//   admin: async () => {
//     const { data } = await apiClient.get("/dashboard/admin");
//     return data;
//   },
//   pm: async () => {
//     const { data } = await apiClient.get("/dashboard/pm");
//     return data;
//   },
//   member: async () => {
//     const { data } = await apiClient.get("/dashboard/member");
//     return data;
//   },
//   pmAnalytics: async () => {
//     const { data } = await apiClient.get("/dashboard/pm/analytics");
//     return data;
//   },
//   memberAnalytics: async () => {
//     const { data } = await apiClient.get("/dashboard/member/analytics");
//     return data;
//   },
// };