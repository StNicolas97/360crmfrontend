import { ref, computed, unref } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { validateForm } from "@/utils/forms";
import { focusFirstInvalid } from "@/utils/focus";
import { useUiStore } from "@/stores/ui";

/**
 * Schéma commun des fiches éditables (client, tâche, employé, profil) :
 * version enregistrée + copie en cours d'édition, détection des modifications,
 * validation, annulation et avertissement avant de quitter la page.
 *
 * @param fields  liste des champs éditables (tableau, ref ou computed)
 * @returns { record, form, errors, dirty, setRecord, cancel, validate, payload, commit, discard }
 */
export function useEditableRecord(fields) {
  const ui = useUiStore();
  const record = ref(null); // version enregistrée
  const form = ref({}); // version en cours d'édition
  const errors = ref({});

  const keys = computed(() => unref(fields).map((f) => f.key));
  const dirty = computed(
    () => Boolean(record.value) && keys.value.some((key) => String(form.value[key] ?? "") !== String(record.value[key] ?? ""))
  );

  // Nouvelle version enregistrée (chargement ou enregistrement réussi)
  function setRecord(value) {
    record.value = value;
    form.value = value ? { ...value } : {};
    errors.value = {};
  }

  function cancel() {
    setRecord(record.value);
  }

  // true si le formulaire est valide ; sinon les erreurs sont affichées sous les champs
  // et le focus va au premier champ en erreur (souvent hors écran sur téléphone)
  function validate() {
    errors.value = validateForm(form.value, unref(fields));
    const valid = Object.keys(errors.value).length === 0;
    if (!valid) focusFirstInvalid(document);
    return valid;
  }

  // Valeurs des seuls champs éditables, prêtes à envoyer à l'API
  const payload = () => Object.fromEntries(keys.value.map((key) => [key, form.value[key] ?? null]));

  // Après un enregistrement réussi : fusionne les valeurs envoyées dans la version enregistrée
  function commit(values) {
    setRecord({ ...record.value, ...values });
  }

  // Après une suppression : plus rien à protéger, la navigation n'est pas bloquée
  function discard() {
    record.value = null;
  }

  onBeforeRouteLeave(async () =>
    !dirty.value ||
    ui.confirm({
      title: "Modifications non enregistrées",
      message: "Quitter la page sans enregistrer vos modifications ?",
      confirmLabel: "Quitter",
      variant: "warning",
    })
  );

  return { record, form, errors, dirty, setRecord, cancel, validate, payload, commit, discard };
}
