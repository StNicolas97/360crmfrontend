<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/ui/PageHeader.vue";
import FormFields from "@/components/ui/FormFields.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ErrorState from "@/components/ui/ErrorState.vue";
import TaskSubcontracts from "@/components/tasks/TaskSubcontracts.vue";
import TaskAttachments from "@/components/tasks/TaskAttachments.vue";
import EmailModal from "@/components/shared/EmailModal.vue";
import PerteFormModal from "@/components/pertes/PerteFormModal.vue";
import { errorMessage } from "@/api";
import { TASK_TYPES, CLOSED_STATUS } from "@/constants/task";
import { TASK_FORMS, allFields } from "@/constants/taskForms";
import { useEditableRecord } from "@/composables/useEditableRecord";
import { useTasksStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { canEditTask } from "@/utils/permissions";
import { formatDate, fullName } from "@/utils/format";
import { taskTitle } from "@/utils/task";

const props = defineProps({
  type: { type: String, required: true },
  subId: { type: [String, Number], required: true },
});

const router = useRouter();
const tasks = useTasksStore();
const auth = useAuthStore();
const ui = useUiStore();

const meta = computed(() => TASK_TYPES[props.type]);
const sections = computed(() => TASK_FORMS[props.type] ?? []);
const fields = computed(() => allFields(sections.value));

// task = version enregistrée, form = version en cours d'édition (voir useEditableRecord)
const { record: task, form, errors, dirty, setRecord, cancel, validate, payload, commit, discard } = useEditableRecord(fields);
const loading = ref(true);
const loadError = ref(null);
const saving = ref(false);
const emailOpen = ref(false);
const perteOpen = ref(false); // « Déclarer une perte » préremplie avec cette tâche
const invoicing = ref(false);

// Modification réservée à l'admin et à l'employé assigné (le serveur renvoie 403 sinon)
const canEdit = computed(() => canEditTask(auth, task.value));
const isInvoiced = computed(() => Boolean(task.value?.qboInvoiceId));
const invoiceLabel = computed(() => {
  if (!isInvoiced.value) return "";
  const number = task.value.qboInvoiceNumber || task.value.qboInvoiceId;
  return task.value.factureLe ? `Facturée n° ${number} le ${formatDate(task.value.factureLe)}` : `Facturée n° ${number}`;
});

async function load() {
  loading.value = true;
  loadError.value = null;
  try {
    setRecord(await tasks.fetchOne(props.type, props.subId));
  } catch (e) {
    loadError.value = e.response ? errorMessage(e, "Tâche introuvable") : e.message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);

async function save() {
  if (!canEdit.value) return;
  if (!validate()) {
    ui.notifyError("Certains champs sont à corriger");
    return;
  }
  // Passage à « Terminé » : le serveur avertit le client par courriel. Même confirmation que le tableau de production.
  const closing = form.value.statut === CLOSED_STATUS && task.value.statut !== CLOSED_STATUS;
  if (closing) {
    const ok = await ui.confirm({
      title: "Terminer la tâche",
      message: `Enregistrer « ${taskTitle(task.value)} » à l'étape Terminé ? Le client sera averti par courriel.`,
      confirmLabel: "Enregistrer et avertir",
      variant: "success",
    });
    if (!ok) return;
  }
  saving.value = true;
  try {
    const values = payload();
    const response = await tasks.update(task.value, values);
    commit(values);
    ui.notify("Modifications enregistrées");
    if (response?.mailSent === true) ui.notify("Le client a été averti par courriel", "info");
    if (response?.mailSent === false) ui.notify("Le courriel au client n'a pas pu être envoyé", "warning");
  } catch (e) {
    const message =
      e.response?.status === 403
        ? "Seul l'employé assigné à cette tâche ou un administrateur peut la modifier."
        : errorMessage(e, "L'enregistrement a échoué");
    ui.notifyError(message);
  } finally {
    saving.value = false;
  }
}

async function remove() {
  const ok = await ui.confirm({
    title: "Supprimer la tâche",
    message: `La tâche #${task.value.id} « ${taskTitle(task.value)} » sera définitivement supprimée.`,
    confirmLabel: "Supprimer",
  });
  if (!ok) return;
  try {
    await tasks.remove(task.value);
    ui.notify("Tâche supprimée");
    discard(); // évite l'alerte "modifications non enregistrées"
    router.replace({ name: auth.isAdmin ? "tasks" : "my-tasks" });
  } catch (e) {
    ui.notifyError(errorMessage(e, "La suppression a échoué"));
  }
}

// Issue inconnue d'une requête : délai axios dépassé (ECONNABORTED / ETIMEDOUT) ou 502, 503, 504 (proxy, hébergeur)
function isUncertainOutcome(e) {
  if (e?.code === "ECONNABORTED" || e?.code === "ETIMEDOUT") return true;
  return [502, 503, 504].includes(e?.response?.status);
}

// Facturation QuickBooks (admin) : seul l'id de la tâche est envoyé, le serveur calcule montant et client
async function createInvoice() {
  if (!auth.isAdmin || isInvoiced.value) return;
  if (dirty.value) {
    ui.notifyError("Enregistrez d'abord vos modifications : la facture utilise les données enregistrées.");
    return;
  }
  const ok = await ui.confirm({
    title: "Créer une facture",
    message: `Une facture sera créée dans QuickBooks pour la tâche #${task.value.id} « ${taskTitle(task.value)} », à partir du prix enregistré. Cette action ne peut pas être annulée depuis le CRM.`,
    confirmLabel: "Créer la facture",
    variant: "success",
  });
  if (!ok) return;
  invoicing.value = true;
  try {
    const invoice = await tasks.invoice(task.value);
    commit(invoice);
    ui.notify(invoice.qboInvoiceNumber ? `Facture n° ${invoice.qboInvoiceNumber} créée dans QuickBooks` : "Facture créée dans QuickBooks");
  } catch (e) {
    if (e.response?.status === 409) {
      // Déjà facturée (autre poste, double clic) : on recharge pour afficher la facture existante
      ui.notifyError(errorMessage(e, "Cette tâche a déjà été facturée."));
      await load();
    } else if (isUncertainOutcome(e)) {
      // Délai dépassé ou passerelle indisponible : la facture a pu être créée côté serveur malgré l'erreur.
      // On recharge la fiche pour afficher qboInvoiceId s'il existe (un nouvel essai renverrait 409, sans doublon).
      ui.notifyError("Le serveur n'a pas confirmé la facture à temps. Vérifiez la facturation : la fiche a été rechargée.");
      await load();
    } else {
      ui.notifyError(errorMessage(e, "La facture n'a pas pu être créée"));
    }
  } finally {
    invoicing.value = false;
  }
}

const clientRoute = computed(() => task.value?.idClient && { name: "client-detail", params: { id: task.value.idClient } });
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-5"><span class="spinner-border"></span></div>

    <template v-else-if="loadError">
      <PageHeader title="Tâche" :back="{ name: 'my-tasks' }" />
      <ErrorState :message="loadError" @retry="load" />
    </template>

    <template v-else-if="task">
      <PageHeader :title="taskTitle(task)" :back="{ name: auth.isAdmin ? 'tasks' : 'my-tasks' }">
        <template #subtitle>
          <span class="d-inline-flex flex-wrap align-items-center gap-2">
            <span><i class="bi" :class="meta.icon"></i> {{ meta.label }} · #{{ task.id }}</span>
            <StatusBadge :value="task.statut" />
            <StatusBadge :value="task.priorite" kind="priority" />
            <span class="text-muted">Créée le {{ formatDate(task.createdAt) }}</span>
            <span v-if="isInvoiced" class="badge text-bg-success"><i class="bi bi-receipt me-1"></i>{{ invoiceLabel }}</span>
          </span>
        </template>
        <!-- Actions : libellé texte visible à toutes les tailles (pas d'icône seule sur tablette ou téléphone) -->
        <template #actions>
          <RouterLink v-if="clientRoute" :to="clientRoute" class="btn btn-light" title="Fiche client">
            <i class="bi bi-person-vcard" aria-hidden="true"></i><span class="ms-1">Client</span>
          </RouterLink>
          <!-- Sans adresse courriel, le bouton est désactivé (même règle que la fiche client) -->
          <button
            type="button"
            class="btn btn-light"
            :title="task.email ? 'Envoyer un courriel' : 'Aucune adresse courriel pour ce client'"
            :disabled="!task.email"
            @click="emailOpen = true"
          >
            <i class="bi bi-envelope" aria-hidden="true"></i><span class="ms-1">Courriel</span>
          </button>
          <button type="button" class="btn btn-light" title="Déclarer une perte de matériel pour cette tâche" @click="perteOpen = true">
            <i class="bi bi-archive" aria-hidden="true"></i><span class="ms-1">Perte</span>
          </button>
          <!-- Facturation réservée aux admins ; désactivée si une facture existe déjà -->
          <button
            v-if="auth.isAdmin"
            type="button"
            class="btn btn-light"
            :title="isInvoiced ? invoiceLabel : 'Créer une facture QuickBooks'"
            :disabled="invoicing || isInvoiced"
            @click="createInvoice"
          >
            <span v-if="invoicing" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-receipt" aria-hidden="true"></i><span class="ms-1">{{ isInvoiced ? "Facturée" : "Facturer" }}</span>
          </button>
          <button v-if="auth.isAdmin" type="button" class="btn btn-light text-danger" title="Supprimer" @click="remove">
            <i class="bi bi-trash" aria-hidden="true"></i><span class="ms-1">Supprimer</span>
          </button>
        </template>
      </PageHeader>

      <p v-if="!canEdit" class="alert alert-info py-2 small" role="status">
        <i class="bi bi-eye me-1"></i>Lecture seule : cette tâche est assignée à un collègue. Seul l'employé assigné ou un administrateur peut la modifier.
      </p>

      <form novalidate @submit.prevent="save">
        <div class="detail-grid">
          <section v-for="section in sections" :key="section.title" class="card-panel">
            <h2 class="panel-title mb-3">{{ section.title }}</h2>
            <FormFields v-model="form" :fields="section.fields" :errors="errors" :disabled="!canEdit" editing />
          </section>
        </div>

        <!-- Barre d'enregistrement visible uniquement s'il y a des modifications -->
        <Transition name="slide-up">
          <div v-if="dirty && canEdit" class="save-bar">
            <span><i class="bi bi-pencil-square me-2"></i>Modifications non enregistrées</span>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-light" @click="cancel">Annuler</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>Enregistrer
              </button>
            </div>
          </div>
        </Transition>
      </form>

      <div class="detail-grid mt-3">
        <TaskSubcontracts :task-id="task.id" />
        <TaskAttachments :task-id="task.id" />
      </div>

      <EmailModal v-model="emailOpen" :recipient="task.email || ''" :name="fullName(task, '')" />
      <PerteFormModal v-model="perteOpen" :task="task" />
    </template>
  </div>
</template>
