<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import FormFields from "@/components/ui/FormFields.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import TaskSubcontracts from "@/components/tasks/TaskSubcontracts.vue";
import TaskAttachments from "@/components/tasks/TaskAttachments.vue";
import EmailModal from "@/components/shared/EmailModal.vue";
import { tasksApi, errorMessage } from "@/api";
import { TASK_TYPES } from "@/constants/task";
import { TASK_FORMS, allFields, validateForm } from "@/constants/taskForms";
import { useTasksStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { normalizeTask } from "@/utils/task";
import { formatDate, fullName } from "@/utils/format";

const props = defineProps({
  type: { type: String, required: true },
  subId: { type: [String, Number], required: true },
});

const router = useRouter();
const tasks = useTasksStore();
const auth = useAuthStore();
const ui = useUiStore();

const meta = computed(() => TASK_TYPES[props.type]);
const sections = computed(() => TASK_FORMS[props.type] ?? []);

const task = ref(null); // version enregistrée
const form = ref({}); // version en cours d'édition
const errors = ref({});
const loading = ref(true);
const loadError = ref(null);
const saving = ref(false);
const emailOpen = ref(false);
const invoicing = ref(false);

const editableKeys = computed(() => allFields(sections.value).map((f) => f.key));
const dirty = computed(
  () => task.value && editableKeys.value.some((key) => String(form.value[key] ?? "") !== String(task.value[key] ?? ""))
);

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    if (!meta.value) throw new Error("Type de tâche inconnu");
    const raw = await tasksApi.get(meta.value.endpoint, props.subId);
    if (!raw) throw new Error("Tâche introuvable");
    task.value = normalizeTask({ ...raw, typeTask: raw.typeTask || props.type });
    form.value = { ...task.value };
  } catch (e) {
    loadError.value = e.response ? errorMessage(e, "Tâche introuvable") : e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function save() {
  errors.value = validateForm(form.value, allFields(sections.value));
  if (Object.keys(errors.value).length) {
    ui.notifyError("Certains champs sont à corriger");
    return;
  }
  saving.value = true;
  try {
    const payload = Object.fromEntries(editableKeys.value.map((key) => [key, form.value[key] ?? null]));
    const response = await tasks.update(task.value, payload);
    task.value = { ...task.value, ...payload };
    form.value = { ...task.value };
    ui.notify("Modifications enregistrées");
    if (response?.mailSent === true) ui.notify("Le client a été averti par courriel", "info");
    if (response?.mailSent === false) ui.notify("Le courriel au client n'a pas pu être envoyé", "warning");
  } catch (e) {
    ui.notifyError(errorMessage(e, "L'enregistrement a échoué"));
  } finally {
    saving.value = false;
  }
}

function cancel() {
  form.value = { ...task.value };
  errors.value = {};
}

async function remove() {
  const ok = await ui.confirm({
    title: "Supprimer la tâche",
    message: `La tâche #${task.value.id} « ${task.value.titre} » sera définitivement supprimée.`,
    confirmLabel: "Supprimer",
  });
  if (!ok) return;
  try {
    await tasks.remove(task.value);
    ui.notify("Tâche supprimée");
    task.value = null; // évite l'alerte "modifications non enregistrées"
    router.replace({ name: auth.isAdmin ? "tasks" : "my-tasks" });
  } catch (e) {
    ui.notifyError(errorMessage(e, "La suppression a échoué"));
  }
}

async function createInvoice() {
  const ok = await ui.confirm({
    title: "Créer une facture",
    message: "Une facture sera créée dans QuickBooks pour ce client à partir du prix de la tâche.",
    confirmLabel: "Créer la facture",
    variant: "success",
  });
  if (!ok) return;
  invoicing.value = true;
  try {
    await tasksApi.invoice(task.value);
    ui.notify("Facture créée dans QuickBooks");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La facture n'a pas pu être créée"));
  } finally {
    invoicing.value = false;
  }
}

// Avertit avant de quitter la page avec des modifications non enregistrées
onBeforeRouteLeave(async () => {
  if (!dirty.value) return true;
  return ui.confirm({
    title: "Modifications non enregistrées",
    message: "Quitter la page sans enregistrer vos modifications ?",
    confirmLabel: "Quitter",
    variant: "warning",
  });
});

const clientRoute = computed(() => task.value?.idClient && { name: "client-detail", params: { id: task.value.idClient } });
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border"></span></div>

    <template v-else-if="loadError">
      <PageHeader title="Tâche" :back="{ name: 'my-tasks' }" />
      <ErrorState :message="loadError" @retry="load" />
    </template>

    <template v-else-if="task">
      <PageHeader :title="task.titre || 'Tâche'" :back="{ name: auth.isAdmin ? 'tasks' : 'my-tasks' }">
        <template #subtitle>
          <span class="d-inline-flex flex-wrap align-items-center gap-2">
            <span><i class="bi" :class="meta.icon"></i> {{ meta.label }} · #{{ task.id }}</span>
            <StatusBadge :value="task.statut" />
            <StatusBadge :value="task.priorite" kind="priority" />
            <span class="text-muted">Créée le {{ formatDate(task.createdAt) }}</span>
          </span>
        </template>
        <template #actions>
          <RouterLink v-if="clientRoute" :to="clientRoute" class="btn btn-light" title="Fiche client">
            <i class="bi bi-person-vcard"></i><span class="d-none d-xl-inline ms-1">Client</span>
          </RouterLink>
          <button type="button" class="btn btn-light" title="Envoyer un courriel" @click="emailOpen = true">
            <i class="bi bi-envelope"></i><span class="d-none d-xl-inline ms-1">Courriel</span>
          </button>
          <button type="button" class="btn btn-light" title="Créer une facture QuickBooks" :disabled="invoicing" @click="createInvoice">
            <i class="bi bi-receipt"></i><span class="d-none d-xl-inline ms-1">Facturer</span>
          </button>
          <button v-if="auth.isAdmin" type="button" class="btn btn-light text-danger" title="Supprimer" @click="remove">
            <i class="bi bi-trash"></i>
          </button>
        </template>
      </PageHeader>

      <form novalidate @submit.prevent="save">
        <div class="detail-grid">
          <section v-for="section in sections" :key="section.title" class="card-panel">
            <h2 class="panel-title mb-3">{{ section.title }}</h2>
            <FormFields v-model="form" :fields="section.fields" :errors="errors" editing />
          </section>
        </div>

        <!-- Barre d'enregistrement visible uniquement s'il y a des modifications -->
        <Transition name="slide-up">
          <div v-if="dirty" class="save-bar">
            <span><i class="bi bi-pencil-square me-2"></i>Modifications non enregistrées</span>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light" @click="cancel">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
              </button>
            </div>
          </div>
        </Transition>
      </form>

      <div class="detail-grid mt-3">
        <TaskSubcontracts :task-id="task.id" />
        <TaskAttachments :task-id="task.id" />
      </div>

      <EmailModal v-model="emailOpen" :recipient="task.email || ''" :name="fullName(task, '')" />
    </template>
  </div>
</template>
