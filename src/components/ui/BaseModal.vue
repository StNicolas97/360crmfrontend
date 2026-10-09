<script>
// Nombre de modales ouvertes : le défilement de la page reste bloqué tant qu'il en reste une
let openCount = 0;
</script>

<script setup>
import { watch, onBeforeUnmount, useId } from "vue";

// Modale contrôlée par v-model, rendue dans <body> (pas de dépendance à bootstrap.js)
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  title: { type: String, default: "" },
  size: { type: String, default: "" }, // "", "sm", "lg", "xl"
  persistent: { type: Boolean, default: false }, // pas de fermeture au clic extérieur
});
const emit = defineEmits(["close"]);
const titleId = useId();

function close() {
  open.value = false;
  emit("close");
}

function onKeydown(event) {
  if (event.key === "Escape" && !props.persistent) close();
}

let counted = false;
function track(isOpen) {
  if (isOpen === counted) return;
  counted = isOpen;
  openCount += isOpen ? 1 : -1;
  document.body.classList.toggle("modal-open-lock", openCount > 0);
  if (isOpen) document.addEventListener("keydown", onKeydown);
  else document.removeEventListener("keydown", onKeydown);
}

watch(open, track, { immediate: true });
onBeforeUnmount(() => track(false));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="app-modal-backdrop" @mousedown.self="!persistent && close()">
        <div
          class="app-modal"
          :class="size && `app-modal-${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
        >
          <header class="app-modal-header">
            <h2 :id="titleId" class="h5 mb-0">{{ title }}</h2>
            <button type="button" class="btn-close" aria-label="Fermer" @click="close"></button>
          </header>
          <div class="app-modal-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="app-modal-footer">
            <slot name="footer" :close="close" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
