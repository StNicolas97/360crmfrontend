<script setup>
import { computed, watch, ref, useId } from "vue";
import { contactsApi, errorMessage } from "@/api";
import { useClientsStore } from "@/stores/clients";
import { useUsersStore } from "@/stores/users";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { clientLabel, fullName } from "@/utils/format";

// Rend une liste de champs déclaratifs (voir constants/taskForms.js) liés à un objet.
// Options d'un champ en plus de taskForms.js : placeholder, hint (aide sous le champ), inputmode,
// suggestions (tableau ou fonction -> <datalist>, saisie libre conservée), legacyLabel(valeur) pour une
// ancienne valeur absente de la liste, autofocus (focus initial dans une modale, voir BaseModal).
// Le parent garde la propriété des données : chaque saisie émet un nouvel objet (v-model).
const model = defineModel({ type: Object, required: true });
const props = defineProps({
  fields: { type: Array, required: true },
  errors: { type: Object, default: () => ({}) },
  disabled: { type: Boolean, default: false },
  editing: { type: Boolean, default: false }, // fiche existante (active les champs lockOnEdit)
});
const emit = defineEmits(["add-client"]);

const clients = useClientsStore();
const users = useUsersStore();
const auth = useAuthStore();
const ui = useUiStore();
const uid = useId();

const needsClients = computed(() => props.fields.some((f) => f.type === "client"));
const needsUsers = computed(() => props.fields.some((f) => f.type === "user"));
// Listes déroulantes vides sans explication si le chargement échoue : on le signale
if (needsClients.value) clients.fetch().catch(ui.onLoadError("Liste des clients indisponible"));
if (needsUsers.value) users.fetch().catch(ui.onLoadError("Liste des employés indisponible"));

// Contacts du client sélectionné (champ "contact")
const contacts = ref([]);
let contactsRequest = 0; // jeton : ignore les réponses d'un client précédent (changement rapide)
const hasContactField = computed(() => props.fields.some((f) => f.type === "contact"));
watch(
  () => model.value.idClient,
  async (clientId, previousId) => {
    if (!hasContactField.value) return;
    // Changement de client par l'utilisateur : l'ancien contact ne s'applique plus
    if (previousId != null && clientId !== previousId) set("idContact", null);
    const request = ++contactsRequest;
    if (!clientId) {
      contacts.value = [];
      return;
    }
    try {
      const list = await contactsApi.list(clientId);
      if (request === contactsRequest) contacts.value = Array.isArray(list) ? list : [];
    } catch (error) {
      if (request !== contactsRequest) return;
      contacts.value = [];
      ui.notifyError(errorMessage(error, "Contacts du client indisponibles"));
    }
  },
  { immediate: true }
);

function set(key, value) {
  model.value = { ...model.value, [key]: value };
}

function onInput(f, event) {
  const raw = event.target.value;
  if (f.type === "number") set(f.key, raw === "" ? null : Number(raw));
  else if (["client", "user", "contact"].includes(f.type)) set(f.key, raw === "" ? null : Number(raw));
  else set(f.key, raw);
}

function optionsFor(f) {
  if (f.type === "client") {
    const list = f.clientKind === "company" ? clients.companies : clients.items;
    return list.map((c) => ({ value: c.id, label: clientLabel(c, f.clientKind === "company") }));
  }
  if (f.type === "user") return users.items.map((u) => ({ value: u.id, label: fullName(u) }));
  if (f.type === "contact") {
    return contacts.value.map((c) => ({
      value: c.id,
      label: [fullName(c, ""), c.telephone].filter(Boolean).join(" – ") || "Contact sans nom",
    }));
  }
  const options = f.options ?? [];
  // Conserve une valeur existante absente de la liste (anciennes données)
  const current = model.value[f.key];
  if (current && !options.some((o) => String(o.value) === String(current))) {
    return [...options, { value: current, label: f.legacyLabel?.(current) ?? current }];
  }
  return options;
}

const isLocked = (f) =>
  props.disabled || (!auth.isAdmin && (f.adminOnly || (f.lockOnEdit && props.editing)));
const inputId = (f) => `${uid}-${f.key}`;
const errorId = (f) => `${inputId(f)}-error`;
const hintId = (f) => `${inputId(f)}-hint`;
const listId = (f) => `${inputId(f)}-list`;
const valueOf = (f) => model.value[f.key] ?? "";
const isSelect = (f) => ["select", "client", "user", "contact"].includes(f.type);

// Accessibilité : le message d'erreur et l'aide sont lus par le lecteur d'écran avec le champ
function ariaFor(f) {
  const describedBy = [f.hint && hintId(f), props.errors[f.key] && errorId(f)].filter(Boolean).join(" ");
  return {
    "aria-invalid": props.errors[f.key] ? "true" : undefined,
    "aria-describedby": describedBy || undefined,
    "aria-required": f.required ? "true" : undefined,
  };
}

// Suggestions (<datalist>) : aide à la saisie sans bloquer le texte libre. Doublons et vides retirés.
function suggestionsFor(f) {
  const list = typeof f.suggestions === "function" ? f.suggestions() : f.suggestions;
  return [...new Set((list ?? []).map((v) => String(v ?? "").trim()).filter(Boolean))];
}
</script>

<template>
  <div class="row g-3">
    <div v-for="f in fields" :key="f.key" :class="`col-12 col-md-${f.col || 12}`">
      <label :for="inputId(f)" class="form-label">
        {{ f.label }}<span v-if="f.required" class="text-danger" aria-hidden="true"> *</span>
      </label>

      <div v-if="isSelect(f)" class="input-group has-validation">
        <select
          :id="inputId(f)"
          class="form-select"
          :class="{ 'is-invalid': errors[f.key] }"
          :value="valueOf(f)"
          :disabled="isLocked(f) || (f.type === 'contact' && !model.idClient)"
          :required="f.required"
          v-bind="ariaFor(f)"
          @change="onInput(f, $event)"
        >
          <option value="">{{ f.type === "contact" ? "Aucun contact" : "— Sélectionner —" }}</option>
          <option v-for="o in optionsFor(f)" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <button
          v-if="f.type === 'client' && !isLocked(f)"
          type="button"
          class="btn btn-outline-secondary"
          title="Nouveau client"
          aria-label="Créer un nouveau client"
          @click="emit('add-client', f)"
        >
          <i class="bi bi-person-plus" aria-hidden="true"></i>
        </button>
        <div v-if="errors[f.key]" :id="errorId(f)" class="invalid-feedback">{{ errors[f.key] }}</div>
      </div>

      <textarea
        v-else-if="f.type === 'textarea'"
        :id="inputId(f)"
        class="form-control"
        :class="{ 'is-invalid': errors[f.key] }"
        rows="3"
        :value="valueOf(f)"
        :placeholder="f.placeholder"
        :disabled="isLocked(f)"
        :required="f.required"
        v-bind="ariaFor(f)"
        @input="onInput(f, $event)"
      ></textarea>

      <template v-else>
        <input
          :id="inputId(f)"
          :type="f.type || 'text'"
          class="form-control"
          :class="{ 'is-invalid': errors[f.key] }"
          :value="valueOf(f)"
          :step="f.step"
          :min="f.min"
          :max="f.max"
          :placeholder="f.placeholder"
          :inputmode="f.inputmode"
          :disabled="isLocked(f)"
          :required="f.required"
          :autocomplete="f.autocomplete"
          :data-autofocus="f.autofocus ? '' : undefined"
          :list="f.suggestions ? listId(f) : undefined"
          v-bind="ariaFor(f)"
          @input="onInput(f, $event)"
        />
        <datalist v-if="f.suggestions" :id="listId(f)">
          <option v-for="s in suggestionsFor(f)" :key="s" :value="s"></option>
        </datalist>
      </template>
      <div v-if="errors[f.key] && !isSelect(f)" :id="errorId(f)" class="invalid-feedback">
        {{ errors[f.key] }}
      </div>
      <div v-if="f.hint" :id="hintId(f)" class="form-text">{{ f.hint }}</div>
    </div>
  </div>
</template>
