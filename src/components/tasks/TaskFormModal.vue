<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import ClientFormModal from "@/components/clients/ClientFormModal.vue";
import { TASK_TYPE_LIST, LEADS_STATUS } from "@/constants/task";
import { TASK_FORMS, NOTE_FIELDS, allFields, emptyForm, validateForm } from "@/constants/taskForms";
import { useUiStore } from "@/stores/ui";
import { useTasksStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { useNotesStore } from "@/stores/notes";
import { errorMessage } from "@/api";
import { todayISO } from "@/utils/format";
import { normalizeTask, taskRoute } from "@/utils/task";
import { focusFirstInvalid } from "@/utils/focus";

// Modale unique de création (tâche PPF / Lettrage / Affichage, ou note de calendrier).
// Ouverte depuis n'importe quelle vue via ui.openTaskForm({ datedebut, type }).
const ui = useUiStore();
const tasks = useTasksStore();
const auth = useAuthStore();
const notes = useNotesStore();
const router = useRouter();

const typeOptions = [...TASK_TYPE_LIST.map((t) => ({ value: t.key, label: t.label, icon: t.icon })), { value: "note", label: "Note", icon: "bi-sticky" }];

const type = ref("ppf");
const form = ref({});
const errors = ref({});
const saving = ref(false);
const clientModalOpen = ref(false);
const formEl = ref(null);
const pickerEl = ref(null);
const initialSnapshot = ref("{}"); // état du formulaire à l'ouverture (détection de saisie)

const open = computed({
  get: () => ui.taskForm.open,
  set: (value) => !value && ui.closeTaskForm(),
});

const sections = computed(() =>
  type.value === "note"
    ? [{ title: "", fields: NOTE_FIELDS }]
    : TASK_FORMS[type.value].map((s) => ({ ...s, fields: s.fields.filter((f) => !f.editOnly) }))
);
const fields = computed(() => allFields(sections.value));

function reset() {
  const { type: presetType, ...defaults } = ui.taskForm.defaults;
  if (presetType) type.value = presetType;
  form.value = emptyForm(sections.value, {
    dateCommande: todayISO(),
    priorite: "Normal",
    statut: LEADS_STATUS,
    // Un employé crée la tâche à son nom ; il ne choisit pas l'assignation
    idAssigne: auth.isAdmin ? null : auth.user.id,
    ...defaults,
  });
  errors.value = {};
  initialSnapshot.value = JSON.stringify(form.value);
}

// Saisie commencée : Échap, × ou Annuler demandent confirmation avant de tout perdre
const dirty = computed(() => JSON.stringify(form.value) !== initialSnapshot.value);

watch(open, (isOpen) => isOpen && reset());
// Changer de type conserve les champs communs déjà saisis
watch(type, () => {
  const wasClean = !dirty.value;
  const kept = form.value;
  form.value = { ...emptyForm(sections.value), ...kept };
  errors.value = {};
  // Changer de type sans rien avoir saisi ne compte pas comme une saisie
  if (wasClean) initialSnapshot.value = JSON.stringify(form.value);
});

function onClientCreated(client) {
  if (client?.id) form.value = { ...form.value, idClient: client.id };
}

// Sélecteur de type (radiogroup) : flèches pour changer d'option, un seul arrêt de tabulation
function onPickerKeydown(event) {
  const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
  if (!(event.key in keys)) return;
  event.preventDefault();
  const index = typeOptions.findIndex((o) => o.value === type.value);
  const next = typeOptions[(index + keys[event.key] + typeOptions.length) % typeOptions.length];
  type.value = next.value;
  pickerEl.value?.querySelectorAll("[role='radio']")[typeOptions.indexOf(next)]?.focus();
}

async function submit() {
  errors.value = validateForm(form.value, fields.value);
  if (Object.keys(errors.value).length) {
    // Formulaire long sur téléphone : on amène l'utilisateur au premier champ à corriger
    ui.notifyError("Certains champs sont à corriger");
    focusFirstInvalid(formEl.value);
    return;
  }

  saving.value = true;
  try {
    if (type.value === "note") {
      // Le store des notes est partagé avec le calendrier : il se met à jour sans rechargement complet
      await notes.create({ ...form.value, datefin: form.value.datefin || form.value.datedebut });
      ui.notify("Note ajoutée au calendrier");
      open.value = false;
      return;
    }
    const response = await tasks.create(type.value, form.value);
    ui.notify("Tâche créée");
    open.value = false;
    const created = response?.data ? normalizeTask({ ...response.data, typeTask: type.value }) : null;
    if (created?.subId) router.push(taskRoute(created));
  } catch (error) {
    ui.notifyError(errorMessage(error, "La tâche n'a pas pu être créée"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" :title="type === 'note' ? 'Nouvelle note' : 'Nouvelle tâche'" size="lg" persistent :dirty="dirty">
    <div ref="pickerEl" class="type-picker mb-4" role="radiogroup" aria-label="Type de travail" @keydown="onPickerKeydown">
      <button
        v-for="option in typeOptions"
        :key="option.value"
        type="button"
        role="radio"
        class="type-option"
        :class="{ active: type === option.value }"
        :aria-checked="type === option.value"
        :tabindex="type === option.value ? 0 : -1"
        @click="type = option.value"
      >
        <i class="bi" :class="option.icon" aria-hidden="true"></i>
        <span>{{ option.label }}</span>
      </button>
    </div>

    <form id="task-form" ref="formEl" novalidate @submit.prevent="submit">
      <section v-for="section in sections" :key="section.title" class="form-section">
        <h3 v-if="section.title" class="form-section-title">{{ section.title }}</h3>
        <FormFields v-model="form" :fields="section.fields" :errors="errors" @add-client="clientModalOpen = true" />
      </section>
    </form>

    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="task-form" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
        {{ type === "note" ? "Ajouter la note" : "Créer la tâche" }}
      </button>
    </template>
  </BaseModal>

  <ClientFormModal v-model="clientModalOpen" @saved="onClientCreated" />
</template>
