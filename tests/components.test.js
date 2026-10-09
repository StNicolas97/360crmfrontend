import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

// L'API est simulée : aucun appel réseau pendant les tests
vi.mock("@/api", () => ({
  errorMessage: (e, fallback) => fallback,
  clientsApi: { list: vi.fn().mockResolvedValue([{ id: 1, nom: "Roy", prenom: "Alex", entreprise: "Garage Roy" }]) },
  usersApi: { list: vi.fn().mockResolvedValue([{ id: 5, nom: "Tremblay", prenom: "Julie", couleur: "#f00" }]) },
  contactsApi: { list: vi.fn().mockResolvedValue([]) },
}));

import DataTable from "@/components/ui/DataTable.vue";
import FormFields from "@/components/ui/FormFields.vue";
import TaskTable from "@/components/tasks/TaskTable.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import { useAuthStore } from "@/stores/auth";

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { render: () => null } },
      { path: "/taches/:type/:subId", name: "task-detail", component: { render: () => null } },
    ],
  });
}

beforeEach(() => setActivePinia(createPinia()));

describe("DataTable", () => {
  it("affiche les lignes et émet le tri au clic sur un en-tête", async () => {
    const wrapper = mount(DataTable, {
      props: { columns: [{ key: "nom", label: "Nom", sortable: true }], rows: [{ id: 1, nom: "A" }, { id: 2, nom: "B" }] },
    });
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    await wrapper.find("th button").trigger("click");
    expect(wrapper.emitted("sort")[0]).toEqual(["nom"]);
  });

  it("affiche le message vide", () => {
    const wrapper = mount(DataTable, { props: { columns: [{ key: "nom", label: "Nom" }], rows: [], emptyText: "Rien" } });
    expect(wrapper.text()).toContain("Rien");
  });
});

describe("StatusBadge", () => {
  it("utilise la couleur et le libellé du référentiel", () => {
    const wrapper = mount(StatusBadge, { props: { value: "Termine" } });
    expect(wrapper.text()).toBe("Terminé");
    expect(wrapper.classes()).toContain("text-bg-dark");
  });
});

describe("FormFields", () => {
  it("émet un nouvel objet à la saisie (sans muter la prop)", async () => {
    const model = { titre: "" };
    const wrapper = mount(FormFields, {
      props: { modelValue: model, fields: [{ key: "titre", label: "Titre", type: "text" }] },
    });
    await wrapper.find("input").setValue("Nouveau");
    expect(wrapper.emitted("update:modelValue")[0][0]).toEqual({ titre: "Nouveau" });
    expect(model.titre).toBe("");
  });

  it("verrouille les champs réservés à l'administrateur pour un employé", async () => {
    useAuthStore().user = { id: 5, role: "employee" };
    const wrapper = mount(FormFields, {
      props: { modelValue: { idAssigne: 5 }, fields: [{ key: "idAssigne", label: "Assigné", type: "user", adminOnly: true }] },
    });
    await flushPromises();
    expect(wrapper.find("select").attributes("disabled")).toBeDefined();
  });

  it("affiche les erreurs de validation", () => {
    const wrapper = mount(FormFields, {
      props: { modelValue: {}, fields: [{ key: "titre", label: "Titre", required: true }], errors: { titre: "Obligatoire" } },
    });
    expect(wrapper.find(".is-invalid").exists()).toBe(true);
    expect(wrapper.text()).toContain("Obligatoire");
  });
});

describe("TaskTable", () => {
  const tasks = [
    { id: 1, subId: 10, type: "ppf", titre: "Kit Or", statut: "Design", priorite: "Urgent", idClient: 1, idAssigne: 5, datefin: "2099-01-01" },
    { id: 2, subId: 20, type: "lettrage", titre: "Camion", statut: "Leads", priorite: "Normal", idClient: 1, idAssigne: 5, datefin: null },
  ];

  it("filtre par statut et ouvre la fiche au clic", async () => {
    const router = makeRouter();
    const push = vi.spyOn(router, "push");
    const wrapper = mount(TaskTable, { props: { tasks }, global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
    expect(wrapper.text()).toContain("Julie Tremblay");

    await wrapper.findAll("select")[1].setValue("Leads");
    expect(wrapper.findAll("tbody tr")).toHaveLength(1);

    await wrapper.find("tbody tr").trigger("click");
    expect(push).toHaveBeenCalledWith({ name: "task-detail", params: { type: "lettrage", subId: 20 } });
  });
});
