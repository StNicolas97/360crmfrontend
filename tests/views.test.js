import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

// Jeu de données représentatif des réponses de l'API (hissé avec vi.mock)
const { ppfRow, lettrageRow, detail } = vi.hoisted(() => {
  const ppfRow = { id: 10, idTache: 1, typeTask: "PPF", titre: "Kit Or", statut: "Design", priorite: "Urgent", idClient: 1, idAssigne: 5, datedebut: "2025-01-01", datefin: "2025-01-03", prix: 1200 };
  const lettrageRow = { id: 20, idTache: 2, typeTask: "lettrage", titre: "Camion", statut: "Leads", priorite: "Normal", idClient: 2, idAssigne: 6, datefin: null };
  const detail = { ...ppfRow, nom: "Roy", prenom: "Alex", email: "alex@example.com", createdAt: "2025-01-01T10:00:00Z", vehicule: "Civic" };
  return { ppfRow, lettrageRow, detail };
});

vi.mock("@/api", () => {
  const ok = (value) => vi.fn().mockResolvedValue(value);
  return {
    errorMessage: (e, fallback) => fallback,
    authApi: { login: ok({}), me: ok({}) },
    usersApi: {
      list: ok([{ id: 5, nom: "Tremblay", prenom: "Julie", couleur: "#f00", role: "admin", username: "julie" }, { id: 6, nom: "Côté", prenom: "Marc", role: "employee", username: "marc" }]),
      get: ok({ id: 5, nom: "Tremblay", prenom: "Julie", couleur: "#f00", role: "admin", username: "julie" }),
      tasks: ok([{ ...ppfRow, id: 1, idPpf: 10, idTache: undefined }]),
      update: ok({}),
    },
    clientsApi: {
      list: ok([{ id: 1, nom: "Roy", prenom: "Alex", statut: "Actif" }, { id: 2, nom: "Gagnon", prenom: "Luc", entreprise: "Transport G", statut: "Actif" }]),
      get: ok({ id: 1, nom: "Roy", prenom: "Alex", statut: "Actif", telephone: "555" }),
      tasks: ok([{ ...ppfRow, id: 1, idPpf: 10, idTache: undefined }]),
    },
    contactsApi: { list: ok([{ id: 3, nom: "Contact", telephone: "555" }]) },
    tasksApi: {
      listByType: vi.fn((endpoint) => Promise.resolve(endpoint === "ppf" ? [ppfRow] : endpoint === "lettrage" ? [lettrageRow] : [])),
      get: ok(detail),
      calendar: ok([]),
    },
    subcontractsApi: { byTask: ok([{ id: 1, titre: "Impression", sousTraitant: "Fournisseur", dateEnvoi: "2025-01-02" }]) },
    filesApi: { byTask: ok({ files: [] }) },
    notesApi: { list: ok([]) },
    pertesApi: { list: ok([{ id: 1, typeVinyle: "3M", cout: 42.5, idAssigne: 5, nom: "Tremblay", prenom: "Julie", createdAt: "2025-01-01" }]) },
    mailApi: { send: ok({}) },
  };
});

// FullCalendar n'est pas compatible jsdom : on vérifie la vue sans le rendu du calendrier
vi.mock("@fullcalendar/vue3", async () => {
  const { h } = await import("vue");
  return { default: { name: "FullCalendar", props: ["options"], render: () => h("div", { class: "fc-stub" }) } };
});

import { useAuthStore } from "@/stores/auth";
import DashboardView from "@/views/DashboardView.vue";
import TasksView from "@/views/TasksView.vue";
import KanbanView from "@/views/KanbanView.vue";
import CalendarView from "@/views/CalendarView.vue";
import TaskDetailView from "@/views/TaskDetailView.vue";
import ClientsView from "@/views/ClientsView.vue";
import ClientDetailView from "@/views/ClientDetailView.vue";
import UsersView from "@/views/UsersView.vue";
import UserDetailView from "@/views/UserDetailView.vue";
import PertesView from "@/views/PertesView.vue";
import ProfileView from "@/views/ProfileView.vue";
import AppLayout from "@/views/AppLayout.vue";

const stub = { render: () => null };
function makeRouter() {
  const names = ["dashboard", "calendar", "kanban", "my-tasks", "tasks", "leads", "clients", "users", "pertes", "profile"];
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      ...names.map((name) => ({ path: `/${name}`, name, component: stub })),
      { path: "/t/:type/:subId", name: "task-detail", component: stub },
      { path: "/c/:id", name: "client-detail", component: stub },
      { path: "/u/:id", name: "user-detail", component: stub },
    ],
  });
}

async function render(component, props = {}) {
  const errors = [];
  const router = makeRouter();
  await router.push("/dashboard");
  const wrapper = mount(component, {
    props,
    attachTo: document.body,
    global: {
      plugins: [router],
      config: { errorHandler: (e) => errors.push(e), warnHandler: () => {} },
    },
  });
  await flushPromises();
  return { wrapper, errors };
}

const views = [
  ["tableau de bord", DashboardView, {}, "Kit Or"],
  ["toutes les tâches", TasksView, { scope: "all" }, { admin: "Camion", employee: "Kit Or" }],
  ["leads", TasksView, { scope: "leads" }, { admin: "Camion", employee: "Aucun lead" }],
  ["production", KanbanView, {}, "Kit Or"],
  ["calendrier", CalendarView, {}, "Calendrier"],
  ["fiche tâche", TaskDetailView, { type: "ppf", subId: "10" }, "Fournisseur"],
  ["clients", ClientsView, {}, "Transport G"],
  ["fiche client", ClientDetailView, { id: "1" }, "Contact"],
  ["employés", UsersView, {}, "Julie Tremblay"],
  ["fiche employé", UserDetailView, { id: "6" }, { admin: "Réinitialiser le mot de passe", employee: "Changer mon mot de passe" }],
  ["pertes", PertesView, {}, "42,50"],
  ["profil", ProfileView, {}, "Changer mon mot de passe"],
  ["layout", AppLayout, {}, "Nouvelle tâche"],
];

describe.each([
  ["administrateur", { id: 5, role: "admin", prenom: "Julie", username: "julie" }],
  ["employé", { id: 6, role: "employee", prenom: "Marc", username: "marc" }],
])("vues (%s)", (_, user) => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = user;
    auth.token = "test";
  });

  it.each(views)("%s s'affiche sans erreur", async (_name, component, props, expected) => {
    document.body.innerHTML = "";
    const { wrapper, errors } = await render(component, props);
    expect(errors).toEqual([]);
    const text = typeof expected === "string" ? expected : expected[user.role];
    expect(document.body.textContent + wrapper.text()).toContain(text);
    wrapper.unmount();
  });
});

describe("droits d'affichage", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("un employé ne voit ni la suppression de tâche ni l'assignation modifiable", async () => {
    const auth = useAuthStore();
    auth.user = { id: 6, role: "employee" };
    auth.token = "test";
    const { wrapper } = await render(TaskDetailView, { type: "ppf", subId: "10" });
    expect(wrapper.find("button.text-danger[title='Supprimer']").exists()).toBe(false);
    const assignee = wrapper.findAll("label").find((l) => l.text().startsWith("Assigné"));
    expect(wrapper.find(`#${assignee.attributes("for")}`).attributes("disabled")).toBeDefined();
    wrapper.unmount();
  });

  it("le menu d'un employé ne contient pas les pages d'administration", async () => {
    const auth = useAuthStore();
    auth.user = { id: 6, role: "employee" };
    auth.token = "test";
    const { wrapper } = await render(AppLayout);
    const text = wrapper.text();
    expect(text).toContain("Mes tâches");
    expect(text).not.toContain("Employés");
    expect(text).not.toContain("Leads");
    wrapper.unmount();
  });
});
