<script setup>
import { computed, watch, ref, useId } from "vue";
import { contactsApi } from "@/api";
import { useClientsStore } from "@/stores/clients";
import { useUsersStore } from "@/stores/users";
import { useAuthStore } from "@/stores/auth";
import { clientLabel, fullName } from "@/utils/format";

// Rend une liste de champs déclaratifs (voir constants/taskForms.js) liés à un objet.
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
const uid = useId();

const needsClients = computed(() => props.fields.some((f) => f.type === "client"));
const needsUsers = computed(() => props.fields.some((f) => f.type === "user"));
if (needsClients.value) clients.fetch().catch(() => {});
if (needsUsers.value) users.fetch().catch(() => {});

// Contacts du client sélectionné (champ "contact")
const contacts = ref([]);
const hasContactField = computed(() => props.fields.some((f) => f.type === "contact"));
watch(
  () => model.value.idClient,
  async (clientId, previousId) => {
    if (!hasContactField.value) return;
    // Changement de client par l'utilisateur : l'ancien contact ne s'applique plus
    if (previousId != null && clientId !== previousId) set("idContact", null);
    contacts.value = clientId ? await contactsApi.list(clientId).catch(() => []) : [];
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
    return [...options, { value: current, label: current }];
  }
  return options;
}

const isLocked = (f) =>
  props.disabled || (!auth.isAdmin && (f.adminOnly || (f.lockOnEdit && props.editing)));
const inputId = (f) => `${uid}-${f.key}`;
const valueOf = (f) => model.value[f.key] ?? "";
</script>

<template>
  <div class="row g-3">
    <div v-for="f in fields" :key="f.key" :class="`col-12 col-md-${f.col || 12}`">
      <label :for="inputId(f)" class="form-label">
        {{ f.label }}<span v-if="f.required" class="text-danger" aria-hidden="true"> *</span>
      </label>

      <div v-if="['select', 'client', 'user', 'contact'].includes(f.type)" class="input-group">
        <select
          :id="inputId(f)"
          class="form-select"
          :class="{ 'is-invalid': errors[f.key] }"
          :value="valueOf(f)"
          :disabled="isLocked(f) || (f.type === 'contact' && !model.idClient)"
          :required="f.required"
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
          <i class="bi bi-person-plus"></i>
        </button>
        <div v-if="errors[f.key]" class="invalid-feedback">{{ errors[f.key] }}</div>
      </div>

      <textarea
        v-else-if="f.type === 'textarea'"
        :id="inputId(f)"
        class="form-control"
        :class="{ 'is-invalid': errors[f.key] }"
        rows="3"
        :value="valueOf(f)"
        :disabled="isLocked(f)"
        @input="onInput(f, $event)"
      ></textarea>

      <input
        v-else
        :id="inputId(f)"
        :type="f.type || 'text'"
        class="form-control"
        :class="{ 'is-invalid': errors[f.key] }"
        :value="valueOf(f)"
        :step="f.step"
        :min="f.min"
        :max="f.max"
        :disabled="isLocked(f)"
        :required="f.required"
        :autocomplete="f.autocomplete"
        @input="onInput(f, $event)"
      />
      <div v-if="errors[f.key] && !['select', 'client', 'user', 'contact'].includes(f.type)" class="invalid-feedback">
        {{ errors[f.key] }}
      </div>
    </div>
  </div>
</template>
