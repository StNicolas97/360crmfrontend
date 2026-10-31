<script setup>
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import { mailApi, errorMessage } from "@/api";
import { useUiStore } from "@/stores/ui";
import { isEmail } from "@/utils/forms";
import { focusFirstInvalid } from "@/utils/focus";

// Envoi d'un courriel de suivi au client (texte modifiable avant envoi).
// Destinataire, sujet et message sont obligatoires : aucun courriel vide ne part au nom de l'entreprise.
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  recipient: { type: String, default: "" },
  name: { type: String, default: "" },
});

const ui = useUiStore();
const form = ref({ recipient: "", subject: "", body: "" });
const sending = ref(false);
const errors = ref({}); // { recipient, subject, body }
const formEl = ref(null);
const initial = ref(""); // contenu proposé à l'ouverture (détection d'une modification)

watch(open, (isOpen) => {
  if (!isOpen) return;
  errors.value = {};
  form.value = {
    recipient: props.recipient,
    subject: "Suivi de votre projet chez 360 AutoWrap",
    body: `Bonjour ${props.name || ""},\n\nNous souhaitons vous informer que votre projet est toujours en cours chez 360 AutoWrap.\nN'hésitez pas à nous contacter pour toute précision ou pour confirmer la prochaine étape.\n\nCordialement,\nL'équipe 360 AutoWrap`,
  };
  initial.value = JSON.stringify(form.value);
});

// Texte modifié : un tap hors de la fenêtre ou Échap ne l'efface plus sans confirmation
const dirty = computed(() => open.value && JSON.stringify(form.value) !== initial.value);

function validate() {
  const e = {};
  if (!form.value.recipient?.trim()) e.recipient = "Le destinataire est obligatoire";
  else if (!isEmail(form.value.recipient)) e.recipient = "Adresse courriel invalide";
  if (!form.value.subject?.trim()) e.subject = "Le sujet est obligatoire";
  if (!form.value.body?.trim()) e.body = "Le message est obligatoire";
  errors.value = e;
  return Object.keys(e).length === 0;
}

// Attributs ARIA d'un champ : état invalide et message d'erreur relié
const aria = (key) => ({
  "aria-invalid": errors.value[key] ? "true" : undefined,
  "aria-describedby": errors.value[key] ? `email-${key}-error` : undefined,
});

async function send() {
  if (!validate()) {
    focusFirstInvalid(formEl.value);
    return;
  }
  sending.value = true;
  try {
    await mailApi.send({ ...form.value, subject: form.value.subject.trim() });
    ui.notify("Courriel envoyé");
    open.value = false;
  } catch (e) {
    const message = errorMessage(e, "Le courriel n'a pas pu être envoyé");
    // 400 : destinataire inconnu (doit être un client ou un contact enregistré) -> affiché sous le champ
    // 429 : limite d'envois atteinte -> message du serveur en notification
    if (e.response?.status === 400) {
      errors.value = { recipient: message };
      focusFirstInvalid(formEl.value);
    } else ui.notifyError(message);
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" title="Envoyer un courriel" size="lg" :dirty="dirty">
    <form id="email-form" ref="formEl" novalidate @submit.prevent="send">
      <div class="mb-3">
        <label for="email-to" class="form-label">Destinataire<span class="text-danger" aria-hidden="true"> *</span></label>
        <input id="email-to" v-model.trim="form.recipient" type="email" inputmode="email" autocomplete="off" class="form-control" :class="{ 'is-invalid': errors.recipient }" required v-bind="aria('recipient')" />
        <div v-if="errors.recipient" id="email-recipient-error" class="invalid-feedback">{{ errors.recipient }}</div>
      </div>
      <div class="mb-3">
        <label for="email-subject" class="form-label">Sujet<span class="text-danger" aria-hidden="true"> *</span></label>
        <input id="email-subject" v-model="form.subject" type="text" class="form-control" :class="{ 'is-invalid': errors.subject }" required v-bind="aria('subject')" />
        <div v-if="errors.subject" id="email-subject-error" class="invalid-feedback">{{ errors.subject }}</div>
      </div>
      <div>
        <label for="email-body" class="form-label">Message<span class="text-danger" aria-hidden="true"> *</span></label>
        <textarea id="email-body" v-model="form.body" class="form-control" :class="{ 'is-invalid': errors.body }" rows="9" required v-bind="aria('body')"></textarea>
        <div v-if="errors.body" id="email-body-error" class="invalid-feedback">{{ errors.body }}</div>
      </div>
    </form>
    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="email-form" class="btn btn-primary" :disabled="sending">
        <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="bi bi-send me-1" aria-hidden="true"></i>Envoyer
      </button>
    </template>
  </BaseModal>
</template>
