<script setup>
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();
const icons = { success: "bi-check-circle-fill", danger: "bi-x-octagon-fill", warning: "bi-exclamation-triangle-fill", info: "bi-info-circle-fill" };
</script>

<template>
  <div class="toast-stack" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="toast in ui.toasts" :key="toast.id" class="app-toast" :class="`app-toast-${toast.variant}`" role="status">
        <i class="bi" :class="icons[toast.variant] || icons.info"></i>
        <span class="flex-grow-1">{{ toast.message }}</span>
        <button type="button" class="btn-close btn-close-sm" aria-label="Fermer" @click="ui.dismiss(toast.id)"></button>
      </div>
    </TransitionGroup>
  </div>
</template>
