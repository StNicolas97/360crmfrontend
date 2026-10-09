<script setup>
import { ref, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import { mailApi, errorMessage } from "@/api";
import { useUiStore } from "@/stores/ui";
import { EMAIL_PATTERN } from "@/constants/forms";

// Envoi d'un courriel de suivi au client (texte modifiable avant envoi)
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  recipient: { type: String, default: "" },
  name: { type: String, default: "" },
});

const ui = useUiStore();
const form = ref({ recipient: "", subject: "", body: "" });
const sending = ref(false);
const error = ref("");

watch(open, (isOpen) => {
  if (!isOpen) return;
  error.value = "";
  form.value = {
    recipient: props.recipient,
    subject: "Suivi de votre projet chez 360 AutoWrap",
    body: `Bonjour ${props.name || ""},\n\nNous souhaitons vous informer que votre projet est toujours en cours chez 360 AutoWrap.\nN'hésitez pas à nous contacter pour toute précision ou pour confirmer la prochaine étape.\n\nCordialement,\nL'équipe 360 AutoWrap`,
  };
});

async function send() {
  if (!EMAIL_PATTERN.test(form.value.recipient)) {
    error.value = "Adresse courriel invalide";
    return;
  }
  sending.value = true;
  try {
    await mailApi.send(form.value);
    ui.notify("Courriel envoyé");
    open.value = false;
  } catch (e) {
    ui.notifyError(errorMessage(e, "Le courriel n'a pas pu être envoyé"));
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Envoyer un courriel" size="lg">
    <form id="email-form" novalidate @submit.prevent="send">
      <div class="mb-3">
        <label for="email-to" class="form-label">Destinataire</label>
        <input id="email-to" v-model.trim="form.recipient" type="email" class="form-control" :class="{ 'is-invalid': error }" required />
        <div class="invalid-feedback">{{ error }}</div>
      </div>
      <div class="mb-3">
        <label for="email-subject" class="form-label">Sujet</label>
        <input id="email-subject" v-model="form.subject" type="text" class="form-control" required />
      </div>
      <div>
        <label for="email-body" class="form-label">Message</label>
        <textarea id="email-body" v-model="form.body" class="form-control" rows="9" required></textarea>
      </div>
    </form>
    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="email-form" class="btn btn-primary" :disabled="sending">
        <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="bi bi-send me-1"></i>Envoyer
      </button>
    </template>
  </BaseModal>
</template>
