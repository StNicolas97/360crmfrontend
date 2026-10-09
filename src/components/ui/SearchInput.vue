<script setup>
const query = defineModel({ type: String, default: "" });
defineProps({ placeholder: { type: String, default: "Rechercher…" } });
</script>

<template>
  <div class="search-input">
    <i class="bi bi-search" aria-hidden="true"></i>
    <input v-model="query" type="search" class="form-control" :placeholder="placeholder" :aria-label="placeholder" />
    <button v-if="query" type="button" class="search-clear" aria-label="Effacer la recherche" @click="query = ''">
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>
