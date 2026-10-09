<script setup>
import { ref, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { PERTE_FIELDS } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { usePertesStore } from "@/stores/pertes";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";

const open = defineModel({ type: Boolean, default: false });
const pertes = usePertesStore();
const auth = useAuthStore();
const ui = useUiStore();

const blank = () => ({ typeVinyle: "", typeLaminier: "", dimensions: "", cout: null, raison: "" });
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
  errors.value = validateForm(form.value, PERTE_FIELDS);
  if (Object.keys(errors.value).length) return;
  saving.value = true;
  try {
    // La perte est attribuée à l'utilisateur connecté
    await pertes.create({ ...form.value, idAssigne: auth.user.id });
    ui.notify("Perte enregistrée");
    open.value = false;
  } catch (error) {
    ui.notifyError(errorMessage(error, "La perte n'a pas pu être enregistrée"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Déclarer une perte">
    <form id="perte-form" novalidate @submit.prevent="submit">
      <FormFields v-model="form" :fields="PERTE_FIELDS" :errors="errors" />
    </form>
    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="perte-form" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
      </button>
    </template>
  </BaseModal>
</template>
