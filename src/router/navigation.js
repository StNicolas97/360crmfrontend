import { ROLES } from "@/api/session";

// Menu latéral. "roles" absent = visible par tous les utilisateurs connectés.
export const NAVIGATION = [
  { name: "dashboard", label: "Tableau de bord", icon: "bi-speedometer2" },
  { name: "calendar", label: "Calendrier", icon: "bi-calendar3" },
  { name: "kanban", label: "Production", icon: "bi-kanban" },
  { name: "my-tasks", label: "Mes tâches", icon: "bi-briefcase" },
  { name: "tasks", label: "Toutes les tâches", icon: "bi-list-task", roles: [ROLES.ADMIN] },
  { name: "leads", label: "Leads", icon: "bi-funnel", roles: [ROLES.ADMIN] },
  { name: "clients", label: "Clients", icon: "bi-people", roles: [ROLES.ADMIN] },
  { name: "users", label: "Employés", icon: "bi-person-badge", roles: [ROLES.ADMIN] },
  { name: "pertes", label: "Pertes", icon: "bi-archive" },
];

export const canAccess = (roles, role) => !roles || roles.includes(role);
