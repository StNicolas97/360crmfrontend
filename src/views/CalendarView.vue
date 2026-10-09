<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import PageHeader from "@/components/ui/PageHeader.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import { tasksApi, notesApi, errorMessage } from "@/api";
import { useTasksStore } from "@/stores/tasks";
import { useUsersStore } from "@/stores/users";
import { useUiStore } from "@/stores/ui";
import { TASK_TYPES } from "@/constants/task";
import { normalizeTask, uniqueTasks, taskRoute } from "@/utils/task";
import { toISODate } from "@/utils/format";

const tasksStore = useTasksStore();
const users = useUsersStore();
const ui = useUiStore();
const router = useRouter();

// Les travaux d'affichage n'apparaissent pas au calendrier (pas d'installation planifiée)
const CALENDAR_TYPES = ["ppf", "lettrage"];

const tasks = ref([]);
const notes = ref([]);
const loading = ref(false);
const error = ref(null);
const typeFilter = ref([...CALENDAR_TYPES, "note"]);
const assigneeFilter = ref("");

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [rawTasks, rawNotes] = await Promise.all([tasksApi.calendar(), notesApi.list()]);
    tasks.value = uniqueTasks(rawTasks.map(normalizeTask)).filter((t) => CALENDAR_TYPES.includes(t.type) && t.datedebut);
    notes.value = rawNotes;
  } catch (e) {
    error.value = errorMessage(e, "Impossible de charger le calendrier");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
  users.fetch().catch(() => {});
});
// Toute création / modification ailleurs dans l'application rafraîchit le calendrier
watch(() => tasksStore.version, load);

// FullCalendar : la date de fin d'un événement "journée entière" est exclusive
const addDay = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

const clientName = (t) => (t.type === "ppf" ? [t.prenomclient, t.nomclient].filter(Boolean).join(" ") : t.entreprise) || "";

const events = computed(() => {
  const taskEvents = tasks.value
    .filter((t) => typeFilter.value.includes(t.type))
    .filter((t) => !assigneeFilter.value || String(t.idAssigne) === assigneeFilter.value)
    .map((t) => ({
      id: `task-${t.id}`,
      title: [t.titre, clientName(t)].filter(Boolean).join(" · "),
      start: t.datedebut,
      end: t.datefin && t.datefin >= t.datedebut ? addDay(t.datefin, 1) : undefined,
      allDay: true,
      backgroundColor: t.couleur || users.colorOf(t.idAssigne),
      borderColor: t.couleur || users.colorOf(t.idAssigne),
      classNames: t.priorite === "Urgent" ? ["event-urgent"] : [],
      extendedProps: { kind: "task", task: t },
    }));

  const noteEvents = typeFilter.value.includes("note")
    ? notes.value.map((n) => ({
        id: `note-${n.id}`,
        title: n.commentaire,
        start: toISODate(n.datedebut),
        end: n.datefin ? addDay(toISODate(n.datefin), 1) : undefined,
        allDay: true,
        backgroundColor: "#1f2937",
        borderColor: "#1f2937",
        extendedProps: { kind: "note", note: n },
      }))
    : [];

  return [...taskEvents, ...noteEvents];
});

async function onEventClick({ event }) {
  const { kind, task, note } = event.extendedProps;
  if (kind === "task") return router.push(taskRoute(task));

  const ok = await ui.confirm({ title: "Note du calendrier", message: `« ${note.commentaire} » — supprimer cette note ?`, confirmLabel: "Supprimer" });
  if (!ok) return;
  try {
    await notesApi.remove(note.id);
    notes.value = notes.value.filter((n) => n.id !== note.id);
    ui.notify("Note supprimée");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La note n'a pas pu être supprimée"));
  }
}

// Déplacement ou redimensionnement d'un événement
async function onEventChange({ event, revert }) {
  const start = toISODate(event.start);
  const end = event.end ? addDay(toISODate(event.end), -1) : start;
  const { kind, task, note } = event.extendedProps;
  try {
    if (kind === "task") {
      await tasksStore.reschedule(task.id, { datedebut: start, datefin: end });
      ui.notify("Dates mises à jour");
    } else {
      await notesApi.update(note.id, { ...note, datedebut: start, datefin: end });
      await load();
    }
  } catch (e) {
    revert();
    ui.notifyError(errorMessage(e, "La modification des dates a échoué"));
  }
}

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: "dayGridMonth",
  locale: frLocale,
  height: "auto",
  headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" },
  editable: true,
  selectable: true,
  dayMaxEvents: 4,
  displayEventTime: false,
  events: events.value,
  dateClick: (info) => ui.openTaskForm({ datedebut: info.dateStr }),
  eventClick: onEventClick,
  eventDrop: onEventChange,
  eventResize: onEventChange,
}));

const filterOptions = [...CALENDAR_TYPES.map((key) => ({ value: key, label: TASK_TYPES[key].label })), { value: "note", label: "Notes" }];
</script>

<template>
  <div>
    <PageHeader title="Calendrier" subtitle="Cliquez sur un jour pour planifier une tâche ou ajouter une note">
      <template #actions>
        <button type="button" class="btn btn-light btn-icon" aria-label="Actualiser" title="Actualiser" :disabled="loading" @click="load">
          <i class="bi bi-arrow-clockwise" :class="{ spin: loading }"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="ui.openTaskForm({ type: 'note' })"><i class="bi bi-sticky me-1"></i>Note</button>
      </template>
    </PageHeader>

    <ErrorState v-if="error" :message="error" @retry="load" />

    <div class="toolbar">
      <div class="btn-group flex-wrap" role="group" aria-label="Types affichés">
        <template v-for="option in filterOptions" :key="option.value">
          <input :id="`cal-${option.value}`" v-model="typeFilter" type="checkbox" class="btn-check" :value="option.value" />
          <label class="btn btn-outline-secondary btn-sm" :for="`cal-${option.value}`">{{ option.label }}</label>
        </template>
      </div>
      <select v-model="assigneeFilter" class="form-select toolbar-select" aria-label="Filtrer par employé">
        <option value="">Tous les employés</option>
        <option v-for="u in users.items" :key="u.id" :value="String(u.id)">{{ users.nameOf(u.id) }}</option>
      </select>
      <div class="calendar-legend d-none d-md-flex">
        <span v-for="u in users.items" :key="u.id"><span class="color-dot" :style="{ background: users.colorOf(u.id) }"></span>{{ u.prenom }}</span>
      </div>
    </div>

    <div class="card-panel calendar-panel">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>
