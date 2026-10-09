import { defineStore } from "pinia";
import { computed } from "vue";
import { pertesApi } from "@/api";
import { useCollection } from "./collection";

export const usePertesStore = defineStore("pertes", () => {
  const collection = useCollection(pertesApi.list);

  const total = computed(() =>
    collection.items.value.reduce((sum, perte) => sum + (Number(perte.cout) || 0), 0)
  );

  async function create(perte) {
    await pertesApi.create(perte);
    // La liste renvoie aussi le nom de l'employé : on la recharge
    await collection.fetch({ force: true });
  }

  async function remove(id) {
    await pertesApi.remove(id);
    collection.removeLocal(id);
  }

  return { ...collection, total, create, remove };
});
