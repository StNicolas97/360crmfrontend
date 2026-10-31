<script setup>
import { ref, computed, watch } from "vue";
import BaseModal from "@/components/ui/BaseModal.vue";
import FormFields from "@/components/ui/FormFields.vue";
import { PERTE_FIELDS, PERTE_RAISONS } from "@/constants/forms";
import { validateForm } from "@/utils/forms";
import { focusFirstInvalid } from "@/utils/focus";
import { taskTitle } from "@/utils/task";
import { usePertesStore } from "@/stores/pertes";
import { useTasksStore } from "@/stores/tasks";
import { useUiStore } from "@/stores/ui";
import { errorMessage } from "@/api";

// Déclaration d'une perte de matériel.
// Ouverte depuis la page Pertes, ou depuis une fiche tâche avec `task` : la tâche liée est alors
// préremplie et placée en tête (l'employé n'a plus qu'à saisir le vinyle et le coût).
const open = defineModel({ type: Boolean, default: false });
const props = defineProps({
  task: { type: Object, default: null }, // tâche d'origine (fiche tâche), facultative
});
const pertes = usePertesStore();
const tasks = useTasksStore();
const ui = useUiStore();
const formEl = ref(null);

// Suggestions tirées des pertes déjà déclarées : mêmes libellés d'une saisie à l'autre (agrégation
// possible), sans bloquer un nouveau matériau. Les plus récentes d'abord.
const recent = computed(() => [...pertes.items].sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))));
const pick = (key) => recent.value.map((p) => p[key]);

// Liste des tâches pour « Tâche liée » (admin : toutes ; employé : les siennes),
// plus la tâche d'origine si elle n'y figure pas (ex. fiche d'un collègue).
const taskOptions = computed(() => {
  const list = tasks.items.map((t) => ({ value: t.id, label: `#${t.id} · ${taskTitle(t)}` }));
  if (props.task && !list.some((o) => String(o.value) === String(props.task.id))) {
    list.unshift({ value: props.task.id, label: `#${props.task.id} · ${taskTitle(props.task)}` });
  }
  return list;
});

const fields = computed(() => {
  const linked = {
    key: "idTache",
    label: props.task ? "Tâche liée" : "Tâche liée (optionnel)",
    type: "select",
    col: 12,
    options: taskOptions.value,
  };
  const base = PERTE_FIELDS.map((f) => {
    // autofocus : le curseur va directement au vinyle, même si la tâche liée est affichée au-dessus
    if (f.key === "typeVinyle") return { ...f, autofocus: true, suggestions: () => pick("typeVinyle") };
    if (f.key === "typeLaminier") return { ...f, suggestions: () => pick("typeLaminier") };
    if (f.key === "raison") return { ...f, suggestions: () => [...PERTE_RAISONS, ...pick("raison")] };
    return f;
  });
  // Depuis une fiche tâche, la tâche liée est l'information de contexte : on la montre en premier
  return props.task ? [linked, ...base] : [...base, linked];
});

const blank = () => ({ typeVinyle: "", typeLaminier: "", dimensions: "", cout: null, raison: "", idTache: props.task?.id ?? "" });
const form = ref(blank());
const errors = ref({});
const saving = ref(false);

// Saisie commencée : la fermeture (Échap, clic extérieur, Annuler) demande confirmation
const dirty = computed(() => {
  const initial = blank();
  return Object.keys(initial).some((key) => String(form.value[key] ?? "") !== String(initial[key] ?? ""));
});

watch(open, (isOpen) => {
  if (isOpen) {
    form.value = blank();
    errors.value = {};
    // Liste des tâches pour le champ « Tâche liée » : un échec n'empêche pas la déclaration, mais il est signalé
    tasks.fetch().catch(ui.onLoadError("Liste des tâches indisponible (champ « Tâche liée »)"));
    // Suggestions seulement : sans elles la saisie libre fonctionne, l'échec n'est donc pas signalé
    pertes.fetch().catch(() => {});
  }
});

async function submit() {
  errors.value = validateForm(form.value, fields.value);
  if (Object.keys(errors.value).length) {
    focusFirstInvalid(formEl.value);
    return;
  }
  saving.value = true;
  try {
    // L'auteur (idAssigne) est fixé par le serveur à l'utilisateur connecté : on ne l'envoie plus
    const { idTache, ...perte } = form.value;
    await pertes.create({ ...perte, idTache: idTache === "" || idTache == null ? null : Number(idTache) });
    ui.notify("Perte enregistrée");
    open.value = false;
  } catch (error) {
    ui.notifyError(errorMessage(error, "La perte n'a pas pu être enregistrée"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <BaseModal v-model="open" :title="task ? `Déclarer une perte · tâche #${task.id}` : 'Déclarer une perte'" :dirty="dirty">
    <form id="perte-form" ref="formEl" novalidate @submit.prevent="submit">
      <FormFields v-model="form" :fields="fields" :errors="errors" />
    </form>
    <template #footer="{ close }">
      <button type="button" class="btn btn-light" @click="close">Annuler</button>
      <button type="submit" form="perte-form" class="btn btn-primary" :disabled="saving">
        <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
      </button>
    </template>
  </BaseModal>
</template>
