<script setup>
import { ref, toRef, onMounted } from "vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import DataTable from "@/components/ui/DataTable.vue";
import TablePagination from "@/components/ui/TablePagination.vue";
import SearchInput from "@/components/ui/SearchInput.vue";
import StatCard from "@/components/ui/StatCard.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import PerteFormModal from "@/components/pertes/PerteFormModal.vue";
import { useTable } from "@/composables/useTable";
import { usePertesStore } from "@/stores/pertes";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";
import { formatDate, formatMoney, fullName } from "@/utils/format";

const pertes = usePertesStore();
const auth = useAuthStore();
const ui = useUiStore();
const createOpen = ref(false);

onMounted(() => pertes.fetch().catch(() => {}));

const table = useTable(toRef(pertes, "items"), {
  search: ["typeVinyle", "typeLaminier", "dimensions", "raison", (p) => fullName(p)],
  sort: { key: "createdAt", dir: "desc" },
  sortValue: { cout: (p) => Number(p.cout) || 0, par: (p) => fullName(p) },
  pageSize: 15,
});

const columns = [
  { key: "createdAt", label: "Date", sortable: true, class: "d-none d-sm-table-cell", format: (p) => formatDate(p.createdAt) },
  { key: "typeVinyle", label: "Vinyle", sortable: true },
  { key: "typeLaminier", label: "Laminage", sortable: true, class: "d-none d-md-table-cell" },
  { key: "dimensions", label: "Dimensions", class: "d-none d-lg-table-cell" },
  { key: "raison", label: "Raison", class: "d-none d-xl-table-cell" },
  { key: "par", label: "Déclarée par", sortable: true, class: "d-none d-md-table-cell", format: (p) => fullName(p) },
  { key: "cout", label: "Coût", sortable: true, align: "end", format: (p) => formatMoney(p.cout) },
  { key: "actions", label: "", align: "end" },
];

// Un employé ne supprime que ses propres déclarations
const canDelete = (perte) => auth.isAdmin || perte.idAssigne === auth.user?.id;

async function remove(perte) {
  const ok = await ui.confirm({ title: "Supprimer la perte", message: `Supprimer la perte de ${formatMoney(perte.cout)} ?`, confirmLabel: "Supprimer" });
  if (!ok) return;
  try {
    await pertes.remove(perte.id);
    ui.notify("Perte supprimée");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La suppression a échoué"));
  }
}
</script>

<template>
  <div>
    <PageHeader title="Pertes de matériel" subtitle="Suivi des retailles et matériaux perdus">
      <template #actions>
        <button type="button" class="btn btn-primary" @click="createOpen = true"><i class="bi bi-plus-lg me-1"></i>Déclarer une perte</button>
      </template>
    </PageHeader>

    <ErrorState v-if="pertes.error" :message="pertes.error" @retry="pertes.fetch({ force: true })" />

    <div class="stat-grid stat-grid-2 mb-4">
      <StatCard label="Coût total des pertes" :value="formatMoney(pertes.total)" icon="bi-cash-coin" variant="danger" />
      <StatCard label="Déclarations" :value="pertes.items.length" icon="bi-archive" variant="secondary" />
    </div>

    <div class="toolbar">
      <SearchInput v-model="table.query.value" placeholder="Rechercher…" class="toolbar-grow" />
    </div>

    <DataTable :columns="columns" :rows="table.rows.value" :sort="table.sort" :loading="pertes.loading" empty-text="Aucune perte déclarée" @sort="table.toggleSort">
      <template #cell-cout="{ row }"><span class="fw-semibold text-danger">{{ formatMoney(row.cout) }}</span></template>
      <template #cell-actions="{ row }">
        <button v-if="canDelete(row)" type="button" class="btn btn-sm btn-light btn-icon text-danger" aria-label="Supprimer" @click="remove(row)">
          <i class="bi bi-trash"></i>
        </button>
      </template>
      <template #footer>
        <TablePagination v-model="table.page.value" :page-count="table.pageCount.value" :range="table.range.value" label="pertes" />
      </template>
    </DataTable>

    <PerteFormModal v-model="createOpen" />
  </div>
</template>
