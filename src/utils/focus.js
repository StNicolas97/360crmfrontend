import { nextTick } from "vue";

// Outils de focus partagés (modales, formulaires). Aucune dépendance externe.

// Éléments pouvant recevoir le focus au clavier
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

// Premier champ de saisie (et non le bouton « Fermer ») : focus initial d'une modale de formulaire
const FIELDS = "input:not([disabled]):not([type='hidden']):not([type='file']), select:not([disabled]), textarea:not([disabled])";

const isVisible = (el) => el.getClientRects().length > 0 || el === document.activeElement;

export function focusableIn(container) {
  if (!container) return [];
  return [...container.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest("[inert]") && isVisible(el));
}

export function firstFieldIn(container) {
  if (!container) return null;
  return container.querySelector("[autofocus]") || [...container.querySelectorAll(FIELDS)].find(isVisible) || null;
}

/**
 * Après une validation ratée : place le focus sur le premier champ en erreur et le fait défiler
 * au centre de l'écran (sur téléphone, l'erreur est souvent hors de vue dans un long formulaire).
 * À appeler après avoir rempli l'objet `errors` : on attend le rendu des attributs aria-invalid.
 */
export async function focusFirstInvalid(container = document) {
  await nextTick();
  const root = container?.$el ?? container; // accepte un composant ou un élément
  const target = root?.querySelector?.("[aria-invalid='true']");
  if (!target) return false;
  target.focus({ preventScroll: true });
  target.scrollIntoView?.({ block: "center", behavior: "smooth" });
  return true;
}
