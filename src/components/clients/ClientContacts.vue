<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { contactsApi, errorMessage } from "@/api";
import { CONTACT_FIELDS, EMAIL_PATTERN } from "@/constants/forms";
import { validateForm } from "@/constants/taskForms";
import { useUiStore } from "@/stores/ui";
import { fullName } from "@/utils/format";

// Contacts d'un client : liste, ajout et modification dans une modale, suppression confirmée
const props = defineProps({ clientId: { type: Number, required: true } });
const ui = useUiStore();

const contacts = ref([]);
const loading = ref(true);
const modalOpen = ref(false);
const editing = ref(null); // contact en cours de modification, null = création
const form = ref({});
const errors = ref({});
const saving = ref(false);

async function load() {
  loading.value = true;
  try {
    contacts.value = await contactsApi.list(props.clientId);
  } catch (e) {
    ui.notifyError(errorMessage(e, "Impossible de charger les contacts"));
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openForm(contact = null) {
  editing.value = contact;
  form.value = contact ? { ...contact } : { prenom: "", nom: "", telephone: "", email: "", poste: "" };
  errors.value = {};
  modalOpen.value = true;
}

async function save() {
  errors.value = validateForm(form.value, CONTACT_FIELDS);
  if (form.value.email && !EMAIL_PATTERN.test(form.value.email)) errors.value.email = "Courriel invalide";
  if (Object.keys(errors.value).length) return;
  saving.value = true;
  try {
    if (editing.value) await contactsApi.update(editing.value.id, form.value);
    else await contactsApi.create(props.clientId, form.value);
    ui.notify(editing.value ? "Contact modifié" : "Contact ajouté");
    modalOpen.value = false;
    await load();
  } catch (e) {
    ui.notifyError(errorMessage(e, "Le contact n'a pas pu être enregistré"));
  } finally {
    saving.value = false;
  }
}

async function remove(contact) {
  const ok = await ui.confirm({
    title: "Supprimer le contact",
    message: `Supprimer ${fullName(contact, "ce contact")} ?`,
    confirmLabel: "Supprimer",
  });
  if (!ok) return;
  try {
    await contactsApi.remove(contact.id);
    contacts.value = contacts.value.filter((c) => c.id !== contact.id);
    ui.notify("Contact supprimé");
  } catch (e) {
    ui.notifyError(errorMessage(e, "Le contact n'a pas pu être supprimé"));
  }
}
</script>

<template>
  <div class="card-panel">
    <div class="panel-header">
      <h2 class="panel-title">Contacts</h2>
      <button type="button" class="btn btn-sm btn-outline-primary" @click="openForm()">
        <i class="bi bi-plus-lg me-1"></i>Ajouter
      </button>
    </div>

    <div v-if="loading" class="text-center py-4"><span class="spinner-border spinner-border-sm"></span></div>
    <p v-else-if="!contacts.length" class="text-muted text-center py-3 mb-0">Aucun contact</p>
    <ul v-else class="list-unstyled mb-0 contact-list">
      <li v-for="contact in contacts" :key="contact.id" class="contact-item">
        <div class="min-w-0">
          <div class="fw-semibold">{{ fullName(contact, "Contact sans nom") }}</div>
          <small class="text-muted d-block text-truncate">
            {{ [contact.poste, contact.telephone, contact.email].filter(Boolean).join(" · ") }}
          </small>
        </div>
        <div class="d-flex gap-1">
          <button type="button" class="btn btn-sm btn-light btn-icon" aria-label="Modifier" @click="openForm(contact)">
            <i class="bi bi-pencil"></i>
          </button>
          <button type="button" class="btn btn-sm btn-light btn-icon text-danger" aria-label="Supprimer" @click="remove(contact)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </li>
    </ul>

    <BaseModal v-model="modalOpen" :title="editing ? 'Modifier le contact' : 'Nouveau contact'">
      <form id="contact-form" novalidate @submit.prevent="save">
        <FormFields v-model="form" :fields="CONTACT_FIELDS" :errors="errors" />
      </form>
      <template #footer="{ close }">
        <button type="button" class="btn btn-light" @click="close">Annuler</button>
        <button type="submit" form="contact-form" class="btn btn-primary" :disabled="saving">Enregistrer</button>
      </template>
    </BaseModal>
  </div>
</template>
