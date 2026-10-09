<script setup>
import { ref, computed } from "vue";
import { PASSWORD_MIN_LENGTH } from "@/constants/forms";
import { useUsersStore } from "@/stores/users";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";

// Changement de mot de passe. Pour son propre compte, le mot de passe actuel est exigé.
const props = defineProps({
  userId: { type: Number, required: true },
  requireCurrent: { type: Boolean, default: true },
});

const users = useUsersStore();
const ui = useUiStore();
const form = ref({ currentPassword: "", newPassword: "", confirm: "" });
const errors = ref({});
const saving = ref(false);

const strength = computed(() => {
  const p = form.value.newPassword;
  let score = 0;
  if (p.length >= PASSWORD_MIN_LENGTH) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

async function submit() {
  errors.value = {};
  if (props.requireCurrent && !form.value.currentPassword) errors.value.currentPassword = "Obligatoire";
  if (form.value.newPassword.length < PASSWORD_MIN_LENGTH) errors.value.newPassword = `Au moins ${PASSWORD_MIN_LENGTH} caractères`;
  if (form.value.newPassword !== form.value.confirm) errors.value.confirm = "Les mots de passe ne correspondent pas";
  if (Object.keys(errors.value).length) return;

  saving.value = true;
  try {
    await users.update(props.userId, {
      newPassword: form.value.newPassword,
      ...(props.requireCurrent && { currentPassword: form.value.currentPassword }),
    });
    form.value = { currentPassword: "", newPassword: "", confirm: "" };
    ui.notify("Mot de passe modifié");
  } catch (e) {
    ui.notifyError(errorMessage(e, "Le mot de passe n'a pas pu être modifié"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form class="card-panel" novalidate autocomplete="off" @submit.prevent="submit">
    <h2 class="panel-title mb-3">{{ requireCurrent ? "Changer mon mot de passe" : "Réinitialiser le mot de passe" }}</h2>
    <div v-if="requireCurrent" class="mb-3">
      <label for="pwd-current" class="form-label">Mot de passe actuel</label>
      <input id="pwd-current" v-model="form.currentPassword" type="password" class="form-control" :class="{ 'is-invalid': errors.currentPassword }" autocomplete="current-password" />
      <div class="invalid-feedback">{{ errors.currentPassword }}</div>
    </div>
    <div class="mb-3">
      <label for="pwd-new" class="form-label">Nouveau mot de passe</label>
      <input id="pwd-new" v-model="form.newPassword" type="password" class="form-control" :class="{ 'is-invalid': errors.newPassword }" autocomplete="new-password" />
      <div class="invalid-feedback">{{ errors.newPassword }}</div>
      <div class="password-meter mt-2" :data-score="strength" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <small class="text-muted">{{ PASSWORD_MIN_LENGTH }} caractères minimum ; mélangez majuscules, chiffres et symboles.</small>
    </div>
    <div class="mb-3">
      <label for="pwd-confirm" class="form-label">Confirmer</label>
      <input id="pwd-confirm" v-model="form.confirm" type="password" class="form-control" :class="{ 'is-invalid': errors.confirm }" autocomplete="new-password" />
      <div class="invalid-feedback">{{ errors.confirm }}</div>
    </div>
    <div class="d-flex justify-content-end">
      <button type="submit" class="btn btn-outline-primary" :disabled="saving || !form.newPassword">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Mettre à jour
      </button>
    </div>
  </form>
</template>
