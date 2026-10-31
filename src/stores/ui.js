import { defineStore } from "pinia";
import { ref } from "vue";
import { errorMessage } from "@/api";

// État d'interface partagé : notifications, confirmation, modale de création de tâche.
// Remplace alert(), window.confirm() et le bus d'événements global.
export const useUiStore = defineStore("ui", () => {
  const toasts = ref([]);
  let nextId = 1;

  function notify(message, variant = "success", timeout = 4000) {
    // Même message déjà affiché (ex. plusieurs composants en échec au même moment) : pas de doublon
    if (toasts.value.some((t) => t.message === message && t.variant === variant)) return;
    const id = nextId++;
    toasts.value.push({ id, message, variant });
    if (timeout) setTimeout(() => dismiss(id), timeout);
  }
  const notifyError = (message) => notify(message, "danger", 6000);

  // Gestionnaire pour les chargements secondaires (listes de référence : clients, employés…)
  // dont l'échec n'a pas d'écran d'erreur dédié : remplace les .catch(() => {}) muets.
  // Usage : clients.fetch().catch(ui.onLoadError("Liste des clients indisponible"))
  const onLoadError = (fallback) => (error) => notifyError(errorMessage(error, fallback));

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  // confirm({ title, message, confirmLabel, variant }) -> Promise<boolean>
  const confirmState = ref(null);
  function confirm(options) {
    return new Promise((resolve) => {
      confirmState.value = {
        title: "Confirmation",
        confirmLabel: "Confirmer",
        variant: "danger",
        ...options,
        resolve,
      };
    });
  }
  function closeConfirm(result) {
    confirmState.value?.resolve(result);
    confirmState.value = null;
  }

  // Modale de création de tâche, ouvrable depuis n'importe quelle vue
  const taskForm = ref({ open: false, defaults: {} });
  function openTaskForm(defaults = {}) {
    taskForm.value = { open: true, defaults };
  }
  function closeTaskForm() {
    taskForm.value = { open: false, defaults: {} };
  }

  const sidebarOpen = ref(false);

  return {
    toasts,
    notify,
    notifyError,
    onLoadError,
    dismiss,
    confirmState,
    confirm,
    closeConfirm,
    taskForm,
    openTaskForm,
    closeTaskForm,
    sidebarOpen,
  };
});
