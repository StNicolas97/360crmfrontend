<script setup>
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { CLIENT_FIELDS } from "@/constants/forms";
// Contrôle aussi le format des champs de type "email"
import { validateForm } from "@/utils/forms";
import { focusFirstInvalid } from "@/utils/focus";
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
const formEl = ref(null);
// Saisie commencée : Échap, clic extérieur ou Annuler demandent confirmation
const dirty = computed(() => Object.entries(blank()).some(([key, value]) => String(form.value[key] ?? "") !== String(value ?? "")));

watch(open, (isOpen) => {
  if (isOpen) {
    form.value = blank();
    errors.value = {};
  }
});

async function submit() {
  errors.value = validateForm(form.value, CLIENT_FIELDS);
  if (Object.keys(errors.value).length) {
    focusFirstInvalid(formEl.value);
    return;
  }

  saving.value = true;
  try {
    // POST /client renvoie { client } (client.controller.js) ; plus de synchronisation QuickBooks à la création
    const response = await clients.create(form.value);
    ui.notify("Client créé", "success");
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
  <BaseModal v-model="open" title="Nouveau client" size="lg" :dirty="dirty">
    <form id="client-form" ref="formEl" novalidate autocomplete="off" @submit.prevent="submit">
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
