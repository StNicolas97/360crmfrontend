<script setup>
defineProps({ message: { type: String, required: true } });
defineEmits(["retry"]);
</script>

<template>
  <div class="alert alert-danger d-flex align-items-center justify-content-between gap-3" role="alert">
    <span><i class="bi bi-exclamation-octagon me-2"></i>{{ message }}</span>
    <button type="button" class="btn btn-sm btn-outline-danger" @click="$emit('retry')">Réessayer</button>
  </div>
</template>
