import { ref, reactive, computed, watch, unref } from "vue";
import { compareValues, normalizeText } from "@/utils/format";

/**
 * Recherche, filtres, tri et pagination pour n'importe quelle liste.
 *
 * @param source     ref/computed contenant le tableau à afficher
 * @param options.search   champs recherchés : clés ou fonctions (row) => texte
 * @param options.filters  filtres initiaux { champ: "" } ; un filtre vide est ignoré
 * @param options.sort     tri initial { key, dir }
 * @param options.sortValue fonctions de tri personnalisées { key: (row) => valeur }
 * @param options.pageSize nombre de lignes par page
 */
export function useTable(source, options = {}) {
  const { search = [], filters = {}, sort: initialSort = {}, sortValue = {}, pageSize = 10 } = options;

  const query = ref("");
  const filterValues = reactive({ ...filters });
  const sort = reactive({ key: initialSort.key ?? null, dir: initialSort.dir ?? "asc" });
  const page = ref(1);

  const read = (row, accessor) => (typeof accessor === "function" ? accessor(row) : row[accessor]);

  const filtered = computed(() => {
    let rows = unref(source) ?? [];
    const term = normalizeText(query.value.trim());
    if (term) {
      rows = rows.filter((row) => search.some((accessor) => normalizeText(read(row, accessor)).includes(term)));
    }
    for (const [key, value] of Object.entries(filterValues)) {
      if (value === "" || value === null || value === undefined) continue;
      rows = rows.filter((row) => String(row[key]) === String(value));
    }
    return rows;
  });

  const sorted = computed(() => {
    if (!sort.key) return filtered.value;
    const direction = sort.dir === "asc" ? 1 : -1;
    const accessor = sortValue[sort.key] ?? sort.key;
    return [...filtered.value].sort((a, b) => compareValues(read(a, accessor), read(b, accessor)) * direction);
  });

  const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize)));
  const rows = computed(() => sorted.value.slice((page.value - 1) * pageSize, page.value * pageSize));
  const range = computed(() => {
    const total = sorted.value.length;
    if (!total) return { from: 0, to: 0, total };
    return { from: (page.value - 1) * pageSize + 1, to: Math.min(page.value * pageSize, total), total };
  });

  // Toute nouvelle recherche ramène à la première page
  watch([query, () => ({ ...filterValues })], () => (page.value = 1));
  watch(pageCount, (count) => {
    if (page.value > count) page.value = count;
  });

  function toggleSort(key) {
    if (sort.key === key) sort.dir = sort.dir === "asc" ? "desc" : "asc";
    else Object.assign(sort, { key, dir: "asc" });
  }

  function reset() {
    query.value = "";
    for (const key of Object.keys(filterValues)) filterValues[key] = filters[key] ?? "";
  }

  const hasActiveFilters = computed(
    () => Boolean(query.value) || Object.values(filterValues).some((v) => v !== "" && v != null)
  );

  return {
    query,
    filters: filterValues,
    sort,
    toggleSort,
    page,
    pageCount,
    rows,
    range,
    filtered: sorted,
    total: computed(() => sorted.value.length),
    reset,
    hasActiveFilters,
  };
}
