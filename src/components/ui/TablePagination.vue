<script setup>
import { computed } from "vue";

const page = defineModel({ type: Number, required: true });
const props = defineProps({
  pageCount: { type: Number, required: true },
  range: { type: Object, required: true }, // { from, to, total }
  label: { type: String, default: "éléments" },
});

// Fenêtre de 5 pages autour de la page courante
const pages = computed(() => {
  const start = Math.max(1, Math.min(page.value - 2, props.pageCount - 4));
  const end = Math.min(props.pageCount, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

const go = (p) => {
  if (p >= 1 && p <= props.pageCount) page.value = p;
};
</script>

<template>
  <div class="table-footer">
    <small class="text-muted">
      {{ range.total ? `${range.from}–${range.to} sur ${range.total} ${label}` : `0 ${label}` }}
    </small>
    <nav v-if="pageCount > 1" aria-label="Pagination">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: page === 1 }">
          <button type="button" class="page-link" aria-label="Page précédente" @click="go(page - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        <li v-for="p in pages" :key="p" class="page-item" :class="{ active: p === page }">
          <button type="button" class="page-link" @click="go(p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: page === pageCount }">
          <button type="button" class="page-link" aria-label="Page suivante" @click="go(page + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>
