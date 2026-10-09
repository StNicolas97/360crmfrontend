<script setup>
import { ref, onMounted } from "vue";
import { filesApi, errorMessage } from "@/api";
import { useUiStore } from "@/stores/ui";
import { formatDate } from "@/utils/format";

// Pièces jointes d'une tâche (stockées par le backend dans /uploads, accès protégé par jeton)
const props = defineProps({ taskId: { type: Number, required: true } });
const ui = useUiStore();

const files = ref([]);
const loading = ref(true);
const uploading = ref(false);
const input = ref(null);
const MAX_SIZE = 25 * 1024 * 1024;

async function load() {
  loading.value = true;
  try {
    files.value = (await filesApi.byTask(props.taskId)).files ?? [];
  } catch (e) {
    ui.notifyError(errorMessage(e, "Impossible de charger les pièces jointes"));
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function onSelect(event) {
  const selected = [...event.target.files];
  event.target.value = "";
  if (!selected.length) return;
  uploading.value = true;
  try {
    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        ui.notifyError(`${file.name} dépasse 25 Mo`);
        continue;
      }
      await filesApi.upload(props.taskId, file);
    }
    ui.notify("Pièce(s) jointe(s) ajoutée(s)");
    await load();
  } catch (e) {
    ui.notifyError(errorMessage(e, "L'envoi du fichier a échoué"));
  } finally {
    uploading.value = false;
  }
}

async function openFile(file) {
  try {
    const blob = await filesApi.download(file.filename);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e) {
    ui.notifyError(errorMessage(e, "Le fichier n'a pas pu être ouvert"));
  }
}

async function remove(file) {
  const ok = await ui.confirm({ title: "Supprimer le fichier", message: `Supprimer « ${file.originalname} » ?`, confirmLabel: "Supprimer" });
  if (!ok) return;
  try {
    await filesApi.remove(file.id);
    files.value = files.value.filter((f) => f.id !== file.id);
  } catch (e) {
    ui.notifyError(errorMessage(e, "Suppression impossible"));
  }
}

const sizeLabel = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} Mo` : `${Math.ceil(bytes / 1024)} Ko`);
const iconFor = (mime = "") =>
  mime.startsWith("image/") ? "bi-file-earmark-image" : mime === "application/pdf" ? "bi-file-earmark-pdf" : "bi-file-earmark";
</script>

<template>
  <div class="card-panel">
    <div class="panel-header">
      <h2 class="panel-title">Pièces jointes</h2>
      <button type="button" class="btn btn-sm btn-outline-primary" :disabled="uploading" @click="input.click()">
        <span v-if="uploading" class="spinner-border spinner-border-sm me-1"></span>
        <i v-else class="bi bi-paperclip me-1"></i>Joindre
      </button>
      <input
        ref="input"
        type="file"
        class="d-none"
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
        @change="onSelect"
      />
    </div>
    <div v-if="loading" class="text-center py-3"><span class="spinner-border spinner-border-sm"></span></div>
    <p v-else-if="!files.length" class="text-muted text-center py-2 mb-0">Aucune pièce jointe</p>
    <ul v-else class="list-unstyled mb-0 contact-list">
      <li v-for="file in files" :key="file.id" class="contact-item">
        <button type="button" class="btn btn-link p-0 text-start min-w-0 text-decoration-none" @click="openFile(file)">
          <i class="bi me-2" :class="iconFor(file.mimetype)"></i>
          <span class="text-truncate">{{ file.originalname }}</span>
          <small class="text-muted d-block">{{ sizeLabel(file.size) }} · {{ formatDate(file.createdAt) }}</small>
        </button>
        <button type="button" class="btn btn-sm btn-light btn-icon text-danger" aria-label="Supprimer" @click="remove(file)">
          <i class="bi bi-trash"></i>
        </button>
      </li>
    </ul>
  </div>
</template>
