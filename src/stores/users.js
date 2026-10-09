import { defineStore } from "pinia";
import { usersApi } from "@/api";
import { fullName } from "@/utils/format";
import { useCollection } from "./collection";

export const useUsersStore = defineStore("users", () => {
  const collection = useCollection(usersApi.list);

  const nameOf = (id) => fullName(collection.byId.value.get(id), "Non assigné");
  const colorOf = (id) => collection.byId.value.get(id)?.couleur || "#6c757d";

  async function create(user) {
    const response = await usersApi.create(user);
    if (response.user) collection.upsert(response.user);
    return response;
  }

  async function update(id, user) {
    const response = await usersApi.update(id, user);
    const { newPassword, currentPassword, ...publicFields } = user;
    collection.upsert({ ...publicFields, id });
    return response;
  }

  async function remove(id) {
    await usersApi.remove(id);
    collection.removeLocal(id);
  }

  return { ...collection, nameOf, colorOf, create, update, remove };
});
