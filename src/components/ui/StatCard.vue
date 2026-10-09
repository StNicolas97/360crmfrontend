<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  icon: { type: String, default: "bi-bar-chart" },
  variant: { type: String, default: "primary" },
});
</script>

<template>
  <div class="stat-card">
    <div class="stat-icon" :class="`text-bg-${variant}`"><i class="bi" :class="icon"></i></div>
    <div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>
