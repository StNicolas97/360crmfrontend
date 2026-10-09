<script setup>
import { useRouter } from "vue-router";

// En-tête de page : titre, sous-titre, bouton retour optionnel, actions à droite
const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  back: { type: [String, Object], default: null }, // route de repli si aucun historique
});
const router = useRouter();

function goBack() {
  if (window.history.state?.back) router.back();
  else router.push(props.back);
}
</script>

<template>
  <header class="page-header">
    <div class="d-flex align-items-center gap-2 min-w-0">
      <button v-if="back" type="button" class="btn btn-light btn-icon" aria-label="Retour" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </button>
      <div class="min-w-0">
        <h1 class="page-title text-truncate">
          <slot name="title">{{ title }}</slot>
        </h1>
        <p v-if="subtitle || $slots.subtitle" class="page-subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </p>
      </div>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
