<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import FormFields from "@/components/ui/FormFields.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import TaskTable from "@/components/tasks/TaskTable.vue";
import PasswordForm from "@/components/users/PasswordForm.vue";
import { usersApi, errorMessage } from "@/api";
import { USER_FIELDS, EMAIL_PATTERN } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { useUsersStore } from "@/stores/users";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { normalizeTask, uniqueTasks } from "@/utils/task";
import { fullName } from "@/utils/format";

// Fiche employé (administrateur)
const props = defineProps({ id: { type: [String, Number], required: true } });
const userId = computed(() => Number(props.id));

const router = useRouter();
const users = useUsersStore();
const auth = useAuthStore();
const ui = useUiStore();

const user = ref(null);
const form = ref({});
const errors = ref({});
const tasks = ref([]);
const loading = ref(true);
const loadError = ref(null);
const saving = ref(false);

const isSelf = computed(() => userId.value === auth.user?.id);
const dirty = computed(() => user.value && USER_FIELDS.some((f) => String(form.value[f.key] ?? "") !== String(user.value[f.key] ?? "")));

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    const [found, rawTasks] = await Promise.all([usersApi.get(userId.value), usersApi.tasks(userId.value)]);
    user.value = found;
    form.value = { ...found, couleur: found.couleur || "#6c757d" };
    tasks.value = uniqueTasks(rawTasks.map(normalizeTask));
  } catch (e) {
    loadError.value = errorMessage(e, "Employé introuvable");
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function save() {
  errors.value = validateForm(form.value, USER_FIELDS);
  if (form.value.email && !EMAIL_PATTERN.test(form.value.email)) errors.value.email = "Courriel invalide";
  if (Object.keys(errors.value).length) return;
  saving.value = true;
  try {
    const payload = Object.fromEntries(USER_FIELDS.map((f) => [f.key, form.value[f.key]]));
    await users.update(userId.value, payload);
    user.value = { ...user.value, ...payload };
    form.value = { ...user.value };
    if (isSelf.value) auth.updateLocalUser({ nom: payload.nom, prenom: payload.prenom });
    ui.notify("Employé mis à jour");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La mise à jour a échoué"));
  } finally {
    saving.value = false;
  }
}

async function remove() {
  const ok = await ui.confirm({
    title: "Supprimer l'employé",
    message: `Le compte de ${fullName(user.value)} sera supprimé. Ses tâches assignées (${tasks.value.length}) devront être réattribuées.`,
    confirmLabel: "Supprimer",
  });
  if (!ok) return;
  try {
    await users.remove(userId.value);
    ui.notify("Employé supprimé");
    user.value = null;
    router.replace({ name: "users" });
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
      <PageHeader title="Employé" :back="{ name: 'users' }" />
      <ErrorState :message="loadError" @retry="load" />
    </template>

    <template v-else-if="user">
      <PageHeader :title="fullName(user)" :subtitle="user.poste || `@${user.username}`" :back="{ name: 'users' }">
        <template #actions>
          <button v-if="!isSelf" type="button" class="btn btn-light text-danger" title="Supprimer" @click="remove">
            <i class="bi bi-trash"></i><span class="d-none d-md-inline ms-1">Supprimer</span>
          </button>
        </template>
      </PageHeader>

      <div class="detail-grid">
        <form class="card-panel" novalidate @submit.prevent="save">
          <h2 class="panel-title mb-3">Informations</h2>
          <FormFields v-model="form" :fields="USER_FIELDS" :errors="errors" />
          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" class="btn btn-light" :disabled="!dirty" @click="form = { ...user }">Annuler</button>
            <button type="submit" class="btn btn-primary" :disabled="!dirty || saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
            </button>
          </div>
        </form>
        <PasswordForm :user-id="user.id" :require-current="isSelf" />
      </div>

      <section class="mt-4">
        <h2 class="panel-title mb-3">Tâches assignées</h2>
        <TaskTable :tasks="tasks" :show-assignee="false" :show-filters="tasks.length > 5" empty-text="Aucune tâche assignée" />
      </section>
    </template>
  </div>
</template>
