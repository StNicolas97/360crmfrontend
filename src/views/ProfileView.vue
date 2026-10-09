<script setup>
import { ref, computed, onMounted } from "vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import FormFields from "@/components/ui/FormFields.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import PasswordForm from "@/components/users/PasswordForm.vue";
import { usersApi, errorMessage } from "@/api";
import { USER_FIELDS, EMAIL_PATTERN } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { useUiStore } from "@/stores/ui";

// Profil de l'utilisateur connecté : il ne modifie ni son rôle ni son identifiant
const auth = useAuthStore();
const users = useUsersStore();
const ui = useUiStore();

const fields = USER_FIELDS.filter((f) => !["role", "username"].includes(f.key));
const profile = ref(null);
const form = ref({});
const errors = ref({});
const loading = ref(true);
const loadError = ref(null);
const saving = ref(false);

const dirty = computed(() => profile.value && fields.some((f) => String(form.value[f.key] ?? "") !== String(profile.value[f.key] ?? "")));

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    profile.value = await usersApi.get(auth.user.id);
    form.value = { ...profile.value, couleur: profile.value.couleur || "#6c757d" };
  } catch (e) {
    loadError.value = errorMessage(e, "Impossible de charger votre profil");
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function save() {
  errors.value = validateForm(form.value, fields);
  if (form.value.email && !EMAIL_PATTERN.test(form.value.email)) errors.value.email = "Courriel invalide";
  if (Object.keys(errors.value).length) return;
  saving.value = true;
  try {
    const payload = Object.fromEntries(fields.map((f) => [f.key, form.value[f.key]]));
    await users.update(auth.user.id, payload);
    profile.value = { ...profile.value, ...payload };
    auth.updateLocalUser({ nom: payload.nom, prenom: payload.prenom });
    ui.notify("Profil mis à jour");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La mise à jour a échoué"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <PageHeader title="Mon profil" :subtitle="`@${auth.user?.username} · ${auth.isAdmin ? 'Administrateur' : 'Employé'}`" />
    <div v-if="loading" class="text-center py-5"><span class="spinner-border"></span></div>
    <ErrorState v-else-if="loadError" :message="loadError" @retry="load" />
    <div v-else class="detail-grid">
      <form class="card-panel" novalidate @submit.prevent="save">
        <h2 class="panel-title mb-3">Mes informations</h2>
        <FormFields v-model="form" :fields="fields" :errors="errors" />
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button type="submit" class="btn btn-primary" :disabled="!dirty || saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
          </button>
        </div>
      </form>
      <PasswordForm :user-id="auth.user.id" require-current />
    </div>
  </div>
</template>
