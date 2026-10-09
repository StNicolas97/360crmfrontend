<script setup>
import { computed, onMounted } from "vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import StatCard from "@/components/ui/StatCard.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import { useTasksStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { useUsersStore } from "@/stores/users";
import { useClientsStore } from "@/stores/clients";
import { useUiStore } from "@/stores/ui";
import { STATUSES, TASK_TYPES } from "@/constants/task";
import { dueLabel } from "@/utils/format";
import { isLate, isDueToday, isUrgent, taskRoute } from "@/utils/task";

const tasks = useTasksStore();
const auth = useAuthStore();
const users = useUsersStore();
const clients = useClientsStore();
const ui = useUiStore();

function load(force = false) {
  tasks.fetch({ force }).catch(() => {});
  clients.fetch().catch(() => {});
  if (auth.isAdmin) users.fetch().catch(() => {});
}
onMounted(() => load());

const active = computed(() => tasks.active);
const today = computed(() => active.value.filter(isDueToday));
const urgent = computed(() => active.value.filter(isUrgent));
const late = computed(() => active.value.filter(isLate));
const upcoming = computed(() =>
  active.value
    .filter((t) => t.datefin && !isLate(t))
    .sort((a, b) => a.datefin.localeCompare(b.datefin))
    .slice(0, 6)
);

// Répartition par étape (barres)
const byStatus = computed(() => {
  const counts = Object.fromEntries(STATUSES.map((s) => [s.value, 0]));
  for (const t of active.value) if (t.statut in counts) counts[t.statut]++;
  const max = Math.max(1, ...Object.values(counts));
  return STATUSES.filter((s) => s.value !== "Termine").map((s) => ({ ...s, count: counts[s.value], width: (counts[s.value] / max) * 100 }));
});

// Admin : charge par employé et clients les plus actifs
const workload = computed(() => {
  const map = new Map();
  for (const t of active.value) map.set(t.idAssigne, (map.get(t.idAssigne) || 0) + 1);
  return [...map.entries()]
    .map(([id, count]) => ({ id, count, name: users.nameOf(id), color: users.colorOf(id) }))
    .sort((a, b) => b.count - a.count);
});

const topClients = computed(() => {
  const map = new Map();
  for (const t of active.value) if (t.idClient) map.set(t.idClient, (map.get(t.idClient) || 0) + 1);
  return [...map.entries()]
    .map(([id, count]) => ({ id, count, name: clients.labelOf(id) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  return `${hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"}${auth.user?.prenom ? `, ${auth.user.prenom}` : ""}`;
});
</script>

<template>
  <div>
    <PageHeader :title="greeting" :subtitle="auth.isAdmin ? 'Vue d\'ensemble de l\'atelier' : 'Vos tâches en un coup d\'œil'">
      <template #actions>
        <button type="button" class="btn btn-light btn-icon" title="Actualiser" aria-label="Actualiser" :disabled="tasks.loading" @click="load(true)">
          <i class="bi bi-arrow-clockwise" :class="{ spin: tasks.loading }"></i>
        </button>
        <button type="button" class="btn btn-primary" @click="ui.openTaskForm()"><i class="bi bi-plus-lg me-1"></i>Nouvelle tâche</button>
      </template>
    </PageHeader>

    <ErrorState v-if="tasks.error" :message="tasks.error" @retry="load(true)" />

    <div class="stat-grid mb-4">
      <StatCard label="Tâches actives" :value="active.length" icon="bi-hourglass-split" variant="primary" />
      <StatCard label="Aujourd'hui" :value="today.length" icon="bi-calendar-check" variant="info" />
      <StatCard label="Urgentes" :value="urgent.length" icon="bi-lightning-charge-fill" variant="warning" />
      <StatCard label="En retard" :value="late.length" icon="bi-exclamation-triangle-fill" variant="danger" />
    </div>

    <div class="dashboard-grid">
      <section class="card-panel">
        <div class="panel-header">
          <h2 class="panel-title">Aujourd'hui</h2>
          <RouterLink :to="{ name: 'calendar' }" class="small">Calendrier</RouterLink>
        </div>
        <p v-if="!today.length" class="text-muted text-center py-3 mb-0">Rien de prévu aujourd'hui</p>
        <ul v-else class="task-list">
          <li v-for="t in today" :key="t.id">
            <RouterLink :to="taskRoute(t)" class="task-list-item">
              <i class="bi" :class="TASK_TYPES[t.type]?.icon"></i>
              <span class="flex-grow-1 text-truncate">{{ t.titre }}</span>
              <StatusBadge :value="t.statut" />
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="card-panel panel-urgent">
        <div class="panel-header">
          <h2 class="panel-title"><i class="bi bi-lightning-charge-fill text-warning me-1"></i>Urgentes</h2>
        </div>
        <p v-if="!urgent.length" class="text-muted text-center py-3 mb-0">Aucune tâche urgente</p>
        <ul v-else class="task-list">
          <li v-for="t in urgent" :key="t.id">
            <RouterLink :to="taskRoute(t)" class="task-list-item">
              <span class="flex-grow-1 text-truncate">{{ t.titre }}</span>
              <small :class="isLate(t) ? 'text-danger fw-semibold' : 'text-muted'">{{ dueLabel(t.datefin) }}</small>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="card-panel">
        <div class="panel-header">
          <h2 class="panel-title">En retard</h2>
        </div>
        <p v-if="!late.length" class="text-muted text-center py-3 mb-0">Aucun retard 👍</p>
        <ul v-else class="task-list">
          <li v-for="t in late" :key="t.id">
            <RouterLink :to="taskRoute(t)" class="task-list-item">
              <span class="flex-grow-1 text-truncate">{{ t.titre }}</span>
              <small class="text-danger fw-semibold">{{ dueLabel(t.datefin) }}</small>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section class="card-panel">
        <div class="panel-header">
          <h2 class="panel-title">Par étape</h2>
          <RouterLink :to="{ name: 'kanban' }" class="small">Production</RouterLink>
        </div>
        <ul class="list-unstyled mb-0 bar-list">
          <li v-for="s in byStatus" :key="s.value">
            <span class="bar-label">{{ s.label }}</span>
            <span class="bar-track"><span class="bar-fill" :class="`bg-${s.color}`" :style="{ width: `${s.width}%` }"></span></span>
            <span class="bar-count">{{ s.count }}</span>
          </li>
        </ul>
      </section>

      <section v-if="auth.isAdmin" class="card-panel">
        <div class="panel-header"><h2 class="panel-title">Charge par employé</h2></div>
        <p v-if="!workload.length" class="text-muted text-center py-3 mb-0">Aucune tâche active</p>
        <ul v-else class="task-list">
          <li v-for="w in workload" :key="w.id">
            <RouterLink :to="{ name: 'user-detail', params: { id: w.id } }" class="task-list-item">
              <span class="color-dot" :style="{ background: w.color }"></span>
              <span class="flex-grow-1 text-truncate">{{ w.name }}</span>
              <span class="badge text-bg-light">{{ w.count }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="auth.isAdmin" class="card-panel">
        <div class="panel-header">
          <h2 class="panel-title">Clients actifs</h2>
          <RouterLink :to="{ name: 'clients' }" class="small">Tous</RouterLink>
        </div>
        <p v-if="!topClients.length" class="text-muted text-center py-3 mb-0">Aucun client actif</p>
        <ul v-else class="task-list">
          <li v-for="c in topClients" :key="c.id">
            <RouterLink :to="{ name: 'client-detail', params: { id: c.id } }" class="task-list-item">
              <i class="bi bi-building text-muted"></i>
              <span class="flex-grow-1 text-truncate">{{ c.name }}</span>
              <span class="badge text-bg-light">{{ c.count }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <section v-else class="card-panel">
        <div class="panel-header">
          <h2 class="panel-title">Prochaines échéances</h2>
          <RouterLink :to="{ name: 'my-tasks' }" class="small">Mes tâches</RouterLink>
        </div>
        <p v-if="!upcoming.length" class="text-muted text-center py-3 mb-0">Aucune échéance à venir</p>
        <ul v-else class="task-list">
          <li v-for="t in upcoming" :key="t.id">
            <RouterLink :to="taskRoute(t)" class="task-list-item">
              <span class="flex-grow-1 text-truncate">{{ t.titre }}</span>
              <small class="text-muted">{{ dueLabel(t.datefin) }}</small>
            </RouterLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
