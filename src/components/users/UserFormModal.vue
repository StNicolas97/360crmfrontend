<script setup>
import { ref, watch, computed } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { USER_FIELDS, PASSWORD_MIN_LENGTH, EMAIL_PATTERN } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { useUsersStore } from "@/stores/users";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";

const open = defineModel({ type: Boolean, default: false });
const users = useUsersStore();
const ui = useUiStore();

const fields = computed(() => [
  ...USER_FIELDS,
  { key: "password", label: "Mot de passe initial", type: "password", required: true, col: 12, autocomplete: "new-password" },
]);
const blank = () => ({ prenom: "", nom: "", username: "", role: "employee", email: "", telephone: "", poste: "", couleur: "#2563eb", password: "" });
const form = ref(blank());
const errors = ref({});
const saving = ref(false);

watch(open, (isOpen) => {
  if (isOpen) {
    form.value = blank();
    errors.value = {};
  }
});

async function submit() {
  errors.value = validateForm(form.value, fields.value);
  if (form.value.password && form.value.password.length < PASSWORD_MIN_LENGTH) {
    errors.value.password = `Au moins ${PASSWORD_MIN_LENGTH} caractères`;
  }
  if (form.value.email && !EMAIL_PATTERN.test(form.value.email)) errors.value.email = "Courriel invalide";
  if (Object.keys(errors.value).length) return;

  saving.value = true;
  try {
    await users.create(form.value);
    ui.notify("Employé créé");
    open.value = false;
  } catch (error) {
    ui.notifyError(errorMessage(error, "L'employé n'a pas pu être créé"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Nouvel employé" size="lg">
    <form id="user-form" novalidate autocomplete="off" @submit.prevent="submit">
      <FormFields v-model="form" :fields="fields" :errors="errors" />
    </form>
    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="user-form" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Créer l'employé
      </button>
    </template>
  </BaseModal>
</template>
