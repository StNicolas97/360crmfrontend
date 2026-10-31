// Non-régression de la vérification finale (audit) : droits d'affichage, facturation, courriel,
// confirmation de fin de tâche et téléchargement. L'API est simulée : aucun appel réseau.
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const { detail, mailSend, tasksUpdate, tasksInvoice } = vi.hoisted(() => {
  const detail = {
    id: 10, idTache: 1, typeTask: "PPF", titre: "Or", statut: "Design", priorite: "Normal",
    idClient: 1, idAssigne: 5, datedebut: "2025-01-01", datefin: "2025-01-03", prix: 1200,
    nom: "Roy", prenom: "Alex", email: "alex@example.com", createdAt: "2025-01-01T10:00:00Z",
  };
  return {
    detail,
    mailSend: vi.fn().mockResolvedValue({}),
    tasksUpdate: vi.fn().mockResolvedValue({ mailSent: true, message: "ok" }),
    tasksInvoice: vi.fn().mockResolvedValue({ qboInvoiceId: "99", qboInvoiceNumber: "1001" }),
  };
});

vi.mock("@/api/http", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  API_BASE_URL: "http://api.test",
  DEFAULT_TIMEOUT: 20000,
}));

vi.mock("@/api", () => {
  const ok = (value) => vi.fn().mockResolvedValue(value);
  return {
    errorMessage: (e, fallback) => fallback,
    authApi: { login: ok({}), me: ok({}) },
    usersApi: {
      list: ok([{ id: 5, nom: "Tremblay", prenom: "Julie", couleur: "#f00", role: "admin", username: "julie" }, { id: 6, nom: "Côté", prenom: "Marc", role: "employee", username: "marc" }]),
      get: ok({}),
      tasks: ok([]),
      update: ok({}),
    },
    clientsApi: {
      list: ok([{ id: 1, nom: "Roy", prenom: "Alex", statut: "Actif", email: "alex@example.com" }]),
      get: ok({}),
      tasks: ok([]),
    },
    contactsApi: { list: ok([]) },
    tasksApi: {
      listByType: ok([]),
      get: vi.fn(() => Promise.resolve(JSON.parse(JSON.stringify(detail)))),
      all: ok([]),
      update: tasksUpdate,
      patch: ok({}),
      invoice: tasksInvoice,
    },
    subcontractsApi: { byTask: ok([]) },
    filesApi: { byTask: ok({ files: [] }) },
    notesApi: { list: ok([]) },
    pertesApi: { list: ok([]) },
    mailApi: { send: mailSend },
  };
});

import { canEditTask, canDeleteOwned } from "@/utils/permissions";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import EmailModal from "@/components/shared/EmailModal.vue";
import TaskDetailView from "@/views/TaskDetailView.vue";
import KanbanView from "@/views/KanbanView.vue";

// --- Règles d'affichage (utils/permissions.js) ------------------------------------------------------

describe("droits d'affichage (miroir des règles du serveur)", () => {
  it("modifier une tâche : admin toujours, employé seulement si assigné", () => {
    const tache = { idAssigne: 5 };
    expect(canEditTask({ isAdmin: true, user: { id: 1 } }, tache)).toBe(true);
    expect(canEditTask({ isAdmin: false, user: { id: 5 } }, tache)).toBe(true);
    expect(canEditTask({ isAdmin: false, user: { id: 6 } }, tache)).toBe(false);
    expect(canEditTask({ isAdmin: false, user: null }, tache)).toBe(false);
  });

  it("supprimer une note, un fichier : admin ou auteur uniquement (une ancienne ligne sans auteur reste admin)", () => {
    expect(canDeleteOwned({ isAdmin: false, user: { id: 5 } }, { idAuteur: 5 })).toBe(true);
    expect(canDeleteOwned({ isAdmin: false, user: { id: 6 } }, { idAuteur: 5 })).toBe(false);
    expect(canDeleteOwned({ isAdmin: false, user: { id: 6 } }, { idAuteur: null })).toBe(false);
    expect(canDeleteOwned({ isAdmin: true, user: { id: 1 } }, { idAuteur: null })).toBe(true);
  });
});

const realApi = await vi.importActual("@/api/index.js");

// --- Pièces jointes : chemin relatif -----------------------------------------------------------------

describe("fileApiPath", () => {
  // Module réel (le module @/api est mocké pour les autres tests de ce fichier)
  const fileApiPath = (file) => realApi.fileApiPath(file);
  it("garde seulement le chemin /uploads/... d'une URL absolue (ancienne fiche)", () => {
    expect(fileApiPath({ url: "https://ancien-hote.example/uploads/rapport.pdf" })).toBe("/uploads/rapport.pdf");
  });

  it("retire la query string et le fragment", () => {
    expect(fileApiPath({ url: "/uploads/a.pdf?x=1#y" })).toBe("/uploads/a.pdf");
  });

  it("une URL relative est utilisée telle quelle", () => {
    expect(fileApiPath({ url: "/uploads/b%20c.pdf" })).toBe("/uploads/b%20c.pdf");
  });

  it("sans URL, reconstruit le chemin depuis le nom du fichier", () => {
    expect(fileApiPath({ filename: "1-x-doc.pdf" })).toBe("/uploads/1-x-doc.pdf");
  });
});

// --- Courriel au client : champs obligatoires -----------------------------------------------------

describe("courriel au client (EmailModal)", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mailSend.mockClear();
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function ouvrir() {
    const wrapper = mount(EmailModal, {
      props: { modelValue: false, recipient: "alex@example.com", name: "Alex" },
      attachTo: document.body,
      global: { config: { warnHandler: () => {} } },
    });
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    return wrapper;
  }

  it("refuse un sujet vide : aucun appel à l'API, message sous le champ", async () => {
    const wrapper = await ouvrir();
    document.querySelector("#email-subject").value = "   ";
    document.querySelector("#email-subject").dispatchEvent(new Event("input"));
    await flushPromises();
    document.querySelector("#email-form").dispatchEvent(new Event("submit"));
    await flushPromises();
    expect(mailSend).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Le sujet est obligatoire");
    wrapper.unmount();
  });

  it("refuse un message vide : aucun appel à l'API", async () => {
    const wrapper = await ouvrir();
    const corps = document.querySelector("textarea");
    corps.value = "";
    corps.dispatchEvent(new Event("input"));
    await flushPromises();
    document.querySelector("#email-form").dispatchEvent(new Event("submit"));
    await flushPromises();
    expect(mailSend).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Le message est obligatoire");
    wrapper.unmount();
  });

  it("refuse un destinataire absent, sans appel à l'API", async () => {
    const wrapper = mount(EmailModal, {
      props: { modelValue: false, recipient: "", name: "" },
      attachTo: document.body,
      global: { config: { warnHandler: () => {} } },
    });
    await wrapper.setProps({ modelValue: true });
    await flushPromises();
    document.querySelector("#email-form").dispatchEvent(new Event("submit"));
    await flushPromises();
    expect(mailSend).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain("Le destinataire est obligatoire");
    wrapper.unmount();
  });
});

// --- Fiche tâche : facturation, lecture seule, confirmation de fin --------------------------------

function makeRouter() {
  const stub = { render: () => null };
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "dashboard", component: stub },
      { path: "/mes-taches", name: "my-tasks", component: stub },
      { path: "/taches", name: "tasks", component: stub },
      { path: "/clients/:id", name: "client-detail", component: stub },
      { path: "/taches/:type/:subId", name: "task-detail", component: stub },
    ],
  });
}

async function ficheTache({ role, id, task = {} }) {
  setActivePinia(createPinia());
  const auth = useAuthStore();
  auth.user = { id, role, prenom: "Test", username: "test" };
  auth.token = "test";
  const api = await import("@/api");
  api.tasksApi.get.mockImplementation(() => Promise.resolve({ ...JSON.parse(JSON.stringify(detail)), ...task }));
  const router = makeRouter();
  await router.push("/");
  const wrapper = mount(TaskDetailView, {
    props: { type: "ppf", subId: "10" },
    attachTo: document.body,
    global: { plugins: [router], config: { warnHandler: () => {}, errorHandler: () => {} } },
  });
  await flushPromises();
  await flushPromises();
  return wrapper;
}

const boutonFacturer = () =>
  [...document.querySelectorAll("button")].find((b) => /Facturer|Facturée/.test(b.textContent));

describe("fiche tâche : facturation et droits", () => {
  beforeEach(() => {
    tasksInvoice.mockClear();
    tasksUpdate.mockClear();
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("un employé ne voit pas le bouton « Facturer »", async () => {
    const wrapper = await ficheTache({ role: "employee", id: 5 });
    expect(boutonFacturer()).toBeUndefined();
    wrapper.unmount();
  });

  it("l'admin voit « Facturer » activé pour une tâche non facturée", async () => {
    const wrapper = await ficheTache({ role: "admin", id: 1 });
    const bouton = boutonFacturer();
    expect(bouton).toBeDefined();
    expect(bouton.textContent).toContain("Facturer");
    expect(bouton.disabled).toBe(false);
    wrapper.unmount();
  });

  it("l'admin voit « Facturée » et un bouton désactivé si qboInvoiceId existe", async () => {
    const wrapper = await ficheTache({
      role: "admin",
      id: 1,
      task: { qboInvoiceId: "99", qboInvoiceNumber: "1001", factureLe: "2026-01-02T10:00:00Z" },
    });
    const bouton = boutonFacturer();
    expect(bouton.textContent).toContain("Facturée");
    expect(bouton.disabled).toBe(true);
    expect(document.body.textContent).toContain("Facturée n° 1001");
    wrapper.unmount();
  });

  it("un employé non assigné voit la fiche en lecture seule (bandeau, champs verrouillés)", async () => {
    // La tâche est assignée à l'employé 5 ; l'employé 6 la consulte
    const wrapper = await ficheTache({ role: "employee", id: 6 });
    expect(document.body.textContent).toContain("Lecture seule");
    const champs = [...document.querySelectorAll("form select, form input, form textarea")];
    expect(champs.length).toBeGreaterThan(0);
    expect(champs.every((c) => c.disabled)).toBe(true);
    wrapper.unmount();
  });

  it("l'employé assigné n'a pas de bandeau « Lecture seule »", async () => {
    const wrapper = await ficheTache({ role: "employee", id: 5 });
    expect(document.body.textContent).not.toContain("Lecture seule");
    wrapper.unmount();
  });
});

describe("fiche tâche : confirmation avant l'étape Terminé", () => {
  beforeEach(() => {
    tasksUpdate.mockClear();
  });
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("demande confirmation ; si l'admin annule, rien n'est envoyé à l'API", async () => {
    const wrapper = await ficheTache({ role: "admin", id: 1 });
    const ui = useUiStore();
    const confirme = vi.spyOn(ui, "confirm").mockResolvedValue(false);

    const select = wrapper.findAll("select").find((s) => s.findAll("option").some((o) => o.element.value === "Termine"));
    expect(select).toBeDefined();
    await select.setValue("Termine");
    await flushPromises();
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(confirme).toHaveBeenCalledTimes(1);
    expect(confirme.mock.calls[0][0].title).toBe("Terminer la tâche");
    expect(tasksUpdate).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("après confirmation, la modification part vers l'API", async () => {
    const wrapper = await ficheTache({ role: "admin", id: 1 });
    const ui = useUiStore();
    vi.spyOn(ui, "confirm").mockResolvedValue(true);

    const select = wrapper.findAll("select").find((s) => s.findAll("option").some((o) => o.element.value === "Termine"));
    await select.setValue("Termine");
    await flushPromises();
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(tasksUpdate).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});

// --- C-06 : tableau de production, cartes non modifiables -----------------------------------------

describe("tableau de production : carte d'une tâche non assignée (C-06)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  async function tableau({ role, id }) {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.user = { id, role, prenom: "Test", username: "test" };
    auth.token = "test";
    const api = await import("@/api");
    // Deux tâches : la 1 assignée à l'employé 5, la 2 à l'employé 6
    const liste = [
      { id: 1, typeTask: "PPF", titre: "Autre", statut: "Design", priorite: "Normal", idClient: 1, idAssigne: 5, datefin: "2030-01-01" },
      { id: 2, typeTask: "PPF", titre: "Mienne", statut: "Design", priorite: "Normal", idClient: 1, idAssigne: 6, datefin: "2030-01-01" },
    ];
    api.usersApi.tasks.mockResolvedValue(liste);
    api.tasksApi.all.mockResolvedValue(liste);
    api.tasksApi.patch.mockClear();
    const router = makeRouter();
    await router.push("/");
    const wrapper = mount(KanbanView, {
      attachTo: document.body,
      global: { plugins: [router], config: { warnHandler: () => {}, errorHandler: () => {} } },
    });
    await flushPromises();
    await flushPromises();
    const carte = (titre) => wrapper.findAll("article.kanban-card").find((c) => c.text().includes(titre));
    return { wrapper, carte, api };
  }

  it("employé : la carte d'un collègue n'est ni déplaçable ni munie de « Terminer » ou du sélecteur", async () => {
    const { wrapper, carte, api } = await tableau({ role: "employee", id: 6 });
    const autre = carte("Autre");
    expect(autre).toBeDefined();
    expect(autre.attributes("draggable")).toBe("false");
    expect(autre.find("button").exists()).toBe(false);
    expect(autre.find("select").exists()).toBe(false);
    expect(autre.text()).toContain("Lecture seule");

    // Glisser-déposer forcé sur la carte : aucun appel à l'API
    await autre.trigger("dragstart", { dataTransfer: { setData: () => {}, effectAllowed: "" } });
    const colonne = wrapper.findAll("section.kanban-column").find((s) => s.attributes("aria-label") === "Production");
    await colonne.trigger("drop");
    await flushPromises();
    expect(api.tasksApi.patch).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("employé : sa propre carte garde le glisser-déposer, « Terminer » et le sélecteur (repli tactile)", async () => {
    const { wrapper, carte } = await tableau({ role: "employee", id: 6 });
    const mienne = carte("Mienne");
    expect(mienne.attributes("draggable")).toBe("true");
    expect(mienne.find("select").exists()).toBe(true);
    expect(mienne.text()).toContain("Terminer");
    wrapper.unmount();
  });

  it("admin : toutes les cartes sont modifiables", async () => {
    const { wrapper } = await tableau({ role: "admin", id: 1 });
    const cartes = wrapper.findAll("article.kanban-card");
    expect(cartes.length).toBe(2);
    expect(cartes.every((c) => c.attributes("draggable") === "true")).toBe(true);
    wrapper.unmount();
  });
});

// --- C-12 : facturation, délai dépassé ----------------------------------------------------------

describe("fiche tâche : facture sans réponse à temps (C-12)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    tasksInvoice.mockReset();
    tasksInvoice.mockResolvedValue({ qboInvoiceId: "99", qboInvoiceNumber: "1001" });
  });

  async function facturerAvecErreur(erreur) {
    const wrapper = await ficheTache({ role: "admin", id: 1 });
    const ui = useUiStore();
    vi.spyOn(ui, "confirm").mockResolvedValue(true);
    const notifyError = vi.spyOn(ui, "notifyError");
    tasksInvoice.mockRejectedValueOnce(erreur);
    const api = await import("@/api");
    // Côté serveur, la facture a été créée malgré l'erreur : le rechargement la renvoie
    api.tasksApi.get.mockClear();
    api.tasksApi.get.mockImplementation(() =>
      Promise.resolve({ ...JSON.parse(JSON.stringify(detail)), qboInvoiceId: "99", qboInvoiceNumber: "1001" })
    );
    boutonFacturer().click();
    await flushPromises();
    await flushPromises();
    return { wrapper, api, notifyError };
  }

  it("délai axios dépassé : message de vérification puis rechargement de la fiche (facture affichée)", async () => {
    const { wrapper, api, notifyError } = await facturerAvecErreur(Object.assign(new Error("timeout"), { code: "ECONNABORTED" }));
    expect(tasksInvoice).toHaveBeenCalledTimes(1);
    expect(notifyError.mock.calls.at(-1)[0]).toContain("Vérifiez la facturation");
    expect(api.tasksApi.get).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).toContain("Facturée n° 1001");
    expect(boutonFacturer().disabled).toBe(true);
    wrapper.unmount();
  });

  it("réponse 503 : même rechargement", async () => {
    const { wrapper, api } = await facturerAvecErreur(Object.assign(new Error("503"), { response: { status: 503, data: {} } }));
    expect(api.tasksApi.get).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).toContain("Facturée n° 1001");
    wrapper.unmount();
  });

  it("erreur 400 (configuration) : pas de rechargement", async () => {
    const { wrapper, api } = await facturerAvecErreur(Object.assign(new Error("400"), { response: { status: 400, data: {} } }));
    expect(api.tasksApi.get).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
