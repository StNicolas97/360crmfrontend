import { defineStore } from "pinia";
import { computed } from "vue";
import { clientsApi } from "@/api";
import { clientLabel } from "@/utils/format";
import { useCollection } from "./collection";

export const useClientsStore = defineStore("clients", () => {
  const collection = useCollection(clientsApi.list);

  const companies = computed(() => collection.items.value.filter((c) => c.entreprise?.trim()));
  const labelOf = (id, preferCompany = true) => clientLabel(collection.byId.value.get(id), preferCompany);

  async function create(client) {
    const response = await clientsApi.create(client);
    if (response.client) collection.upsert(response.client);
    return response;
  }

  async function update(id, client) {
    const response = await clientsApi.update(id, client);
    collection.upsert(response.client ?? { ...client, id });
    return response;
  }

  async function remove(id) {
    await clientsApi.remove(id);
    collection.removeLocal(id);
  }

  return { ...collection, companies, labelOf, create, update, remove };
});
