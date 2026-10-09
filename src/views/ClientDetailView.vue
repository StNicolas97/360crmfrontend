<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import FormFields from "@/components/ui/FormFields.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import TaskTable from "@/components/tasks/TaskTable.vue";
import ClientContacts from "@/components/clients/ClientContacts.vue";
import EmailModal from "@/components/shared/EmailModal.vue";
import { clientsApi, errorMessage } from "@/api";
import { CLIENT_FIELDS, EMAIL_PATTERN } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { useClientsStore } from "@/stores/clients";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { normalizeTask, uniqueTasks } from "@/utils/task";
import { clientLabel, fullName } from "@/utils/format";

const props = defineProps({ id: { type: [String, Number], required: true } });
const clientId = computed(() => Number(props.id));

const router = useRouter();
const clients = useClientsStore();
const auth = useAuthStore();
const ui = useUiStore();

const client = ref(null);
const form = ref({});
const errors = ref({});
const tasks = ref([]);
const loading = ref(true);
const loadingTasks = ref(true);
const loadError = ref(null);
const saving = ref(false);
const emailOpen = ref(false);

const dirty = computed(
  () => client.value && CLIENT_FIELDS.some((f) => String(form.value[f.key] ?? "") !== String(client.value[f.key] ?? ""))
);

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    client.value = await clientsApi.get(clientId.value);
    form.value = { ...client.value };
  } catch (e) {
    loadError.value = errorMessage(e, "Client introuvable");
  } finally {
    loading.value = false;
  }
  loadingTasks.value = true;
  try {
    tasks.value = uniqueTasks((await clientsApi.tasks(clientId.value)).map(normalizeTask));
  } catch {
    tasks.value = [];
  } finally {
    loadingTasks.value = false;
  }
}
onMounted(load);

async function save() {
  errors.value = validateForm(form.value, CLIENT_FIELDS);
  if (form.value.email && !EMAIL_PATTERN.test(form.value.email)) errors.value.email = "Courriel invalide";
  if (Object.keys(errors.value).length) return;
  saving.value = true;
  try {
    const payload = Object.fromEntries(CLIENT_FIELDS.map((f) => [f.key, form.value[f.key]]));
    const response = await clients.update(clientId.value, payload);
    client.value = response.client ?? { ...client.value, ...payload };
    form.value = { ...client.value };
    ui.notify("Client mis à jour");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La mise à jour a échoué"));
  } finally {
    saving.value = false;
  }
}

async function remove() {
  const ok = await ui.confirm({
    title: "Supprimer le client",
    message: `${clientLabel(client.value)} et toutes ses tâches (${tasks.value.length}) seront définitivement supprimés.`,
    confirmLabel: "Supprimer",
  });
  if (!ok) return;
  try {
    await clients.remove(clientId.value);
    ui.notify("Client supprimé");
    client.value = null;
    router.replace({ name: "clients" });
  } catch (e) {
    ui.notifyError(errorMessage(e, "La suppression a échoué"));
  }
}

onBeforeRouteLeave(async () =>
  !dirty.value ||
  ui.confirm({ title: "Modifications non enregistrées", message: "Quitter sans enregistrer ?", confirmLabel: "Quitter", variant: "warning" })
);
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border"></span></div>

    <template v-else-if="loadError">
      <PageHeader title="Client" :back="{ name: auth.isAdmin ? 'clients' : 'dashboard' }" />
      <ErrorState :message="loadError" @retry="load" />
    </template>

    <template v-else-if="client">
      <PageHeader :title="clientLabel(client)" :back="{ name: auth.isAdmin ? 'clients' : 'dashboard' }">
        <template #subtitle>
          <span class="d-inline-flex flex-wrap gap-2 align-items-center">
            <StatusBadge :value="client.statut" kind="client" />
            <span v-if="client.entreprise">{{ fullName(client) }}</span>
            <a v-if="client.telephone" :href="`tel:${client.telephone}`"><i class="bi bi-telephone"></i> {{ client.telephone }}</a>
          </span>
        </template>
        <template #actions>
          <button type="button" class="btn btn-light" :disabled="!client.email" @click="emailOpen = true">
            <i class="bi bi-envelope"></i><span class="d-none d-md-inline ms-1">Courriel</span>
          </button>
          <button type="button" class="btn btn-primary" @click="ui.openTaskForm({ idClient: client.id })">
            <i class="bi bi-plus-lg"></i><span class="d-none d-md-inline ms-1">Nouvelle tâche</span>
          </button>
          <button v-if="auth.isAdmin" type="button" class="btn btn-light text-danger" title="Supprimer" @click="remove">
            <i class="bi bi-trash"></i>
          </button>
        </template>
      </PageHeader>

      <div class="detail-grid">
        <form class="card-panel" novalidate @submit.prevent="save">
          <h2 class="panel-title mb-3">Coordonnées</h2>
          <FormFields v-model="form" :fields="CLIENT_FIELDS" :errors="errors" />
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-light" :disabled="!dirty" @click="form = { ...client }">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="!dirty || saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
            </button>
          </div>
        </form>
        <ClientContacts :client-id="client.id" />
      </div>

      <section class="mt-4">
        <h2 class="panel-title mb-3">Tâches du client</h2>
        <TaskTable :tasks="tasks" :loading="loadingTasks" :show-filters="tasks.length > 5" empty-text="Aucune tâche pour ce client" />
      </section>

      <EmailModal v-model="emailOpen" :recipient="client.email || ''" :name="fullName(client, '')" />
    </template>
  </div>
</template>
