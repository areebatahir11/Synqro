import { ROLES } from "@/constants/roles";

export const NAV_ITEMS = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Projects", href: "/admin/projects", icon: "FolderKanban" },
    { label: "Users", href: "/admin/users", icon: "Users" },
    { label: "Notifications", href: "/notifications", icon: "Bell" },
    { label: "Profile", href: "/profile", icon: "UserCircle" },
  ],
  [ROLES.PROJECT_MANAGER]: [
    { label: "Dashboard", href: "/pm", icon: "LayoutDashboard" },
    { label: "My Projects", href: "/pm/projects", icon: "FolderKanban" },
    { label: "Notifications", href: "/notifications", icon: "Bell" },
    { label: "Profile", href: "/profile", icon: "UserCircle" },
  ],
  [ROLES.TEAM_MEMBER]: [
    { label: "Dashboard", href: "/member", icon: "LayoutDashboard" },
    { label: "My Tasks", href: "/member/tasks", icon: "ListChecks" },
    { label: "My Projects", href: "/member/projects", icon: "FolderKanban" },
    { label: "Notifications", href: "/notifications", icon: "Bell" },
    { label: "Profile", href: "/profile", icon: "UserCircle" },
  ],
};
// import { ROLES } from "@/constants/roles";

// export const NAV_ITEMS = {
//   [ROLES.ADMIN]: [
//     { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
//     { label: "Projects", href: "/admin/projects", icon: "FolderKanban" },
//     { label: "Users", href: "/admin/users", icon: "Users" },
//     { label: "Notifications", href: "/notifications", icon: "Bell" },
//     { label: "Profile", href: "/profile", icon: "UserCircle" },
//   ],
//   [ROLES.PROJECT_MANAGER]: [
//     { label: "Dashboard", href: "/pm", icon: "LayoutDashboard" },
//     { label: "My Projects", href: "/pm/projects", icon: "FolderKanban" },
//     { label: "Analytics", href: "/pm/analytics", icon: "Activity" },
//     { label: "Notifications", href: "/notifications", icon: "Bell" },
//     { label: "Profile", href: "/profile", icon: "UserCircle" },
//   ],
//   [ROLES.TEAM_MEMBER]: [
//     { label: "Dashboard", href: "/member", icon: "LayoutDashboard" },
//     { label: "My Tasks", href: "/member/tasks", icon: "ListChecks" },
//     { label: "My Projects", href: "/member/projects", icon: "FolderKanban" },
//     { label: "Analytics", href: "/member/analytics", icon: "Activity" },
//     { label: "Notifications", href: "/notifications", icon: "Bell" },
//     { label: "Profile", href: "/profile", icon: "UserCircle" },
//   ],
// };