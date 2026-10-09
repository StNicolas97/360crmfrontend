<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import { useTasksStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { useClientsStore } from "@/stores/clients";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";
import { STATUSES, TASK_TYPES, TASK_TYPE_LIST, CLOSED_STATUS } from "@/constants/task";
import { dueLabel, normalizeText } from "@/utils/format";
import { isLate, taskRoute } from "@/utils/task";

const tasks = useTasksStore();
const auth = useAuthStore();
const users = useUsersStore();
const clients = useClientsStore();
const ui = useUiStore();
const router = useRouter();

onMounted(() => {
  tasks.fetch().catch(() => {});
  clients.fetch().catch(() => {});
  if (auth.isAdmin) users.fetch().catch(() => {});
});

const columns = STATUSES.filter((s) => s.value !== CLOSED_STATUS);
const query = ref("");
const typeFilter = ref("");
const assigneeFilter = ref("");

const visible = computed(() => {
  const term = normalizeText(query.value.trim());
  return tasks.items.filter(
    (t) =>
      t.statut !== CLOSED_STATUS &&
      (!typeFilter.value || t.type === typeFilter.value) &&
      (!assigneeFilter.value || String(t.idAssigne) === assigneeFilter.value) &&
      (!term || normalizeText(`${t.titre} ${t.id} ${clients.labelOf(t.idClient)}`).includes(term))
  );
});

const byColumn = computed(() => {
  const groups = Object.fromEntries(columns.map((c) => [c.value, []]));
  for (const t of visible.value) (groups[t.statut] ??= []).push(t);
  // Urgentes en premier, puis échéance la plus proche
  for (const list of Object.values(groups)) {
    list.sort((a, b) => (b.priorite === "Urgent") - (a.priorite === "Urgent") || (a.datefin || "9").localeCompare(b.datefin || "9"));
  }
  return groups;
});

// Glisser-déposer
const dragged = ref(null);
const overColumn = ref(null);

function onDragStart(event, task) {
  dragged.value = task;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(task.id));
}
function onDragEnd() {
  dragged.value = null;
  overColumn.value = null;
}
async function onDrop(statut) {
  const task = dragged.value;
  onDragEnd();
  if (task) await move(task, statut);
}

async function move(task, statut) {
  if (task.statut === statut) return;
  try {
    const response = await tasks.moveTo(task, statut);
    ui.notify(`« ${task.titre} » déplacée vers ${statut}`);
    if (response?.mailSent === false) ui.notify("Le courriel au client n'a pas pu être envoyé", "warning");
  } catch (e) {
    ui.notifyError(errorMessage(e, "Le déplacement a échoué"));
  }
}

async function close(task) {
  const ok = await ui.confirm({
    title: "Terminer la tâche",
    message: `Marquer « ${task.titre} » comme terminée ? Le client sera averti par courriel.`,
    confirmLabel: "Terminer",
    variant: "success",
  });
  if (ok) await move(task, CLOSED_STATUS);
}

const open = (task) => router.push(taskRoute(task));
</script>

<template>
  <div class="kanban-page">
    <PageHeader title="Production" subtitle="Glissez une carte pour changer son étape">
      <template #actions>
        <button type="button" class="btn btn-light btn-icon" aria-label="Actualiser" title="Actualiser" :disabled="tasks.loading" @click="tasks.fetch({ force: true })">
          <i class="bi bi-arrow-clockwise" :class="{ spin: tasks.loading }"></i>
        </button>
        <button type="button" class="btn btn-primary" @click="ui.openTaskForm()"><i class="bi bi-plus-lg me-1"></i>Nouvelle tâche</button>
      </template>
    </PageHeader>

    <ErrorState v-if="tasks.error" :message="tasks.error" @retry="tasks.fetch({ force: true })" />

    <div class="toolbar">
      <SearchInput v-model="query" placeholder="Rechercher…" class="toolbar-grow" />
      <select v-model="typeFilter" class="form-select toolbar-select" aria-label="Filtrer par type">
        <option value="">Tous les types</option>
        <option v-for="t in TASK_TYPE_LIST" :key="t.key" :value="t.key">{{ t.label }}</option>
      </select>
      <select v-if="auth.isAdmin" v-model="assigneeFilter" class="form-select toolbar-select" aria-label="Filtrer par employé">
        <option value="">Tous les employés</option>
        <option v-for="u in users.items" :key="u.id" :value="String(u.id)">{{ users.nameOf(u.id) }}</option>
      </select>
    </div>

    <div class="kanban-board">
      <section
        v-for="col in columns"
        :key="col.value"
        class="kanban-column"
        :class="{ 'drag-over': overColumn === col.value }"
        :aria-label="col.label"
        @dragover.prevent="overColumn = col.value"
        @dragleave.self="overColumn = null"
        @drop.prevent="onDrop(col.value)"
      >
        <header class="kanban-column-header" :class="`border-${col.color}`">
          <span>{{ col.label }}</span>
          <span class="badge rounded-pill" :class="`text-bg-${col.color}`">{{ byColumn[col.value].length }}</span>
        </header>

        <div class="kanban-cards">
          <article
            v-for="task in byColumn[col.value]"
            :key="task.id"
            class="kanban-card"
            :class="{ urgent: task.priorite === 'Urgent', dragging: dragged?.id === task.id }"
            draggable="true"
            tabindex="0"
            @dragstart="onDragStart($event, task)"
            @dragend="onDragEnd"
            @click="open(task)"
            @keydown.enter="open(task)"
          >
            <div class="d-flex justify-content-between gap-2">
              <span class="kanban-card-type"><i class="bi" :class="TASK_TYPES[task.type]?.icon"></i> {{ TASK_TYPES[task.type]?.label }} · #{{ task.id }}</span>
              <span v-if="task.priorite === 'Urgent'" class="badge text-bg-danger">Urgent</span>
            </div>
            <h3 class="kanban-card-title">{{ task.titre }}</h3>
            <div class="kanban-card-meta">
              <span class="text-truncate"><i class="bi bi-person"></i> {{ clients.labelOf(task.idClient, task.type !== "ppf") }}</span>
              <span :class="{ 'text-danger fw-semibold': isLate(task) }"><i class="bi bi-clock"></i> {{ dueLabel(task.datefin) }}</span>
            </div>
            <div v-if="auth.isAdmin" class="kanban-card-assignee">
              <span class="color-dot" :style="{ background: users.colorOf(task.idAssigne) }"></span>
              {{ users.nameOf(task.idAssigne) }}
            </div>
            <!-- Changement d'étape sans glisser-déposer (mobile, clavier) -->
            <div class="kanban-card-actions" @click.stop>
              <select
                class="form-select form-select-sm"
                :value="task.statut"
                aria-label="Changer l'étape"
                @change="move(task, $event.target.value)"
              >
                <option v-for="s in columns" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
              <button type="button" class="btn btn-sm btn-outline-success" title="Terminer" aria-label="Terminer la tâche" @click="close(task)">
                <i class="bi bi-check2"></i>
              </button>
            </div>
          </article>
          <p v-if="!byColumn[col.value].length" class="kanban-empty">Aucune tâche</p>
        </div>
      </section>
    </div>
  </div>
</template>
