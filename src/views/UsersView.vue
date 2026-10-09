<script setup>
import { ref, toRef, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import DataTable from "@/components/ui/DataTable.vue";
import TablePagination from "@/components/ui/TablePagination.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import UserFormModal from "@/components/users/UserFormModal.vue";
import { useTable } from "@/composables/useTable";
import { useUsersStore } from "@/stores/users";
import { useTasksStore } from "@/stores/tasks";
import { ROLE_OPTIONS } from "@/constants/forms";

const users = useUsersStore();
const tasks = useTasksStore();
const router = useRouter();
const createOpen = ref(false);

onMounted(() => {
  users.fetch().catch(() => {});
  tasks.fetch().catch(() => {});
});

const activeCount = (id) => tasks.active.filter((t) => t.idAssigne === id).length;
const roleLabel = (role) => ROLE_OPTIONS.find((r) => r.value === role)?.label || role || "—";

const table = useTable(toRef(users, "items"), {
  search: ["nom", "prenom", "email", "poste", "username"],
  filters: { role: "" },
  sort: { key: "nom", dir: "asc" },
  sortValue: { charge: (u) => activeCount(u.id) },
  pageSize: 15,
});

const columns = [
  { key: "nom", label: "Employé", sortable: true },
  { key: "poste", label: "Poste", sortable: true, class: "d-none d-md-table-cell" },
  { key: "email", label: "Courriel", sortable: true, class: "d-none d-lg-table-cell" },
  { key: "role", label: "Rôle", sortable: true, class: "d-none d-sm-table-cell" },
  { key: "charge", label: "Tâches actives", sortable: true, align: "end" },
];

const open = (user) => router.push({ name: "user-detail", params: { id: user.id } });
</script>

<template>
  <div>
    <PageHeader title="Employés" :subtitle="`${users.items.length} compte(s)`">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="createOpen = true"><i class="bi bi-person-plus me-1"></i>Nouvel employé</button>
      </template>
    </PageHeader>

    <ErrorState v-if="users.error" :message="users.error" @retry="users.fetch({ force: true })" />

    <div class="toolbar">
      <SearchInput v-model="table.query.value" placeholder="Rechercher un employé…" class="toolbar-grow" />
      <select v-model="table.filters.role" class="form-select toolbar-select" aria-label="Filtrer par rôle">
        <option value="">Tous les rôles</option>
        <option v-for="r in ROLE_OPTIONS" :key="r.value" :value="r.value">{{ r.label }}</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="table.rows.value"
      :sort="table.sort"
      :loading="users.loading"
      empty-text="Aucun employé"
      clickable
      @sort="table.toggleSort"
      @row-click="open"
    >
      <template #cell-nom="{ row }">
        <div class="d-flex align-items-center gap-2">
          <span class="avatar avatar-sm" :style="{ background: users.colorOf(row.id) }">{{ (row.prenom || row.username || "?").charAt(0) }}</span>
          <div class="min-w-0">
            <div class="fw-semibold text-truncate">{{ row.prenom }} {{ row.nom }}</div>
            <small class="text-muted">@{{ row.username }}</small>
          </div>
        </div>
      </template>
      <template #cell-role="{ row }">
        <span class="badge" :class="row.role === 'admin' ? 'text-bg-dark' : 'text-bg-light'">{{ roleLabel(row.role) }}</span>
      </template>
      <template #cell-charge="{ row }"><span class="fw-semibold">{{ activeCount(row.id) }}</span></template>
      <template #footer>
        <TablePagination v-model="table.page.value" :page-count="table.pageCount.value" :range="table.range.value" label="employés" />
      </template>
    </DataTable>

    <UserFormModal v-model="createOpen" />
  </div>
</template>
