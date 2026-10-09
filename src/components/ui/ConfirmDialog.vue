<script setup>
import { computed } from "vue";
import { useUiStore } from "@/stores/ui";
import BaseModal from "./BaseModal.vue";

// Instance unique, pilotée par ui.confirm() (remplace window.confirm)
const ui = useUiStore();
const open = computed({
  get: () => Boolean(ui.confirmState),
  set: (value) => !value && ui.closeConfirm(false),
});
</script>

<template>
  <BaseModal v-model="open" :title="ui.confirmState?.title" size="sm">
    <p class="mb-0">{{ ui.confirmState?.message }}</p>
    <template #footer>
      <button type="button" class="btn btn-light" @click="ui.closeConfirm(false)">Annuler</button>
      <button
        type="button"
        class="btn"
        :class="`btn-${ui.confirmState?.variant || 'danger'}`"
        @click="ui.closeConfirm(true)"
      >
        {{ ui.confirmState?.confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>
