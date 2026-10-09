<script setup>
import { computed, onMounted } from "vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import TaskTable from "@/components/tasks/TaskTable.vue";
import { useTasksStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { isLate, isUrgent } from "@/utils/task";

// scope : "all" (toutes), "mine" (assignées à moi), "leads" (prospects)
const props = defineProps({ scope: { type: String, default: "all" } });

const tasks = useTasksStore();
const auth = useAuthStore();
const ui = useUiStore();
onMounted(() => tasks.fetch().catch(() => {}));

const config = {
  all: { title: "Toutes les tâches", subtitle: "Ensemble des travaux de l'atelier" },
  mine: { title: "Mes tâches", subtitle: "Travaux qui vous sont assignés" },
  leads: { title: "Leads", subtitle: "Demandes à convertir en travaux" },
};

const list = computed(() => {
  if (props.scope === "leads") return tasks.leads;
  // Pour un employé, le store ne contient déjà que ses tâches
  if (props.scope === "mine") return auth.isAdmin ? tasks.mine : tasks.items;
  return tasks.items;
});

const summary = computed(() => {
  const active = list.value.filter((t) => t.statut !== "Termine");
  return `${active.length} active(s) · ${active.filter(isUrgent).length} urgente(s) · ${active.filter(isLate).length} en retard`;
});
</script>

<template>
  <div>
    <PageHeader :title="config[scope].title" :subtitle="tasks.loaded ? summary : config[scope].subtitle">
      <template #actions>
        <button type="button" class="btn btn-light btn-icon" aria-label="Actualiser" title="Actualiser" :disabled="tasks.loading" @click="tasks.fetch({ force: true })">
          <i class="bi bi-arrow-clockwise" :class="{ spin: tasks.loading }"></i>
        </button>
        <button type="button" class="btn btn-primary" @click="ui.openTaskForm()"><i class="bi bi-plus-lg me-1"></i>Nouvelle tâche</button>
      </template>
    </PageHeader>

    <ErrorState v-if="tasks.error" :message="tasks.error" @retry="tasks.fetch({ force: true })" />

    <TaskTable
      :tasks="list"
      :loading="tasks.loading"
      :show-assignee="auth.isAdmin && scope !== 'mine'"
      :empty-text="scope === 'leads' ? 'Aucun lead' : 'Aucune tâche'"
    />
  </div>
</template>
