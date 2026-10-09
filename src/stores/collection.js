import { ref, computed } from "vue";
import { errorMessage } from "@/api";

// Logique commune aux listes simples (clients, employés, pertes) :
// chargement unique avec cache, état de chargement/erreur et index par id.
export function useCollection(listFn) {
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const loaded = ref(false);
  let pending = null;

  async function fetch({ force = false } = {}) {
    if (loaded.value && !force) return items.value;
    if (pending) return pending;
    loading.value = true;
    error.value = null;
    pending = listFn()
      .then((result) => {
        items.value = Array.isArray(result) ? result : [];
        loaded.value = true;
        return items.value;
      })
      .catch((e) => {
        error.value = errorMessage(e, "Impossible de charger les données");
        throw e;
      })
      .finally(() => {
        loading.value = false;
        pending = null;
      });
    return pending;
  }

  const byId = computed(() => new Map(items.value.map((item) => [item.id, item])));

  function upsert(item) {
    const index = items.value.findIndex((i) => i.id === item.id);
    if (index === -1) items.value = [item, ...items.value];
    else items.value.splice(index, 1, { ...items.value[index], ...item });
  }

  function removeLocal(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }

  return { items, loading, error, loaded, fetch, byId, upsert, removeLocal };
}
