<script setup>
import { ref, toRef, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import DataTable from "@/components/ui/DataTable.vue";
import TablePagination from "@/components/ui/TablePagination.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import ClientFormModal from "@/components/clients/ClientFormModal.vue";
import { useTable } from "@/composables/useTable";
import { useClientsStore } from "@/stores/clients";
import { CLIENT_STATUSES } from "@/constants/task";

const clients = useClientsStore();
const router = useRouter();
const createOpen = ref(false);

onMounted(() => clients.fetch().catch(() => {}));

const table = useTable(
  toRef(clients, "items"),
  {
    search: ["entreprise", "prenom", "nom", "email", "telephone"],
    filters: { statut: "" },
    sort: { key: "entreprise", dir: "asc" },
    pageSize: 15,
  }
);

const columns = [
  { key: "entreprise", label: "Entreprise", sortable: true },
  { key: "nom", label: "Contact principal", sortable: true, class: "d-none d-sm-table-cell" },
  { key: "email", label: "Courriel", sortable: true, class: "d-none d-lg-table-cell" },
  { key: "telephone", label: "Téléphone", sortable: true, class: "d-none d-md-table-cell" },
  { key: "statut", label: "Statut", sortable: true },
];

const open = (client) => router.push({ name: "client-detail", params: { id: client.id } });
</script>

<template>
  <div>
    <PageHeader title="Clients" :subtitle="`${clients.items.length} client(s)`">
      <template #actions>
        <button type="button" class="btn btn-light btn-icon" aria-label="Actualiser" title="Actualiser" :disabled="clients.loading" @click="clients.fetch({ force: true })">
          <i class="bi bi-arrow-clockwise" :class="{ spin: clients.loading }"></i>
        </button>
        <button type="button" class="btn btn-primary" @click="createOpen = true"><i class="bi bi-person-plus me-1"></i>Nouveau client</button>
      </template>
    </PageHeader>

    <ErrorState v-if="clients.error" :message="clients.error" @retry="clients.fetch({ force: true })" />

    <div class="toolbar">
      <SearchInput v-model="table.query.value" placeholder="Rechercher un client…" class="toolbar-grow" />
      <select v-model="table.filters.statut" class="form-select toolbar-select" aria-label="Filtrer par statut">
        <option value="">Tous les statuts</option>
        <option v-for="s in CLIENT_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="table.rows.value"
      :sort="table.sort"
      :loading="clients.loading"
      empty-text="Aucun client"
      clickable
      @sort="table.toggleSort"
      @row-click="open"
    >
      <template #cell-entreprise="{ row }">
        <div class="fw-semibold">{{ row.entreprise || `${row.prenom} ${row.nom}` }}</div>
        <small class="text-muted d-sm-none">{{ row.telephone }}</small>
      </template>
      <template #cell-nom="{ row }">{{ row.prenom }} {{ row.nom }}</template>
      <template #cell-statut="{ row }"><StatusBadge :value="row.statut" kind="client" /></template>
      <template #footer>
        <TablePagination v-model="table.page.value" :page-count="table.pageCount.value" :range="table.range.value" label="clients" />
      </template>
    </DataTable>

    <ClientFormModal v-model="createOpen" @saved="(c) => c && open(c)" />
  </div>
</template>
