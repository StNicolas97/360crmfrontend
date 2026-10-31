<script>
// Pile des modales ouvertes (partagée par toutes les instances) :
//  - le défilement de la page reste bloqué tant qu'il en reste une ;
//  - seule la modale du dessus réagit au clavier (Échap, Tab), ex. confirmation ouverte par-dessus un formulaire.
const stack = [];
</script>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount, useId } from "vue";
import { useUiStore } from "@/stores/ui";
import { focusableIn, firstFieldIn } from "@/utils/focus";

// Modale contrôlée par v-model, rendue dans <body> (pas de dépendance à bootstrap.js).
// Accessibilité : role="dialog", aria-modal, titre relié, focus initial sur le premier champ,
// focus piégé dans la modale (Tab / Maj+Tab), Échap pour fermer, retour du focus au déclencheur.
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  title: { type: String, default: "" },
  size: { type: String, default: "" }, // "", "sm", "lg", "xl"
  persistent: { type: Boolean, default: false }, // pas de fermeture au clic extérieur
  // Saisie en cours : toute fermeture (Échap, ×, Annuler, clic extérieur) demande confirmation
  dirty: { type: Boolean, default: false },
});
const emit = defineEmits(["close"]);
const titleId = useId();
const dialog = ref(null);
const token = Symbol("modal");
let returnFocusTo = null; // élément qui avait le focus à l'ouverture (bouton déclencheur)

function close() {
  open.value = false;
  emit("close");
}

// Fermeture demandée par l'utilisateur : protège une saisie non enregistrée
let asking = false;
async function requestClose() {
  if (asking) return;
  if (props.dirty) {
    asking = true;
    const ok = await useUiStore().confirm({
      title: "Abandonner la saisie ?",
      message: "Les informations saisies dans ce formulaire seront perdues.",
      confirmLabel: "Abandonner",
      variant: "warning",
    });
    asking = false;
    if (!ok) return;
  }
  close();
}

const isTop = () => stack[stack.length - 1] === token;

function onKeydown(event) {
  if (!isTop()) return;
  if (event.key === "Escape") {
    event.preventDefault();
    requestClose();
  } else if (event.key === "Tab") {
    trapTab(event);
  }
}

// Piège de focus : Tab sur le dernier élément revient au premier (et inversement avec Maj)
function trapTab(event) {
  const el = dialog.value;
  if (!el) return;
  const items = focusableIn(el);
  if (!items.length) {
    event.preventDefault();
    el.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const outside = !el.contains(active);
  if (event.shiftKey && (active === first || active === el || outside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || outside)) {
    event.preventDefault();
    first.focus();
  }
}

// Focus initial : élément marqué data-autofocus, sinon premier champ, sinon premier bouton, sinon la modale
async function focusInitial() {
  await nextTick();
  const el = dialog.value;
  if (!el || !isTop()) return;
  const target = el.querySelector("[data-autofocus]") || firstFieldIn(el.querySelector(".app-modal-body")) || focusableIn(el)[0] || el;
  target.focus({ preventScroll: true });
}

let counted = false;
function track(isOpen) {
  if (isOpen === counted) return;
  counted = isOpen;
  if (isOpen) {
    returnFocusTo = document.activeElement;
    stack.push(token);
    document.addEventListener("keydown", onKeydown);
    focusInitial();
  } else {
    const index = stack.indexOf(token);
    if (index !== -1) stack.splice(index, 1);
    document.removeEventListener("keydown", onKeydown);
    // Retour du focus au déclencheur s'il existe encore (sinon le navigateur le laisse sur <body>)
    const target = returnFocusTo;
    returnFocusTo = null;
    if (target?.isConnected && typeof target.focus === "function") nextTick(() => target.focus({ preventScroll: true }));
  }
  document.body.classList.toggle("modal-open-lock", stack.length > 0);
}

watch(open, track, { immediate: true });
onBeforeUnmount(() => track(false));
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="open" class="app-modal-backdrop" @mousedown.self="!persistent && requestClose()">
        <div
          ref="dialog"
          class="app-modal"
          :class="size && `app-modal-${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
        >
          <header class="app-modal-header">
            <h2 :id="titleId" class="h5 mb-0">{{ title }}</h2>
            <button type="button" class="btn-close" aria-label="Fermer" @click="requestClose"></button>
          </header>
          <div class="app-modal-body">
            <slot />
          </div>
          <!-- Pied collant : sur téléphone, les boutons restent visibles pendant le défilement du formulaire -->
          <footer v-if="$slots.footer" class="app-modal-footer">
            <slot name="footer" :close="requestClose" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
