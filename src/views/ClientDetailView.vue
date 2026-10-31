<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import FormFields from "@/components/ui/FormFields.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import TaskTable from "@/components/tasks/TaskTable.vue";
import ClientContacts from "@/components/clients/ClientContacts.vue";
import EmailModal from "@/components/shared/EmailModal.vue";
import { errorMessage } from "@/api";
import { CLIENT_FIELDS } from "@/constants/forms";
import { useEditableRecord } from "@/composables/useEditableRecord";
import { useClientsStore } from "@/stores/clients";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { clientLabel, fullName } from "@/utils/format";

const props = defineProps({ id: { type: [String, Number], required: true } });
const clientId = computed(() => Number(props.id));

const router = useRouter();
const clients = useClientsStore();
const auth = useAuthStore();
const ui = useUiStore();

// client = version enregistrée, form = version en cours d'édition (voir useEditableRecord)
const { record: client, form, errors, dirty, setRecord, cancel, validate, payload, discard } = useEditableRecord(CLIENT_FIELDS);
const tasks = ref([]);
const tasksError = ref(null);
const loading = ref(true);
const loadingTasks = ref(false);
const loadError = ref(null);
const saving = ref(false);
const emailOpen = ref(false);

async function loadTasks() {
  loadingTasks.value = true;
  tasksError.value = null;
  try {
    tasks.value = await clients.tasksOf(clientId.value);
  } catch (e) {
    tasks.value = [];
    tasksError.value = errorMessage(e, "Impossible de charger les tâches du client");
  } finally {
    loadingTasks.value = false;
  }
}

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    setRecord(await clients.fetchOne(clientId.value));
  } catch (e) {
    loadError.value = errorMessage(e, "Client introuvable");
    return; // fiche introuvable : inutile de charger ses tâches
  } finally {
    loading.value = false;
  }
  await loadTasks();
}
onMounted(load);

async function save() {
  if (!validate()) return;
  saving.value = true;
  try {
    const values = payload();
    const response = await clients.update(clientId.value, values);
    setRecord(response.client ?? { ...client.value, ...values });
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
    discard();
    router.replace({ name: "clients" });
  } catch (e) {
    ui.notifyError(errorMessage(e, "La suppression a échoué"));
  }
}
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
            <button type="button" class="btn btn-light" :disabled="!dirty" @click="cancel">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="!dirty || saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
            </button>
          </div>
        </form>
        <ClientContacts :client-id="client.id" />
      </div>

      <section class="mt-4">
        <h2 class="panel-title mb-3">Tâches du client</h2>
        <ErrorState v-if="tasksError" :message="tasksError" @retry="loadTasks" />
        <TaskTable v-else :tasks="tasks" :loading="loadingTasks" :show-filters="tasks.length > 5" empty-text="Aucune tâche pour ce client" />
      </section>

      <EmailModal v-model="emailOpen" :recipient="client.email || ''" :name="fullName(client, '')" />
    </template>
  </div>
</template>
