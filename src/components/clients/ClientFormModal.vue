<script setup>
import { ref, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { CLIENT_FIELDS, EMAIL_PATTERN } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { useClientsStore } from "@/stores/clients";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";

const open = defineModel({ type: Boolean, default: false });
const emit = defineEmits(["saved"]);

const clients = useClientsStore();
const ui = useUiStore();
const blank = () => ({ prenom: "", nom: "", entreprise: "", email: "", telephone: "", adresse: "", statut: "Actif" });
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
  errors.value = validateForm(form.value, CLIENT_FIELDS);
  if (form.value.email && !EMAIL_PATTERN.test(form.value.email)) errors.value.email = "Courriel invalide";
  if (Object.keys(errors.value).length) return;

  saving.value = true;
  try {
    const response = await clients.create(form.value);
    ui.notify(
      response.quickbooks === false ? "Client créé (non synchronisé avec QuickBooks)" : "Client créé",
      response.quickbooks === false ? "warning" : "success"
    );
    emit("saved", response.client);
    open.value = false;
  } catch (error) {
    ui.notifyError(errorMessage(error, "Le client n'a pas pu être créé"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Nouveau client" size="lg">
    <form id="client-form" novalidate @submit.prevent="submit">
      <FormFields v-model="form" :fields="CLIENT_FIELDS" :errors="errors" />
    </form>
    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="client-form" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Créer le client
      </button>
    </template>
  </BaseModal>
</template>
