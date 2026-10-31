import { defineStore } from "pinia";
import { computed } from "vue";
import { clientsApi } from "@/api";
import { clientLabel } from "@/utils/format";
import { normalizeTask, uniqueTasks } from "@/utils/task";
import { useCollection } from "./collection";

export const useClientsStore = defineStore("clients", () => {
  const collection = useCollection(clientsApi.list);

  const companies = computed(() => collection.items.value.filter((c) => c.entreprise?.trim()));
  const labelOf = (id, preferCompany = true) => clientLabel(collection.byId.value.get(id), preferCompany);

  // Fiche d'un client (toujours relue sur le serveur) ; met aussi à jour la liste en cache
  async function fetchOne(id) {
    const client = await clientsApi.get(id);
    if (client?.id != null && collection.loaded.value) collection.upsert(client);
    return client;
  }

  // Tâches d'un client, normalisées comme celles du store des tâches
  async function tasksOf(id) {
    const raw = await clientsApi.tasks(id);
    return uniqueTasks((Array.isArray(raw) ? raw : []).map(normalizeTask));
  }

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

  return { ...collection, companies, labelOf, fetchOne, tasksOf, create, update, remove };
});
