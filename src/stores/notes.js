import { defineStore } from "pinia";
import { notesApi } from "@/api";
import { useCollection } from "./collection";

// Notes du calendrier (congés, rendez-vous…) : partagées entre le calendrier et la modale de création
export const useNotesStore = defineStore("notes", () => {
  const collection = useCollection(notesApi.list);

  async function create(note) {
    const response = await notesApi.create(note);
    // La réponse ne renvoie pas toujours la note complète : on recharge la liste
    await collection.fetch({ force: true });
    return response;
  }

  async function update(id, note) {
    const response = await notesApi.update(id, note);
    collection.upsert({ ...note, id });
    return response;
  }

  async function remove(id) {
    await notesApi.remove(id);
    collection.removeLocal(id);
  }

  return { ...collection, create, update, remove };
});
