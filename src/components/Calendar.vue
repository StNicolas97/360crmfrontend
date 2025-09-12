<template>
  <div class="calendar-container">
    <h1>Calendrier</h1>

    <!-- Section des filtres -->
    <div class="filters-section mb-4">
      <div class="row">
        <div class="col-md-6">
          <h5>Filtrer par type de tâche</h5>
          <div class="filter-group">
            <label
              class="form-check-label me-3"
              v-for="taskType in availableTaskTypes"
              :key="taskType"
            >
              <input
                type="checkbox"
                class="form-check-input me-1"
                :value="taskType"
                v-model="activeFilters.taskTypes"
                @change="applyFilters"
              />
              {{ getTaskTypeLabel(taskType) }}
            </label>
          </div>
        </div>

        <div class="col-md-6">
          <h5>Actions</h5>
          <div class="filter-actions">
            <button
              class="btn btn-sm btn-outline-primary me-2"
              @click="selectAllTaskTypes"
            >
              Tout sélectionner
            </button>
            <button
              class="btn btn-sm btn-outline-secondary me-2"
              @click="deselectAllTaskTypes"
            >
              Tout désélectionner
            </button>
            <!-- <button class="btn btn-sm btn-outline-info" @click="resetFilters">
              Réinitialiser
            </button> -->
            <button
              class="btn btn-sm btn-outline-secondary me-2"
              @click="refetchEvents"
            >
              <i class="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          <div class="mt-2">
            <small class="text-muted">
              {{ visibleEventsCount }} tâche(s) affichée(s) sur
              {{ totalEventsCount }}
            </small>
          </div>
        </div>
      </div>
    </div>

    <FullCalendar ref="calendar" :options="calendarOptions" />
    <tache-modal :date="this.date" @submitcal="refetchEvents" />
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import TacheModal from "../components/TacheModal.vue";
import { getService } from "../api/services/get.service";
import { deleteService } from "../api/services/delete.service";
import { updateService } from "@/api/services/update.service";
import { eventBus } from "@/utils/eventBus";

export default {
  name: "MonCalendrier",
  components: {
    FullCalendar,
    TacheModal,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: "dayGridMonth",
        editable: true,
        selectable: true,
        eventMinHeight: 1,
        locale: "fr",
        buttonText: {
          today: "Aujourd'hui",
        },
        weekends: true,
        events: this.fetchTask,
        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,
        dayMaxEvents: false,
        slotEventOverlap: true,
        eventColor: "",
        // Fonction de filtrage pour les événements
        eventClassNames: this.getEventClassNames,
        eventDrop: this.updateMyEvent,
        eventResize: this.resizeMyEvent,
      },
      calendarApi: null,
      taches: [],
      notes: [],
      date: null,
      allEvents: [],

      // Système de filtrage
      activeFilters: {
        taskTypes: [],
      },
      availableTaskTypes: [],

      // Statistiques
      visibleEventsCount: 0,
      totalEventsCount: 0,
    };
  },
  async mounted() {
    this.fetchTask();
    this.fetchNotes();
    this.getCalendarApi();
    eventBus.on("submitCal", () => {
      console.log("event in calendar");
      this.refetchEvents();
    });
  },
  methods: {
    handleDateClick(info) {
      this.date = info.dateStr;
      const modal = new bootstrap.Modal(document.getElementById("modaltask"));
      modal.show();
    },
    async fetchTask() {
      try {
        let allEvents = [];

        // --- Récupération des tâches ---
        const responseTasks = await getService.getDataCalendar();
        let taches = responseTasks.data;

        const tachesTransformees = taches.map((task) => {
          let idTask = null;
          if (task.idAff) idTask = task.idAff;
          else if (task.idLett) idTask = task.idLett;
          else if (task.idPpf) idTask = task.idPpf;
          return { idTask, ...task };
        });

        for (let i = 0; i < tachesTransformees.length; i++) {
          const task = tachesTransformees[i];
          let client = "";

          if (task.typeTask === "PPF")
            client = `${task.prenomclient} ${task.nomclient}`;
          else client = task.entreprise;
          console.log("type de task", task.typeTask);

          let endDate = new Date(task.datefin);
          endDate.setDate(endDate.getDate() + 1);

          allEvents.push({
            id: task.id,
            title: `${task.titre} pour ${client}`,
            start: task.datedebut,
            end: endDate.toISOString().split("T")[0],
            color: task.couleur,
            extendedProps: {
              typeTask: task.typeTask,
              idTache: task.idTask,
            },
          });
        }

        // --- Récupération des notes ---
        const responseNotes = await getService.getNote();
        let notes = responseNotes.data;

        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];

          let endDate = new Date(note.datefin);
          endDate.setDate(endDate.getDate() + 1);

          allEvents.push({
            id: `note-${note.id}`, // éviter conflit avec id de tâche
            title: note.commentaire,
            start: note.datedebut,
            end: endDate.toISOString().split("T")[0],
            color: "#000", // noir pour les notes
            extendedProps: {
              typeTask: "Note",
            },
          });
        }

        // --- Mise à jour du calendrier ---
        console.log("Événements fusionnés : ", allEvents);

        this.allEvents = allEvents;
        this.totalEventsCount = allEvents.length;
        this.calendarOptions.events = allEvents;

        this.extractAvailableTaskTypes();
        this.initializeFilters();

        return allEvents;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des événements dans le calendrier:",
          error
        );
      }
    },

    getCalendarApi() {
      this.$nextTick(() => {
        this.calendarApi = this.$refs.calendar.getApi();
      });
    },
    async refetchEvents() {
      if (!this.calendarApi) {
        this.getCalendarApi();
      }
      try {
        // Supprimer tous les événements existants
        this.calendarApi.removeAllEvents();

        // Récupérer les nouvelles données
        const events = await this.fetchTask();
        let grand = events[0]?.id || 0;
        let indexGrand = 0;

        for (let i = 1; i < events.length; i++) {
          if (events[i].id > grand) {
            grand = events[i].id;
            indexGrand = i;
          }
        }

        console.log("Plus grand ID:", grand);
        console.log("Index:", indexGrand);

        // Ajouter les nouveaux événements
        this.calendarApi.addEvent(events);
      } catch (error) {
        console.error("Erreur lors du rechargement des tâches:", error);
      }
    },

    async updateMyEvent(info) {
      const id = info.event.id;
      let endDate = new Date(info.event.end);
      endDate.setDate(endDate.getDate() - 1);
      endDate = endDate.toISOString().split("T")[0];
      const data = {
        datedebut: info.event.start.toISOString().split("T")[0],
        datefin: endDate,
      };
      const url = info.event.extendedProps.typeTask;

      try {
        const response = await updateService.updateTask(url, id, data);
        this.$emit("updateTask");
        if (!response) {
          throw new Error();
        }
        await this.fetchTask();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche :", error);
        alert("Une erreur est survenue lors de la mise à jour de la tâche.");
      }
    },
    async resizeMyEvent(info) {
      const id = info.event.id;
      let endDate = new Date(info.event.end);
      endDate.setDate(endDate.getDate() - 1);
      endDate = endDate.toISOString().split("T")[0];
      const data = {
        datefin: endDate,
      };
      const url = info.event.extendedProps.typeTask;

      alert(info.event.title + " end is now " + endDate);

      try {
        const response = await updateService.updateTask(url, id, data);
        this.$emit("updateTask");
        if (!response) {
          throw new Error();
        }
        await this.fetchTask();
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la tâche :", error);
        alert("Une erreur est survenue lors de la mise à jour de la tâche.");
      }
    },
    async fetchNotes() {
      try {
        const response = await getService.getNote();
        let notes = response.data;
        const events = [];

        for (let i = 0; i < notes.length; i++) {
          const task = notes[i];

          let endDate = new Date(task.datefin);
          endDate.setDate(endDate.getDate() + 1);

          events.push({
            id: task.id,
            title: task.commentaire,
            start: task.datedebut,
            end: endDate.toISOString().split("T")[0],
            color: "#000",
          });
        }
        console.log("la table filtré : ", events);

        this.allEvents.push(events);
        this.calendarOptions.events.push(events);
        return events;
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notes dans le calendrier:",
          error
        );
      }
    },

    createEventsFromNotes() {
      const events = this.notes.map((note) => ({
        id: note.id,
        title: note.commentaire,
        start: note.datedebut,
        end: note.datefin,
        allDay: !note.heuredebut,
        color: "#000000",
      }));
      this.calendarOptions.events = [...events];
      console.log("Notes récupérées:", events);
    },
    extractAvailableTaskTypes() {
      const taskTypes = new Set();
      this.allEvents.forEach((event) => {
        if (event.extendedProps.typeTask) {
          taskTypes.add(event.extendedProps.typeTask);
        }
      });
      this.availableTaskTypes = Array.from(taskTypes).sort();
    },

    initializeFilters() {
      this.activeFilters.taskTypes = [...this.availableTaskTypes];
      this.updateEventCount();
    },

    getEventClassNames(info) {
      const taskType = info.event.extendedProps.typeTask;

      if (this.activeFilters.taskTypes.includes(taskType)) {
        return [];
      } else {
        return ["hidden-event"];
      }
    },

    applyFilters() {
      this.$nextTick(() => {
        this.calendarOptions = { ...this.calendarOptions };
        this.updateEventCount();
      });
    },

    updateEventCount() {
      this.visibleEventsCount = this.allEvents.filter((event) =>
        this.activeFilters.taskTypes.includes(event.extendedProps.typeTask)
      ).length;
    },

    selectAllTaskTypes() {
      this.activeFilters.taskTypes = [...this.availableTaskTypes];
      this.applyFilters();
    },

    deselectAllTaskTypes() {
      this.activeFilters.taskTypes = [];
      this.applyFilters();
    },

    resetFilters() {
      this.activeFilters.taskTypes = [...this.availableTaskTypes];
      this.applyFilters();
    },

    getTaskTypeLabel(taskType) {
      const labels = {
        PPF: "PPF",
        lettrage: "Lettrage",
        affichage: "Affichage",
        soustraitance: "Sous-traitance",
      };
      return labels[taskType] || taskType;
    },

    showTaskByRole() {
      const user = JSON.parse(localStorage.getItem("user"));
      const role = user?.role;
      this.fetchTask();
      /*if (role === 'admin') {
        this.fetchTask();
      } else if (role === 'employee') {
        this.fecthTaskUser();
        this.calendarOptions.dateClick = null;
      } else {
        console.error("Role inconnu ou utilisateur non authentifié");
      }*/
    },

    async handleEventClick(info) {
      if (info.event.id.includes("note")) {
        const idReal = parseFloat(info.event.id.substring(5));
        const valider = confirm(`supprimer ${idReal} ?`);
        if (valider) {
          const response = await deleteService.deleteNote(idReal);
          this.refetchEvents();
        }
      } else {
        this.$emit(
          "view",
          info.event.extendedProps.typeTask,
          info.event.extendedProps.idTache
        );
      }
    },
  },
};
</script>

<style scoped>
/* Styles pour les filtres */
.filters-section {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  border: 1px solid #dee2e6;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Classe pour cacher les événements filtrés */
:deep(.hidden-event) {
  display: none !important;
}

/* Optionnel : Style pour les événements semi-transparents */
:deep(.filtered-event) {
  opacity: 0.3;
  pointer-events: none;
}

/* Responsive */
@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
  }

  .filter-actions {
    flex-direction: column;
  }

  .filter-actions button {
    width: 100%;
  }
}

/* Réduction de la taille des événements du calendrier */
:deep(.fc-event),
:deep(.fc-daygrid-event) {
  min-height: 18px !important;
  height: 18px !important;
  padding: 0 4px !important;
  font-size: 0.75rem !important;
  line-height: 1.1 !important;
  border-radius: 4px !important;
}
:deep(.fc-event-title) {
  font-size: 0.75rem !important;
  padding: 0 !important;
  line-height: 1.1 !important;
}
:deep(.fc-daygrid-event-dot) {
  margin: 0 2px 0 0 !important;
  width: 6px !important;
  height: 6px !important;
}
:deep(.fc-daygrid-event-harness) {
  min-height: 18px !important;
}
</style>

<style>
.fc {
  height: 100vh;
}

.fc-daygrid-body {
  border-color: black;
}

.fc-col-header-cell-cushion {
  color: black;
}

.fc-daygrid-day-number {
  color: black;
}
</style>
