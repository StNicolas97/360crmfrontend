<script setup>
import { ref, onMounted } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { subcontractsApi, errorMessage } from "@/api";
import { SUBCONTRACT_FIELDS, validateForm } from "@/constants/taskForms";
import { useUiStore } from "@/stores/ui";
import { formatDate, formatMoney } from "@/utils/format";

// Travaux confiés à un sous-traitant pour une tâche donnée
const props = defineProps({ taskId: { type: Number, required: true } });
const ui = useUiStore();

const items = ref([]);
const loading = ref(true);
const modalOpen = ref(false);
const form = ref({});
const errors = ref({});
const saving = ref(false);

async function load() {
  loading.value = true;
  try {
    items.value = await subcontractsApi.byTask(props.taskId);
  } catch (e) {
    ui.notifyError(errorMessage(e, "Impossible de charger la sous-traitance"));
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function openForm() {
  form.value = Object.fromEntries(SUBCONTRACT_FIELDS.map((f) => [f.key, null]));
  errors.value = {};
  modalOpen.value = true;
}

async function save() {
  errors.value = validateForm(form.value, SUBCONTRACT_FIELDS);
  if (Object.keys(errors.value).length) return;
  saving.value = true;
  try {
    await subcontractsApi.create({ ...form.value, idTache: props.taskId });
    ui.notify("Sous-traitance ajoutée");
    modalOpen.value = false;
    await load();
  } catch (e) {
    ui.notifyError(errorMessage(e, "La sous-traitance n'a pas pu être ajoutée"));
  } finally {
    saving.value = false;
  }
}

async function remove(item) {
  const ok = await ui.confirm({ title: "Supprimer", message: `Supprimer « ${item.titre} » ?`, confirmLabel: "Supprimer" });
  if (!ok) return;
  try {
    await subcontractsApi.remove(item.id);
    items.value = items.value.filter((i) => i.id !== item.id);
    ui.notify("Sous-traitance supprimée");
  } catch (e) {
    ui.notifyError(errorMessage(e, "Suppression impossible"));
  }
}
</script>

<template>
  <div class="card-panel">
    <div class="panel-header">
      <h2 class="panel-title">Sous-traitance</h2>
      <button type="button" class="btn btn-sm btn-outline-primary" @click="openForm">
        <i class="bi bi-plus-lg me-1"></i>Ajouter
      </button>
    </div>
    <div v-if="loading" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>
    <p v-else-if="!items.length" class="text-muted text-center py-2 mb-0">Aucun travail sous-traité</p>
    <ul v-else class="list-unstyled mb-0 contact-list">
      <li v-for="item in items" :key="item.id" class="contact-item">
        <div class="min-w-0">
          <div class="fw-semibold">{{ item.titre }} <span class="text-muted fw-normal">— {{ item.sousTraitant }}</span></div>
          <small class="text-muted">
            Envoi : {{ formatDate(item.dateEnvoi) }}
            <template v-if="item.quantite"> · Qté {{ item.quantite }}</template>
            <template v-if="item.prix"> · {{ formatMoney(item.prix) }}</template>
          </small>
        </div>
        <button type="button" class="btn btn-sm btn-light btn-icon text-danger" aria-label="Supprimer" @click="remove(item)">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    </ul>

    <BaseModal v-model="modalOpen" title="Ajouter de la sous-traitance" size="lg">
      <form id="subcontract-form" novalidate @submit.prevent="save">
        <FormFields v-model="form" :fields="SUBCONTRACT_FIELDS" :errors="errors" />
      </form>
      <template #footer="{ close }">
        <button type="button" class="btn btn-light" @click="close">Annuler</button>
        <button type="submit" form="subcontract-form" class="btn btn-primary" :disabled="saving">Ajouter</button>
      </template>
    </BaseModal>
  </div>
</template>
