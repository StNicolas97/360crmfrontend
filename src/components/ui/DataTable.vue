<script setup>
// Tableau générique : en-têtes triables, états chargement / vide, cellules personnalisables.
//
// columns : [{ key, label, sortable, class, align, format(row) }]
//   class permet de masquer une colonne sur petit écran (ex. "d-none d-md-table-cell")
// Slot de cellule : <template #cell-statut="{ row }"> ... </template>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  rowKey: { type: String, default: "id" },
  sort: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: "Aucun résultat" },
  clickable: { type: Boolean, default: false },
});
const emit = defineEmits(["sort", "row-click"]);

function sortIcon(sort, key) {
  if (!sort || sort.key !== key) return "bi-arrow-down-up text-muted";
  return sort.dir === "asc" ? "bi-sort-down-alt" : "bi-sort-up";
}
</script>

<template>
  <div class="table-card">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0 data-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[col.class, col.align && `text-${col.align}`, { sortable: col.sortable }]"
              :aria-sort="sort?.key === col.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined"
              scope="col"
            >
              <button v-if="col.sortable" type="button" class="th-sort" @click="emit('sort', col.key)">
                {{ col.label }} <i class="bi" :class="sortIcon(sort, col.key)"></i>
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && !rows.length">
            <td :colspan="columns.length" class="text-center py-5">
              <span class="spinner-border spinner-border-sm me-2" role="status"></span> Chargement…
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length" class="text-center text-muted py-5">
              <i class="bi bi-inbox d-block fs-3 mb-1"></i>{{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="row in rows"
            v-else
            :key="row[rowKey]"
            :class="{ 'row-clickable': clickable }"
            :tabindex="clickable ? 0 : undefined"
            @click="clickable && emit('row-click', row)"
            @keydown.enter="clickable && emit('row-click', row)"
          >
            <td v-for="col in columns" :key="col.key" :class="[col.class, col.align && `text-${col.align}`]">
              <slot :name="`cell-${col.key}`" :row="row">
                {{ col.format ? col.format(row) : row[col.key] ?? "—" }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <slot name="footer" />
  </div>
</template>
