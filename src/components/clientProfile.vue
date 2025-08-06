<template>
    <div class="container rounded bg-white mt-5 mb-5">
        <div class="row">
            <div class="col-md-5 border-right ms-auto">
                <button class="btn btn-link" @click="previous">
                        <i class="bi bi-arrow-left fs-4"></i>
                    </button>
                <div class="p-3 py-5">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="text-right">Profile Client</h4><i class="bi bi-trash" @click="deleteProfile"></i>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-6"><label class="labels">Prenom</label><input type="text"
                            v-model="client.prenom" class="form-control"></div>
                        <div class="col-md-6"><label class="labels">Nom</label><input type="text" v-model="client.nom"
                                class="form-control"></div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-6"><label class="labels">Telephone</label><input type="text"
                            v-model="client.telephone" class="form-control"></div>
                        <div class="col-md-6"><label class="labels">Entreprise</label><input type="text"
                                v-model="client.entreprise" class="form-control"></div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-md-12"><label class="labels">Email ID</label><input type="email"
                                v-model="client.email" class="form-control"></div>
                        <div class="col-md-12"><label class="labels">adresse</label><input type="text"
                                v-model="client.adresse" class="form-control"></div>
                        <div class="col-md-12"><span :class="'badge ' + getStatusClass(client.statut)">Statut : </span>
                            <select class="form-select" id="statut" v-model="client.statut" required>
                                <option value="Actif">Actif</option>
                                <option value="Prospect">Prospect</option>
                                <option value="Inactif">Inactif</option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-5 text-center"><button class="btn btn-primary profile-button" @click="updateProfile"
                            type="button">Enregistrer</button></div>
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
                                <tr v-for="tache in task" :key="tache.id" @dblclick="showTask(tache.typeTask, tache.idType)">
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
            </div>
        </div>
    </div>
</template>

<script>
import { getService } from '@/api/services/get.service';
import { updateService } from '@/api/services/update.service';
import { deleteService } from '@/api/services/delete.service';
export default {
    name: 'ClientProfile',
    data() {
        return {
            client: {
                nom: '',
                prenom: '',
                entreprise: '',
                email: '',
                telephone: '',
                adresse: '',
                statut: ''
            },
            task: []
        }
    },
    props: {
        clientId: {
            type: Number,
            default: null
        }
    },
    async mounted() {
        await this.getClientId();
        await this.getClientTask();
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
                let tache = response.data
                this.task = tache.map((task) => {
                    let idType = task.idAff || task.idPpf || task.idLett || null
                    const {idAff, idPpf, idLett, ...attributs} = task;
                    return {...attributs, idType};
                });
            } catch (error) {
                console.error("Une erreur est survenue", error);
            }
        },
        async updateProfile() {
            try {
                const id = this.clientId;
                const userUpdate = this.client;
                const valider = window.confirm("Confirmer les modifications de ce client?");
                if (valider) {
                    const response = await updateService.updateClient(id, userUpdate);
                    alert("informations modifiée avec succès")
                }
            } catch (error) {
                console.error("Une erreur est survenue", error);
            }
        },
        async deleteProfile() {
            const id = this.clientId;
            const supprimer = window.confirm("Voulez vous vraiment supprimer ce client?");
            if (supprimer) {
                const response = await deleteService.deleteClient(id);
                this.$emit('delete');
                alert("Vous avez supprimé avec succès !")
            }
        },
        
        previous(){
            this.$emit('previous');
        },
        showTask(type, id){
            this.$emit('view',type, id);
        },
        getStatusClass(statut) {
            const statusClasses = {
                'Actif': 'bg-success',
                'Inactif': 'bg-danger',
                'En attente': 'bg-warning',
                'Prospect': 'bg-info'
            }
            return statusClasses[statut] || 'bg-dark'
        },
        getTaskStatusClass(statut) {
            const taskStatusClasses = {
                'Leads': 'bg-warning',
                'Design': 'bg-primary',
                'Approbation': 'bg-info',
                'Impression': 'bg-secondary',
                'Production' : 'bg-success',
                'Installation' : 'bg-dark',
                'Facturation' : 'Facturation'
            }
            return taskStatusClasses[statut] || 'bg-info'
        }
    }
}
</script>

<style scoped>
.table {
    width: 100%;
    margin-bottom: 1rem;
    background-color: transparent;
    border-collapse: collapse;
    overflow: scroll;
}

tr{
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
    background-color: rgba(0, 0, 0, .075);
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
</style>
