import { defineStore } from "pinia";
import { getService } from "../api/services/get.service";

export const useTacheStore = defineStore("tache", {
  state: () => ({
    taches: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAllTaches() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getService.getPpf();
        const response3 = await getService.getLettrage();
        const response4 = await getService.getSoustraitance();
        let toutesTaches = [];
        if (response.data.length > 0) {
          toutesTaches = [...toutesTaches, ...response.data];
        }
        if (response3.data.length > 0) {
          toutesTaches = [...toutesTaches, ...response3.data];
        }
        if (response4.data.length > 0) {
          toutesTaches = [...toutesTaches, ...response4.data];
        }
        this.taches = toutesTaches;
      } catch (error) {
        this.error = error;
        console.error("Erreur lors de la récupération des tâches:", error);
      } finally {
        this.loading = false;
      }
    },
    async fetchTachesEmploye(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await getService.getEmployeAllTask(id);
        this.taches = response.data;
      } catch (error) {
        this.error = error;
        console.error(
          "Erreur lors de la récupération des tâches employé:",
          error
        );
      } finally {
        this.loading = false;
      }
    },
    async fetchTachesByRole(user) {
      this.loading = true;
      this.error = null;
      try {
        if (user?.role === "admin") {
          this.fetchAllTaches();
        } else if (user?.role === "employee") {
          this.fetchTachesEmploye(user.id);
        } else {
          this.taches = [];
        }
      } catch (error) {
        this.error = error;
        this.taches = [];
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {
    // Exemple de getter pour filtrer par type
    tachesByType: (state) => (type) =>
      state.taches.filter((t) => t.typeTask === type),
  },
});
