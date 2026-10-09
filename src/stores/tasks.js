import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { tasksApi, usersApi, errorMessage } from "@/api";
import { TASK_TYPES, TASK_TYPE_LIST } from "@/constants/task";
import { normalizeTask, uniqueTasks, isClosed } from "@/utils/task";
import { useAuthStore } from "./auth";

export const useTasksStore = defineStore("tasks", () => {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const loaded = ref(false);
  // Incrémenté à chaque modification : les vues qui ont leurs propres données (calendrier) s'y abonnent
  const version = ref(0);
  let pending = null;

  // Admin : toutes les tâches. Employé : uniquement les siennes.
  async function fetch({ force = false } = {}) {
    if (loaded.value && !force) return items.value;
    if (pending) return pending;
    const auth = useAuthStore();
    loading.value = true;
    error.value = null;

    pending = (async () => {
      try {
        const raw = auth.isAdmin
          ? (await Promise.all(TASK_TYPE_LIST.map((t) => tasksApi.listByType(t.endpoint)))).flat()
          : await usersApi.tasks(auth.user.id);
        items.value = uniqueTasks(raw.map(normalizeTask).filter((t) => t.type));
        loaded.value = true;
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

  const active = computed(() => items.value.filter((t) => !isClosed(t)));
  const leads = computed(() => items.value.filter((t) => t.statut === "Leads"));
  const mine = computed(() => {
    const userId = useAuthStore().user?.id;
    return items.value.filter((t) => t.idAssigne === userId);
  });

  function patchLocal(id, fields) {
    const index = items.value.findIndex((t) => t.id === id);
    if (index !== -1) items.value.splice(index, 1, { ...items.value[index], ...fields });
  }

  function changed() {
    version.value++;
  }

  async function create(type, payload) {
    const response = await tasksApi.create(TASK_TYPES[type].endpoint, {
      ...payload,
      typeTask: TASK_TYPES[type].typeTask,
    });
    await fetch({ force: true });
    changed();
    return response;
  }

  // Mise à jour complète depuis la fiche
  async function update(task, payload) {
    const response = await tasksApi.update(TASK_TYPES[task.type].endpoint, task.id, payload);
    patchLocal(task.id, payload);
    changed();
    return response;
  }

  // Changement rapide de statut (tableau) : optimiste, annulé en cas d'erreur
  async function moveTo(task, statut) {
    const previous = task.statut;
    if (previous === statut) return;
    patchLocal(task.id, { statut });
    try {
      const response = await tasksApi.patch(task.id, { statut });
      changed();
      return response;
    } catch (e) {
      patchLocal(task.id, { statut: previous });
      throw e;
    }
  }

  async function reschedule(taskId, dates) {
    const response = await tasksApi.patch(taskId, dates);
    patchLocal(taskId, dates);
    changed();
    return response;
  }

  async function remove(task) {
    await tasksApi.remove(TASK_TYPES[task.type].endpoint, task.id);
    items.value = items.value.filter((t) => t.id !== task.id);
    changed();
  }

  return {
    items,
    loading,
    error,
    loaded,
    version,
    active,
    leads,
    mine,
    fetch,
    create,
    update,
    moveTo,
    reschedule,
    remove,
    changed,
  };
});
