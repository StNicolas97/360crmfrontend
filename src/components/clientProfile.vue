<template>
  <div class="container rounded bg-white mt-5 mb-5">
    <div class="row">
      <div class="col-md-5 border-right ms-auto">
        <button class="btn btn-link" @click="previous">
          <i class="bi bi-arrow-left fs-4"></i>
        </button>
        <div class="p-3 py-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="text-right">Profile Client</h4>
            <i class="bi bi-trash" @click="deleteProfile"></i>
          </div>
          <div class="row mt-2">
            <div class="col-md-6">
              <label class="labels">Prenom</label
              ><input
                type="text"
                v-model="client.prenom"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="labels">Nom</label
              ><input type="text" v-model="client.nom" class="form-control" />
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-6">
              <label class="labels">Telephone</label
              ><input
                type="text"
                v-model="client.telephone"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="labels">Entreprise</label
              ><input
                type="text"
                v-model="client.entreprise"
                class="form-control"
              />
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-12">
              <label class="labels">Email ID</label
              ><input
                type="email"
                v-model="client.email"
                class="form-control"
              />
            </div>
            <div class="col-md-12">
              <label class="labels">adresse</label
              ><input
                type="text"
                v-model="client.adresse"
                class="form-control"
              />
            </div>
            <div class="col-md-12">
              <span :class="'badge ' + getStatusClass(client.statut)"
                >Statut :
              </span>
              <select
                class="form-select"
                id="statut"
                v-model="client.statut"
                required
              >
                <option value="Actif">Actif</option>
                <option value="Prospect">Prospect</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
          <div class="mt-5 text-center">
            <button
              class="btn btn-primary profile-button"
              @click="updateProfile"
              type="button"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-5 border-left mx-auto">
        <div class="p-3 py-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="text-right">Liste des tâches</h4>
          </div>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tache in task"
                  :key="tache.id"
                  @dblclick="showTask(tache.typeTask, tache.idType)"
                >
                  <td>{{ tache.id }}</td>
                  <td>{{ tache.titre }}</td>
                  <td>
                    <span :class="'badge ' + getTaskStatusClass(tache.statut)">
                      {{ tache.statut }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Section Contacts -->
        <div class="p-3 py-5 mt-4 border-top">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="text-right">Contacts</h4>
            <button
              class="btn btn-sm btn-primary"
              @click="showAddContactForm = !showAddContactForm"
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
          
          <!-- Formulaire d'ajout de contact -->
          <div v-if="showAddContactForm" class="mb-4 p-3 border rounded">
            <h6 class="mb-3">Nouveau contact</h6>
            <div class="row mt-2">
              <div class="col-md-6">
                <label class="labels">Prénom</label>
                <input
                  type="text"
                  v-model="newContact.prenom"
                  class="form-control"
                />
              </div>
              <div class="col-md-6">
                <label class="labels">Nom</label>
                <input
                  type="text"
                  v-model="newContact.nom"
                  class="form-control"
                />
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-6">
                <label class="labels">Téléphone <span class="text-danger">*</span></label>
                <input
                  type="text"
                  v-model="newContact.telephone"
                  class="form-control"
                  required
                />
              </div>
              <div class="col-md-6">
                <label class="labels">Email</label>
                <input
                  type="email"
                  v-model="newContact.email"
                  class="form-control"
                />
              </div>
            </div>
            <div class="row mt-2">
              <div class="col-md-12">
                <label class="labels">Poste</label>
                <input
                  type="text"
                  v-model="newContact.poste"
                  class="form-control"
                />
              </div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button
                class="btn btn-sm btn-success"
                @click="createContact"
              >
                Ajouter
              </button>
              <button
                class="btn btn-sm btn-secondary"
                @click="cancelAddContact"
              >
                Annuler
              </button>
            </div>
          </div>

          <!-- Liste des contacts -->
          <div class="contacts-list">
            <div class="table-responsive" v-if="contacts.length > 0">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Prénom</th>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Email</th>
                    <th>Poste</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="contact in contacts" :key="contact.id">
                    <td>
                      <input
                        type="text"
                        v-model="contact.prenom"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="contact.nom"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="contact.telephone"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        v-model="contact.email"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        v-model="contact.poste"
                        class="form-control form-control-sm"
                      />
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button
                          class="btn btn-sm "
                          @click="saveContact(contact.id)"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          class="btn btn-sm"
                          @click="deleteContact(contact.id)"
                          title="Supprimer"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center text-muted p-3">
              Aucun contact
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getService } from "@/api/services/get.service";
import { updateService } from "@/api/services/update.service";
import { deleteService } from "@/api/services/delete.service";
import { addService } from "@/api/services/add.service";

export default {
  name: "ClientProfile",
  data() {
    return {
      client: {
        nom: "",
        prenom: "",
        entreprise: "",
        email: "",
        telephone: "",
        adresse: "",
        statut: "",
      },
      task: [],
      contacts: [],
      showAddContactForm: false,
      newContact: {
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        poste: "",
      },
    };
  },
  props: {
    clientId: {
      type: Number,
      default: null,
    },
  },
  async mounted() {
    await this.getClientId();
    await this.getClientTask();
    await this.getClientContacts();
  },
  methods: {
    async getClientId() {
      try {
        const id = this.clientId;
        const response = await getService.getClientId(id);
        this.client = response.data;
      } catch (error) {
        console.error("Une erreur est survenue", error);
      }
    },
    async getClientTask() {
      try {
        const id = this.clientId;
        const response = await getService.getClientAllTask(id);
        let tache = response.data;
        this.task = tache.map((task) => {
          let idType = task.idAff || task.idPpf || task.idLett || null;
          const { idAff, idPpf, idLett, ...attributs } = task;
          return { ...attributs, idType };
        });
      } catch (error) {
        console.error("Une erreur est survenue", error);
      }
    },
    async updateProfile() {
      try {
        const id = this.clientId;
        const userUpdate = this.client;
        const response = await updateService.updateClient(id, userUpdate);
        this.$emit("update");
      } catch (error) {
        console.error("Une erreur est survenue", error);
      }
    },
    async deleteProfile() {
      const id = this.clientId;
      const supprimer = window.confirm(
        "Voulez vous vraiment supprimer ce client?"
      );
      if (supprimer) {
        const response = await deleteService.deleteClient(id);
        this.$emit("delete");
        alert("Vous avez supprimé avec succès !");
      }
    },

    previous() {
      this.$emit("previous");
    },
    showTask(type, id) {
      this.$emit("view", type, id);
    },
    getStatusClass(statut) {
      const statusClasses = {
        Actif: "bg-success",
        Inactif: "bg-danger",
        "En attente": "bg-warning",
        Prospect: "bg-info",
      };
      return statusClasses[statut] || "bg-dark";
    },
    getTaskStatusClass(statut) {
      const taskStatusClasses = {
        Leads: "bg-warning",
        Design: "bg-primary",
        Approbation: "bg-info",
        Impression: "bg-secondary",
        Production: "bg-success",
        Installation: "bg-dark",
        Facturation: "Facturation",
      };
      return taskStatusClasses[statut] || "bg-info";
    },
    async getClientContacts() {
      try {
        const id = this.clientId;
        const response = await getService.getContactsByClient(id);
        this.contacts = response.data || [];
      } catch (error) {
        console.error("Une erreur est survenue lors de la récupération des contacts", error);
      }
    },
    async createContact() {
      try {
        if (!this.newContact.telephone) {
          alert("Le numéro de téléphone est obligatoire");
          return;
        }
        const id = this.clientId;
        const response = await addService.addContact(id, this.newContact);
        if (response) {
          this.cancelAddContact();
          await this.getClientContacts();
        }
      } catch (error) {
        console.error("Une erreur est survenue lors de la création du contact", error);
        alert("Erreur lors de la création du contact");
      }
    },
    cancelAddContact() {
      this.showAddContactForm = false;
      this.newContact = {
        nom: "",
        prenom: "",
        telephone: "",
        email: "",
        poste: "",
      };
    },
    async saveContact(contactId) {
      try {
        const contact = this.contacts.find((c) => c.id === contactId);
        if (!contact || !contact.telephone) {
          alert("Le numéro de téléphone est obligatoire");
          return;
        }
        const response = await updateService.updateContact(contactId, contact);
        if (response) {
          await this.getClientContacts();
          alert("Contact mis à jour avec succès");
        }
      } catch (error) {
        console.error("Une erreur est survenue lors de la mise à jour du contact", error);
        alert("Erreur lors de la mise à jour du contact");
      }
    },
    async deleteContact(contactId) {
      const supprimer = window.confirm(
        "Voulez-vous vraiment supprimer ce contact?"
      );
      if (supprimer) {
        try {
          const response = await deleteService.deleteContact(contactId);
          if (response) {
            await this.getClientContacts();
          }
        } catch (error) {
          console.error("Une erreur est survenue lors de la suppression du contact", error);
          alert("Erreur lors de la suppression du contact");
        }
      }
    },
  },
};
</script>

<style scoped>
.table {
  width: 100%;
  margin-bottom: 1rem;
  background-color: transparent;
  border-collapse: collapse;
  overflow: scroll;
}

tr {
  cursor: pointer;
}

tbody::-webkit-scrollbar {
  max-height: 100px;
  overflow: scroll;
}

.table th {
  padding: 0.75rem;
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
}

.table-responsive {
  height: 25rem;
  overflow-y: scroll;
}

.table td {
  padding: 0.75rem;
  vertical-align: middle;
  border-bottom: 1px solid #dee2e6;
}

.table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.badge {
  padding: 0.5em 0.8em;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85em;
}

/* Styles pour les badges de statut */
.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

.badge-info {
  background-color: #17a2b8;
  color: white;
}

.badge-primary {
  background-color: #007bff;
  color: white;
}

/* Styles pour les inputs dans le tableau des contacts */
.contacts-list .table input.form-control {
  min-width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #ced4da;
}

.contacts-list .table td {
  padding: 0.5rem;
  vertical-align: middle;
}

.contacts-list .table .d-flex.gap-2 {
  gap: 0.25rem;
}
</style>
