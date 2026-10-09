import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/auth/LoginView.vue";
import AppLayout from "../views/AppLayout.vue";
import { ROLES } from "../api/session";
import { canAccess } from "./navigation";
import { useAuthStore } from "../stores/auth";

const ADMIN = [ROLES.ADMIN];

// Les pages sont chargées à la demande (code-splitting)
const routes = [
  { path: "/login", name: "login", component: LoginView, meta: { public: true, title: "Connexion" } },
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", redirect: { name: "dashboard" } },
      { path: "tableau-de-bord", name: "dashboard", component: () => import("../views/DashboardView.vue"), meta: { title: "Tableau de bord" } },
      { path: "calendrier", name: "calendar", component: () => import("../views/CalendarView.vue"), meta: { title: "Calendrier" } },
      { path: "production", name: "kanban", component: () => import("../views/KanbanView.vue"), meta: { title: "Production" } },
      { path: "mes-taches", name: "my-tasks", component: () => import("../views/TasksView.vue"), props: { scope: "mine" }, meta: { title: "Mes tâches" } },
      { path: "taches", name: "tasks", component: () => import("../views/TasksView.vue"), props: { scope: "all" }, meta: { title: "Tâches", roles: ADMIN } },
      { path: "leads", name: "leads", component: () => import("../views/TasksView.vue"), props: { scope: "leads" }, meta: { title: "Leads", roles: ADMIN } },
      { path: "taches/:type(ppf|lettrage|affichage)/:subId(\\d+)", name: "task-detail", component: () => import("../views/TaskDetailView.vue"), props: true, meta: { title: "Tâche" } },
      { path: "clients", name: "clients", component: () => import("../views/ClientsView.vue"), meta: { title: "Clients", roles: ADMIN } },
      { path: "clients/:id(\\d+)", name: "client-detail", component: () => import("../views/ClientDetailView.vue"), props: true, meta: { title: "Client" } },
      { path: "employes", name: "users", component: () => import("../views/UsersView.vue"), meta: { title: "Employés", roles: ADMIN } },
      { path: "employes/:id(\\d+)", name: "user-detail", component: () => import("../views/UserDetailView.vue"), props: true, meta: { title: "Employé", roles: ADMIN } },
      { path: "pertes", name: "pertes", component: () => import("../views/PertesView.vue"), meta: { title: "Pertes" } },
      { path: "profil", name: "profile", component: () => import("../views/ProfileView.vue"), meta: { title: "Mon profil" } },
      // Anciennes adresses
      { path: "home", redirect: { name: "dashboard" } },
      { path: "user", redirect: { name: "dashboard" } },
    ],
  },
  { path: "/:pathMatch(.*)*", redirect: { name: "dashboard" } },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.public) return auth.isAuthenticated ? { name: "dashboard" } : true;
  if (!auth.isAuthenticated) return { name: "login", query: to.fullPath !== "/" ? { redirect: to.fullPath } : {} };

  // Page réservée à un autre rôle : retour au tableau de bord
  const roles = to.matched.flatMap((record) => record.meta.roles ?? []);
  if (roles.length && !canAccess(roles, auth.user?.role)) return { name: "dashboard" };
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 360 AutoWrap CRM` : "360 AutoWrap CRM";
});

export default router;
