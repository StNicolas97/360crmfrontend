<script setup>
import { ref, watch, computed } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { USER_FIELDS, PASSWORD_MIN_LENGTH } from "@/constants/forms";
// Contrôle aussi le format des champs de type "email"
import { validateForm } from "@/utils/forms";
import { focusFirstInvalid } from "@/utils/focus";
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
const formEl = ref(null);
const dirty = computed(() => Object.entries(blank()).some(([key, value]) => String(form.value[key] ?? "") !== String(value ?? "")));

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
  if (Object.keys(errors.value).length) {
    focusFirstInvalid(formEl.value);
    return;
  }

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
  <BaseModal v-model="open" title="Nouvel employé" size="lg" :dirty="dirty">
    <form id="user-form" ref="formEl" novalidate autocomplete="off" @submit.prevent="submit">
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
