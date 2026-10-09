<script setup>
import { computed, toRef } from "vue";
import { useRouter } from "vue-router";
import DataTable from "@/components/ui/DataTable.vue";
import TablePagination from "@/components/ui/TablePagination.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import { useTable } from "@/composables/useTable";
import { STATUSES, PRIORITIES, TASK_TYPES, TASK_TYPE_LIST } from "@/constants/task";
import { useClientsStore } from "@/stores/clients";
import { useUsersStore } from "@/stores/users";
import { formatDate } from "@/utils/format";
import { isLate, taskRoute } from "@/utils/task";

// Liste de tâches avec recherche, filtres, tri et pagination.
const props = defineProps({
  tasks: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  showAssignee: { type: Boolean, default: true },
  showFilters: { type: Boolean, default: true },
  pageSize: { type: Number, default: 10 },
  emptyText: { type: String, default: "Aucune tâche" },
});

const router = useRouter();
const clients = useClientsStore();
const users = useUsersStore();
clients.fetch().catch(() => {});
if (props.showAssignee) users.fetch().catch(() => {});

// PPF : client particulier (nom) ; lettrage / affichage : entreprise
function clientName(task) {
  const label = clients.labelOf(task.idClient, task.type !== "ppf");
  return label !== "—" ? label : task.entreprise || "—";
}

const table = useTable(toRef(props, "tasks"), {
  search: ["titre", "id", "statut", clientName, (t) => users.nameOf(t.idAssigne)],
  filters: { type: "", statut: "", priorite: "" },
  sort: { key: "datefin", dir: "asc" },
  sortValue: { client: clientName, assignee: (t) => users.nameOf(t.idAssigne) },
  pageSize: props.pageSize,
});

const columns = computed(() =>
  [
    { key: "id", label: "#", sortable: true, class: "col-id" },
    { key: "titre", label: "Tâche", sortable: true },
    { key: "client", label: "Client", sortable: true, class: "d-none d-md-table-cell" },
    props.showAssignee && { key: "assignee", label: "Assigné", sortable: true, class: "d-none d-lg-table-cell" },
    { key: "datefin", label: "Échéance", sortable: true, class: "d-none d-sm-table-cell" },
    { key: "priorite", label: "Priorité", sortable: true, class: "d-none d-md-table-cell" },
    { key: "statut", label: "Statut", sortable: true },
  ].filter(Boolean)
);

const open = (task) => task.subId && router.push(taskRoute(task));
</script>

<template>
  <div>
    <div v-if="showFilters" class="toolbar">
      <SearchInput v-model="table.query.value" placeholder="Rechercher une tâche, un client…" class="toolbar-grow" />
      <select v-model="table.filters.type" class="form-select toolbar-select" aria-label="Filtrer par type">
        <option value="">Tous les types</option>
        <option v-for="t in TASK_TYPE_LIST" :key="t.key" :value="t.key">{{ t.label }}</option>
      </select>
      <select v-model="table.filters.statut" class="form-select toolbar-select" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option v-for="s in STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select v-model="table.filters.priorite" class="form-select toolbar-select" aria-label="Filtrer par priorité">
        <option value="">Toutes les priorités</option>
        <option v-for="p in PRIORITIES" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>
      <button v-if="table.hasActiveFilters.value" type="button" class="btn btn-link btn-sm" @click="table.reset()">
        Réinitialiser
      </button>
    </div>

    <DataTable
      :columns="columns"
      :rows="table.rows.value"
      :sort="table.sort"
      :loading="loading"
      :empty-text="table.hasActiveFilters.value ? 'Aucune tâche ne correspond aux filtres' : emptyText"
      clickable
      @sort="table.toggleSort"
      @row-click="open"
    >
      <template #cell-id="{ row }"><span class="text-muted">#{{ row.id }}</span></template>
      <template #cell-titre="{ row }">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <i class="bi text-muted" :class="TASK_TYPES[row.type]?.icon" :title="TASK_TYPES[row.type]?.label"></i>
          <div class="min-w-0">
            <div class="fw-semibold text-truncate">{{ row.titre }}</div>
            <small class="text-muted d-md-none">{{ clientName(row) }}</small>
          </div>
        </div>
      </template>
      <template #cell-client="{ row }">{{ clientName(row) }}</template>
      <template #cell-assignee="{ row }">
        <span class="d-inline-flex align-items-center gap-2">
          <span class="color-dot" :style="{ background: users.colorOf(row.idAssigne) }"></span>
          {{ users.nameOf(row.idAssigne) }}
        </span>
      </template>
      <template #cell-datefin="{ row }">
        <span :class="{ 'text-danger fw-semibold': isLate(row) }">
          {{ formatDate(row.datefin) }}
          <i v-if="isLate(row)" class="bi bi-exclamation-triangle-fill ms-1" title="En retard"></i>
        </span>
      </template>
      <template #cell-priorite="{ row }"><StatusBadge :value="row.priorite" kind="priority" /></template>
      <template #cell-statut="{ row }"><StatusBadge :value="row.statut" /></template>

      <template #footer>
        <TablePagination v-model="table.page.value" :page-count="table.pageCount.value" :range="table.range.value" label="tâches" />
      </template>
    </DataTable>
  </div>
</template>
