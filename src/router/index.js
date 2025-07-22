import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/auth/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import EmployeView from "../views/EmployeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
      beforeEnter: (to, from, next) => {
        const isAuthenticated = JSON.parse(localStorage.getItem("user"));
        if (isAuthenticated.role !== "admin") {
          next("/user");
        } else {
          next();
        }
      },
    },
    {
      path: "/user",
      name: "user",
      component: EmployeView,
      beforeEnter: (to, from, next) => {
        const isAuthenticated = JSON.parse(localStorage.getItem("user"));
        if (isAuthenticated.role !== "employee") {
          next("/home");
        } else {
          next();
        }
      },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = JSON.parse(localStorage.getItem("user"));
  if (to.name !== "login" && !isAuthenticated) {
    next({ name: "login" });
  } else if (
    (to.name === "login" || to.name === "register") &&
    isAuthenticated &&
    isAuthenticated.role === "admin"
  ) {
    next({ path: "/home" });
  } else if (
    (to.name === "login" || to.name === "register") &&
    isAuthenticated &&
    isAuthenticated.role === "employee"
  ) {
    next({ path: "/user" });
  } else {
    next();
  }
});

export default router;
