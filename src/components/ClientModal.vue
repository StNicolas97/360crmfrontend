<template>
    <div class="modal fade" id="modalclient" tabindex="-1" role="dialog" aria-labelledby="clientModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="clientModalLabel">Ajouter un client</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit" class="container">
                        <div class="form-row row">
                            <div class="form-group col-md-6">
                                <label for="nom">Nom</label>
                                <input type="text" class="form-control" id="nom" v-model="Client.nom" required>
                                <span id="alertNom"></span>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="prenom">Prénom</label>
                                <input type="text" class="form-control" id="prenom" v-model="Client.prenom" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="entreprise">Entreprise</label>
                            <input type="text" class="form-control" id="entreprise" v-model="Client.entreprise">
                        </div>
                        <div class="mb-3">
                            <label for="email">Email</label>
                            <input type="email" class="form-control" id="email" v-model="Client.email" required>
                            <span id="alertEmail"></span>
                        </div>
                        <div class="mb-3">
                            <label for="telephone">Téléphone</label>
                            <input type="tel" class="form-control" id="telephone" v-model="Client.telephone" required>
                            <span id="alertTelephone"></span>
                        </div>
                        <div class="mb-3">
                            <label for="adresse">Adresse</label>
                            <textarea class="form-control" id="adresse" v-model="Client.adresse" rows="2"></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="statut">Statut</label>
                            <select class="form-select" id="statut" v-model="Client.statut" required>
                                <option value="Actif">Actif</option>
                                <option value="Prospect">Prospect</option>
                                <option value="Inactif">Inactif</option>
                            </select>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="submit" class="btn btn-danger">Enregistrer</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { addService } from '@/api/services/add.service'
export default {
    name: 'ClientModal',
    data() {
        return {
            Client: {
                nom: '',
                prenom: '',
                entreprise: '',
                email: '',
                telephone: '',
                adresse: '',
                statut: ''
            }
        }
    },
    methods: {
        checkdata(obj) {
            let isValide = true;
            if (!obj.nom) {
                const alert = document.getElementById("alertNom");
                alert.innerText = "Veuillez entrer un nom";
                alert.style.color = 'red';
                isValide = false
            } else {
                const alert = document.getElementById("alertNom");
                alert.innerText = "";
            }

            if (!obj.telephone) {
                const alert = document.getElementById("alertTelephone");
                alert.innerText = "Veuillez entrer un numero de telephone";
                alert.style.color = 'red';
                isValide = false
            } else {
                const alert = document.getElementById("alertTelephone");
                const regTel = /^(\(?\d{3}\)?[\s\-]?)?\d{3}[\s\-]?\d{4}$/;
                if(!regTel.test(obj.telephone)){
                    alert.innerText = "Veuillez entrer un numero de telephone au format valide";
                }else{
                const alert = document.getElementById("alertTelephone");
                alert.innerText = "";
                }
            }

            const regEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const email = document.getElementById("email").value;
            if (!regEmail.test(email)) {
                const alert = document.getElementById("alertEmail");
                alert.innerText = " Veuillez entrer un e-mail valide ";
                alert.style.color = 'red';
                isValide = false
            } else {
                const alert = document.getElementById("alertEmail");
                alert.innerText = "";
            }
        },
        async handleSubmit() {
            const client = this.Client;
            const response = await addService.addClient(client);
            if(response) alert("client crée avec succès !")
            else alert("Erreur lors de la création du client")
            const modal = document.getElementById('modalclient')
            const bootstrapModal = bootstrap.Modal.getInstance(modal)
            bootstrapModal.hide()
        }
    }
}
</script>

<style>
.modal-backdrop {
    display: none;
}

.modal{
  z-index: 500000;
}
</style>
