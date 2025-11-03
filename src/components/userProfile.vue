<template>
  <div class="container rounded bg-white mt-5 mb-5">
    <div class="row">
      <div class="col-md-7 border-right">
        <div class="mt-4">
          <button class="btn btn-link" @click="previous">
            <i class="bi bi-arrow-left fs-4"></i>
          </button>
          <div
            class="d-flex justify-content-between align-items-center experience"
          >
            <span>Tâches assignées</span>
          </div>
          <div class="table-responsive mt-3">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Date d'échéance</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tache in taches"
                  :key="tache.id"
                  @dblclick="showTask(tache.typeTask, tache.idType)"
                >
                  <td>{{ tache.id }}</td>
                  <td>{{ tache.titre }}</td>
                  <td>{{ tache.datefin }}</td>
                  <td>
                    <span :class="'badge ' + getPriorityClass(tache.priorite)">
                      {{ tache.priorite }}
                    </span>
                  </td>
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
      </div>
      <div class="col-md-5 border-right">
        <div class="p-3 py-5">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="text-right">Profil Employe</h4>
            <div>
              <i class="bi bi-trash" @click="deleteProfile"></i>
              <i class="bi bi-key" @click="login = true"></i>
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-6">
              <label class="labels">Prenom</label
              ><input type="text" class="form-control" v-model="user.prenom" />
            </div>
            <div class="col-md-6">
              <label class="labels">Nom</label
              ><input type="text" class="form-control" v-model="user.nom" />
            </div>
          </div>
          <div class="row mt-2">
            <div class="col-md-6">
              <label class="labels">Telephone</label
              ><input
                type="text"
                class="form-control"
                v-model="user.telephone"
              />
            </div>
            <div class="col-md-6">
              <label class="labels">Username</label
              ><input
                type="text"
                class="form-control"
                v-model="user.username"
              />
            </div>
          </div>
          <div class="row mt-3">
            <div class="col-md-12">
              <label class="labels">Email ID</label
              ><input type="email" class="form-control" v-model="user.email" />
            </div>
            <div class="col-md-12">
              <label class="labels">Poste</label
              ><input type="text" class="form-control" v-model="user.poste" />
            </div>
            <div class="col-md-12">
              <label class="labels">Couleur</label
              ><input
                type="color"
                class="form-control"
                v-model="user.couleur"
              />
            </div>
          </div>
          <div v-if="login === true" class="row mt-2">
            <h5>Modifier les identifiants</h5>
            <div class="col-md-6">
              <label class="labels">username</label
              ><input
                type="text"
                class="form-control"
                v-model="user.username"
              />
            </div>
            <div class="col-md-6">
              <label class="labels">password</label
              ><input
                type="text"
                class="form-control"
                v-model="user.password"
              />
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
    </div>
  </div>
</template>

<script>
import { getService } from "@/api/services/get.service";
import { updateService } from "@/api/services/update.service";
import { deleteService } from "@/api/services/delete.service";
export default {
  name: "UserProfile",
  data() {
    return {
      user: {
        username: "",
        password: "",
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        poste: "",
        role: "",
        couleur: "",
      },
      taches: [],
      login: false,
    };
  },
  props: {
    userId: {
      type: Number,
      default: null,
    },
  },
  created() {
    this.activeInput();
  },
  async mounted() {
    await this.getUserId(), await this.getUserTasks();
  },
  methods: {
    async getUserId() {
      try {
        const id = this.userId;
        const response = await getService.getUserID(id);
        this.user = response.data;
        await this.getUserTasks(id);
      } catch (error) {
        console.error("Une erreur est survenue", error);
      }
    },
    async getUserTasks() {
      try {
        const id = this.userId;
        const response = await getService.getEmployeAllTask(id);
        let task = response.data;
        this.taches = task.map((task) => {
          let idType = task.idAff || task.idPpf || task.idLett || null;
          const { idAff, idPpf, idLett, ...attributs } = task;
          return { ...attributs, idType };
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches", error);
      }
    },
    previous() {
      this.$emit("previous");
    },
    showTask(type, id) {
      this.$emit("view", type, id);
    },
    getPriorityClass(priorite) {
      const priorityClasses = {
        Urgent: "bg-danger",
        Normal: "bg-success",
        Basse: "bg-info",
      };
      return priorityClasses[priorite] || "bg-dark";
    },
    getTaskStatusClass(statut) {
      const taskStatusClasses = {
        Leads: "bg-warning",
        Design: "bg-primary",
        Approbation: "bg-info",
        Impression: "bg-secondary",
        Production: "bg-success",
        Installation: "bg-dark",
        Facturation: "bg-danger",
      };
      return taskStatusClasses[statut] || "bg-primary";
    },
    async updateProfile() {
      try {
        const id = this.userId;
        const userUpdate = this.user;
        if (userUpdate.couleur.charAt(0) !== "#") {
          alert("Veuillez entrer une couleur au format Hexadecimal");
        } else {
          const response = await updateService.updateUser(id, userUpdate);
          this.$emit("update");
        }
      } catch (error) {
        console.error("Une erreur est survenue", error);
      }
    },
    async deleteProfile() {
      const id = this.userId;
      const supprimer = window.confirm(
        "Voulez vous vraiment supprimer cet utilisateur?"
      );
      if (supprimer) {
        const response = await deleteService.deleteUser(id);
        this.$emit("delete");
        alert("Vous avez supprimé avec succès !");
      }
    },
    activeInput() {
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input) => {
        input.addEventListener("click", () => {
          input.removeAttribute("disabled");
        });
      });
    },
  },
};
</script>

<style>
.form-control {
  border: none;
  background: transparent;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.table-responsive {
  height: 25rem;
  overflow-y: scroll;
}

tr {
  cursor: pointer;
}

.form-control:focus {
  box-shadow: none;
  border-color: #3498db;
  background: #f8fafc;
}

.form-control:hover {
  background: #f8fafc;
}

/* Style pour les labels */
.labels {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

/* Style pour les groupes de champs */
.mt-2,
.mt-3 {
  margin-top: 1.5rem !important;
}

/* Style pour le bouton */
.profile-button {
  background: #3498db;
  border: none;
  padding: 10px 30px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.profile-button:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

/* Style pour l'icône de suppression */
.bi-trash {
  color: #e74c3c;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bi-trash:hover {
  color: #c0392b;
  transform: scale(1.1);
}

/* Style pour l'image de profil */
.rounded-circle {
  border: 3px solid #f8f9fa;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.rounded-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

/* Style pour le conteneur principal */
.container {
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: white;
}

/* Style pour les sections */
.border-right {
  border-right: 1px solid #f0f0f0 !important;
}

/* Style pour les titres */
h4 {
  color: #2c3e50;
  font-weight: 600;
}

/* Style pour les informations utilisateur */
.font-weight-bold {
  color: #2c3e50;
  font-size: 1.2rem;
  margin-top: 1rem;
}

.text-black-50 {
  color: #7f8c8d !important;
}
</style>
