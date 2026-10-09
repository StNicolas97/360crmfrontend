import { defineStore } from "pinia";
import { ref } from "vue";

// État d'interface partagé : notifications, confirmation, modale de création de tâche.
// Remplace alert(), window.confirm() et le bus d'événements global.
export const useUiStore = defineStore("ui", () => {
  const toasts = ref([]);
  let nextId = 1;

  function notify(message, variant = "success", timeout = 4000) {
    const id = nextId++;
    toasts.value.push({ id, message, variant });
    if (timeout) setTimeout(() => dismiss(id), timeout);
  }
  const notifyError = (message) => notify(message, "danger", 6000);

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
