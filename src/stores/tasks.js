import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { tasksApi, usersApi, errorMessage } from "@/api";
import { TASK_TYPES, LEADS_STATUS } from "@/constants/task";
import { normalizeTask, uniqueTasks, isClosed } from "@/utils/task";
import { useAuthStore } from "./auth";

// Forme unique des tâches reçues de l'API (voir utils/task.js)
const normalizeList = (raw) => uniqueTasks((Array.isArray(raw) ? raw : []).map(normalizeTask).filter((t) => t.type));

export const useTasksStore = defineStore("tasks", () => {
  // items : tâches de travail de l'utilisateur (admin = toutes, employé = les siennes)
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const loaded = ref(false);
  let pending = null;

  // planning : toutes les tâches de l'atelier, pour le calendrier partagé (lecture ouverte à tous).
  // Pour un admin, c'est la même liste que items : une seule requête.
  const planningItems = ref([]);
  const planningLoading = ref(false);
  const planningError = ref(null);
  const planningLoaded = ref(false);
  let planningPending = null;

  // Admin : une seule requête /tache/all (au lieu de /ppf + /lettrage + /affichage).
  // Employé : uniquement ses tâches.
  async function fetch({ force = false } = {}) {
    if (loaded.value && !force) return items.value;
    if (pending) return pending;
    const auth = useAuthStore();
    loading.value = true;
    error.value = null;

    pending = (async () => {
      try {
        const raw = auth.isAdmin ? await tasksApi.all() : await usersApi.tasks(auth.user.id);
        items.value = normalizeList(raw);
        loaded.value = true;
        if (auth.isAdmin) {
          planningItems.value = items.value;
          planningLoaded.value = true;
        }
        return items.value;
      } catch (e) {
        error.value = errorMessage(e, "Impossible de charger les tâches");
        throw e;
      } finally {
        loading.value = false;
        pending = null;
      }
    })();
    return pending;
  }

  // Planning de l'atelier (calendrier)
  async function fetchPlanning({ force = false } = {}) {
    const auth = useAuthStore();
    if (auth.isAdmin) {
      // Évite une seconde requête identique : la liste admin contient déjà tout
      planningLoading.value = true;
      planningError.value = null;
      try {
        await fetch({ force });
        return planningItems.value;
      } catch (e) {
        planningError.value = error.value;
        throw e;
      } finally {
        planningLoading.value = false;
      }
    }
    if (planningLoaded.value && !force) return planningItems.value;
    if (planningPending) return planningPending;
    planningLoading.value = true;
    planningError.value = null;
    planningPending = (async () => {
      try {
        planningItems.value = normalizeList(await tasksApi.all());
        planningLoaded.value = true;
        return planningItems.value;
      } catch (e) {
        // Planning global refusé par l'API (403) : on se replie sur les tâches de l'employé.
        // C-07 (audit 11-verification, décision humaine en attente) : aujourd'hui GET /tache/all est ouvert à
        // tout employé, ce 403 n'arrive donc jamais. Conservé tel quel tant que la règle n'est pas tranchée
        // (planning complet pour tous, ou champs client restreints côté serveur).
        if (e.response?.status === 403) {
          planningItems.value = await fetch({ force });
          planningLoaded.value = true;
          return planningItems.value;
        }
        planningError.value = errorMessage(e, "Impossible de charger le calendrier");
        throw e;
      } finally {
        planningLoading.value = false;
        planningPending = null;
      }
    })();
    return planningPending;
  }

  // Fiche complète d'une tâche (champs du sous-type : véhicule, matériel…), hors cache
  async function fetchOne(type, subId) {
    const meta = TASK_TYPES[type];
    if (!meta) throw new Error("Type de tâche inconnu");
    const raw = await tasksApi.get(meta.endpoint, subId);
    if (!raw) throw new Error("Tâche introuvable");
    return normalizeTask({ ...raw, typeTask: raw.typeTask || type });
  }

  const active = computed(() => items.value.filter((t) => !isClosed(t)));
  const leads = computed(() => items.value.filter((t) => t.statut === LEADS_STATUS));
  const mine = computed(() => {
    const userId = useAuthStore().user?.id;
    return items.value.filter((t) => t.idAssigne === userId);
  });

  // Applique une modification locale dans les deux listes (elles partagent souvent les mêmes objets)
  function patchLocal(id, fields) {
    for (const list of [items, planningItems]) {
      const index = list.value.findIndex((t) => t.id === id);
      if (index !== -1) list.value.splice(index, 1, { ...list.value[index], ...fields });
    }
  }

  function removeLocal(id) {
    items.value = items.value.filter((t) => t.id !== id);
    planningItems.value = planningItems.value.filter((t) => t.id !== id);
  }

  // Après une création : rafraîchit ce qui a déjà été chargé (le planning seulement s'il est affiché)
  async function refresh() {
    const auth = useAuthStore();
    await fetch({ force: true });
    if (!auth.isAdmin && planningLoaded.value) await fetchPlanning({ force: true });
  }

  async function create(type, payload) {
    const response = await tasksApi.create(TASK_TYPES[type].endpoint, {
      ...payload,
      typeTask: TASK_TYPES[type].typeTask,
    });
    await refresh();
    return response;
  }

  // Mise à jour complète depuis la fiche
  async function update(task, payload) {
    const response = await tasksApi.update(TASK_TYPES[task.type].endpoint, task.id, payload);
    patchLocal(task.id, payload);
    return response;
  }

  // Changement rapide de statut (tableau) : optimiste, annulé en cas d'erreur
  async function moveTo(task, statut) {
    const previous = task.statut;
    if (previous === statut) return;
    patchLocal(task.id, { statut });
    try {
      return await tasksApi.patch(task.id, { statut });
    } catch (e) {
      patchLocal(task.id, { statut: previous });
      throw e;
    }
  }

  async function reschedule(taskId, dates) {
    const response = await tasksApi.patch(taskId, dates);
    patchLocal(taskId, dates);
    return response;
  }

  async function remove(task) {
    await tasksApi.remove(TASK_TYPES[task.type].endpoint, task.id);
    removeLocal(task.id);
  }

  // Facture QuickBooks (admin). Le serveur calcule montant et client ; on ne transmet que l'id.
  async function invoice(task) {
    const response = await tasksApi.invoice(task.id);
    const fields = {
      qboInvoiceId: response?.qboInvoiceId ?? null,
      qboInvoiceNumber: response?.qboInvoiceNumber ?? null,
      factureLe: response?.factureLe ?? new Date().toISOString(),
    };
    patchLocal(task.id, fields);
    return fields;
  }

  return {
    items,
    loading,
    error,
    loaded,
    planning: planningItems,
    planningLoading,
    planningError,
    planningLoaded,
    active,
    leads,
    mine,
    fetch,
    fetchPlanning,
    fetchOne,
    create,
    update,
    moveTo,
    reschedule,
    remove,
    invoice,
    refresh,
  };
});
