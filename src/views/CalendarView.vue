<script setup>
import { ref, reactive, computed, watch, onMounted, markRaw } from "vue";
import { useRouter } from "vue-router";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import PageHeader from "@/components/ui/PageHeader.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import { errorMessage } from "@/api";
import { useTasksStore } from "@/stores/tasks";
import { useNotesStore } from "@/stores/notes";
import { useUsersStore } from "@/stores/users";
import { useClientsStore } from "@/stores/clients";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { TASK_TYPES } from "@/constants/task";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { NOTE_FIELDS } from "@/constants/taskForms";
import { validateForm } from "@/utils/forms";
import { focusFirstInvalid } from "@/utils/focus";
import { taskRoute, taskTitle, isClosed } from "@/utils/task";
import { toISODate, formatDate } from "@/utils/format";
import { canEditTask, canDeleteOwned } from "@/utils/permissions";

// Le calendrier lit le planning de l'atelier dans le store des tâches (une seule source de vérité) :
// toute création ou modification faite ailleurs s'y reflète sans rechargement complet.
const tasksStore = useTasksStore();
const notesStore = useNotesStore();
const users = useUsersStore();
const clients = useClientsStore();
const auth = useAuthStore();
const ui = useUiStore();
const router = useRouter();

// Les travaux d'affichage n'apparaissent pas au calendrier (pas d'installation planifiée)
const CALENDAR_TYPES = ["ppf", "lettrage"];

const typeFilter = ref([...CALENDAR_TYPES, "note"]);
const assigneeFilter = ref("");

const loading = computed(() => tasksStore.planningLoading || notesStore.loading);
const error = computed(() => tasksStore.planningError || notesStore.error);

// Échecs visibles : ErrorState affiche planningError / notes.error
function load(force = false) {
  tasksStore.fetchPlanning({ force }).catch(() => {});
  notesStore.fetch({ force }).catch(() => {});
}

onMounted(() => {
  load();
  // Couleurs et filtre par employé : un échec est signalé (sinon couleurs grises sans explication)
  users.fetch().catch(ui.onLoadError("Liste des employés indisponible"));
});

const tasks = computed(() => tasksStore.planning.filter((t) => CALENDAR_TYPES.includes(t.type) && t.datedebut));

// FullCalendar : la date de fin d'un événement "journée entière" est exclusive
const addDay = (iso, days) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

// Nom renvoyé par /tache/all ; sinon, libellé du store clients s'il est déjà chargé
function clientName(t) {
  const fromRow = t.type === "ppf" ? [t.prenomclient, t.nomclient].filter(Boolean).join(" ") : t.entreprise;
  if (fromRow) return fromRow;
  const label = clients.labelOf(t.idClient, t.type !== "ppf");
  return label !== "—" ? label : "";
}

// Couleur de l'employé assigné (store des employés en priorité)
const colorOf = (t) => users.byId.get(t.idAssigne)?.couleur || t.couleur || users.colorOf(t.idAssigne);

const events = computed(() => {
  const taskEvents = tasks.value
    .filter((t) => typeFilter.value.includes(t.type))
    .filter((t) => !assigneeFilter.value || String(t.idAssigne) === assigneeFilter.value)
    .map((t) => ({
      id: `task-${t.id}`,
      title: [taskTitle(t), clientName(t)].filter(Boolean).join(" · "),
      start: t.datedebut,
      end: t.datefin && t.datefin >= t.datedebut ? addDay(t.datefin, 1) : undefined,
      allDay: true,
      // Glisser-déposer réservé à l'admin et à l'employé assigné (le serveur renvoie 403 sinon)
      editable: canEditTask(auth, t),
      backgroundColor: colorOf(t),
      borderColor: colorOf(t),
      classNames: t.priorite === "Urgent" ? ["event-urgent"] : [],
      extendedProps: { kind: "task", task: t },
    }));

  const noteEvents = typeFilter.value.includes("note")
    ? notesStore.items.map((n) => ({
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

// Toucher une note ouvre un aperçu (texte + dates). Modifier / Supprimer : admin ou auteur seulement.
// Auparavant, un simple tap de lecture proposait directement la suppression.
const noteOpen = ref(false);
const selectedNote = ref(null);
const noteEditing = ref(false);
const noteForm = ref({});
const noteErrors = ref({});
const noteSaving = ref(false);
const noteFormEl = ref(null);
const canManageNote = computed(() => Boolean(selectedNote.value) && canDeleteOwned(auth, selectedNote.value));
const noteDirty = computed(
  () => noteEditing.value && NOTE_FIELDS.some((f) => String(noteForm.value[f.key] ?? "") !== String(selectedNote.value?.[f.key] ?? ""))
);

function openNote(note) {
  selectedNote.value = { ...note, datedebut: toISODate(note.datedebut), datefin: toISODate(note.datefin) };
  noteEditing.value = false;
  noteErrors.value = {};
  noteOpen.value = true;
}

function editNote() {
  noteForm.value = { ...selectedNote.value };
  noteErrors.value = {};
  noteEditing.value = true;
}

async function saveNote() {
  noteErrors.value = validateForm(noteForm.value, NOTE_FIELDS);
  if (Object.keys(noteErrors.value).length) {
    focusFirstInvalid(noteFormEl.value);
    return;
  }
  noteSaving.value = true;
  try {
    const values = { ...noteForm.value, datefin: noteForm.value.datefin || noteForm.value.datedebut };
    await notesStore.update(selectedNote.value.id, values);
    selectedNote.value = values;
    noteEditing.value = false;
    ui.notify("Note modifiée");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La note n'a pas pu être modifiée"));
  } finally {
    noteSaving.value = false;
  }
}

async function removeNote() {
  const note = selectedNote.value;
  const ok = await ui.confirm({ title: "Supprimer la note", message: `Supprimer la note « ${note.commentaire} » ?`, confirmLabel: "Supprimer" });
  if (!ok) return;
  try {
    await notesStore.remove(note.id);
    noteOpen.value = false;
    ui.notify("Note supprimée");
  } catch (e) {
    ui.notifyError(errorMessage(e, "La note n'a pas pu être supprimée"));
  }
}

function onEventClick({ event }) {
  const { kind, task, note } = event.extendedProps;
  if (kind === "task") return router.push(taskRoute(task));
  openNote(note);
}

// Tâches (PPF, lettrage) en cours sans date d'installation : absentes de la grille, listées sous le calendrier
const undated = computed(() =>
  tasksStore.planning
    .filter((t) => CALENDAR_TYPES.includes(t.type) && !t.datedebut && !isClosed(t))
    .filter((t) => !assigneeFilter.value || String(t.idAssigne) === assigneeFilter.value)
);

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
      await notesStore.update(note.id, { ...note, datedebut: start, datefin: end });
    }
  } catch (e) {
    revert();
    const message =
      e.response?.status === 403
        ? "Seul l'employé assigné ou un administrateur peut déplacer cette tâche."
        : errorMessage(e, "La modification des dates a échoué");
    ui.notifyError(message);
  }
}

// Options statiques : seuls les événements changent (évite de reconstruire FullCalendar à chaque mise à jour)
const calendarOptions = reactive({
  plugins: markRaw([dayGridPlugin, interactionPlugin]),
  initialView: "dayGridMonth",
  locale: markRaw(frLocale),
  height: "auto",
  headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,dayGridWeek" },
  editable: true,
  selectable: true,
  dayMaxEvents: 4,
  displayEventTime: false,
  events: [],
  dateClick: (info) => ui.openTaskForm({ datedebut: info.dateStr }),
  eventClick: onEventClick,
  eventDrop: onEventChange,
  eventResize: onEventChange,
});
watch(events, (list) => (calendarOptions.events = list), { immediate: true });

const filterOptions = [...CALENDAR_TYPES.map((key) => ({ value: key, label: TASK_TYPES[key].label })), { value: "note", label: "Notes" }];
</script>

<template>
  <div>
    <PageHeader title="Calendrier" subtitle="Touchez un jour pour planifier une tâche ou ajouter une note">
      <template #actions>
        <button type="button" class="btn btn-light btn-icon" aria-label="Actualiser" title="Actualiser" :disabled="loading" @click="load(true)">
          <i class="bi bi-arrow-clockwise" :class="{ spin: loading }"></i>
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="ui.openTaskForm({ type: 'note' })"><i class="bi bi-sticky me-1"></i>Note</button>
      </template>
    </PageHeader>

    <ErrorState v-if="error" :message="error" @retry="load(true)" />

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
      <p class="small text-muted mb-0 mt-2">Les travaux d'affichage (sans installation planifiée) ne figurent pas au calendrier.</p>
    </div>

    <!-- Tâches invisibles dans la grille faute de date d'installation -->
    <details v-if="undated.length" class="card-panel mt-3">
      <summary class="fw-semibold">
        <i class="bi bi-calendar-x me-1" aria-hidden="true"></i>Tâches sans date d'installation ({{ undated.length }})
      </summary>
      <ul class="task-list mt-2">
        <li v-for="t in undated" :key="t.id">
          <RouterLink :to="taskRoute(t)" class="task-list-item">
            <span class="color-dot" :style="{ background: colorOf(t) }"></span>
            <span class="flex-grow-1 text-truncate">{{ taskTitle(t) }}<template v-if="clientName(t)"> · {{ clientName(t) }}</template></span>
            <span class="small text-muted">#{{ t.id }}</span>
          </RouterLink>
        </li>
      </ul>
    </details>

    <!-- Aperçu d'une note : lecture pour tous ; modification et suppression pour l'admin ou l'auteur -->
    <BaseModal v-model="noteOpen" :title="noteEditing ? 'Modifier la note' : 'Note du calendrier'" size="sm" :dirty="noteDirty">
      <template v-if="selectedNote">
        <form v-if="noteEditing" id="note-edit-form" ref="noteFormEl" novalidate @submit.prevent="saveNote">
          <FormFields v-model="noteForm" :fields="NOTE_FIELDS" :errors="noteErrors" />
        </form>
        <template v-else>
          <p class="text-pre-line">{{ selectedNote.commentaire }}</p>
          <p class="small text-muted mb-0">
            <i class="bi bi-calendar3 me-1" aria-hidden="true"></i>{{ formatDate(selectedNote.datedebut) }}
            <template v-if="selectedNote.datefin && selectedNote.datefin !== selectedNote.datedebut"> au {{ formatDate(selectedNote.datefin) }}</template>
          </p>
        </template>
      </template>
      <template #footer="{ close }">
        <template v-if="noteEditing">
          <button type="button" class="btn btn-light" @click="noteEditing = false">Annuler</button>
          <button type="submit" form="note-edit-form" class="btn btn-primary" :disabled="noteSaving">
            <span v-if="noteSaving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
          </button>
        </template>
        <template v-else>
          <button v-if="canManageNote" type="button" class="btn btn-light text-danger me-auto" @click="removeNote">
            <i class="bi bi-trash me-1" aria-hidden="true"></i>Supprimer
          </button>
          <button v-if="canManageNote" type="button" class="btn btn-outline-primary" @click="editNote">
            <i class="bi bi-pencil me-1" aria-hidden="true"></i>Modifier
          </button>
          <button type="button" class="btn btn-primary" @click="close">Fermer</button>
        </template>
      </template>
    </BaseModal>
  </div>
</template>
