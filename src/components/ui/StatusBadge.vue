<script setup>
import { computed } from "vue";
import { STATUS_BY_VALUE, PRIORITY_BY_VALUE, CLIENT_STATUS_BY_VALUE } from "@/constants/task";

// Badge unique pour les statuts de tâche, priorités et statuts client
const props = defineProps({
  value: { type: [String, Number], default: "" },
  kind: { type: String, default: "status" }, // status | priority | client
});

const maps = { status: STATUS_BY_VALUE, priority: PRIORITY_BY_VALUE, client: CLIENT_STATUS_BY_VALUE };
const meta = computed(() => maps[props.kind][props.value]);
</script>

<template>
  <span v-if="value" class="badge app-badge" :class="`text-bg-${meta?.color || 'secondary'}`">
    <i v-if="kind === 'priority' && meta?.icon" class="bi me-1" :class="meta.icon"></i>{{ meta?.label || value }}
  </span>
  <span v-else class="text-muted">—</span>
</template>
