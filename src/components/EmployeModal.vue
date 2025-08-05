<template>
  <div class="modal fade" id="employeModal" tabindex="-1"  role="dialog" aria-labelledby="employeModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="employeModalLabel">Ajouter un employé</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit" class="container">
                       <div class="form-row row">
                        <div class="form-group col-md-6">
                                <label for="nom">Prenom</label>
                                <input type="text" class="form-control" id="prenom" placeholder="" v-model="Employe.prenom" required>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="nom">Nom</label>
                                <input type="text" class="form-control" id="nom" placeholder="" v-model="Employe.nom" required>
                            </div>                           
                        </div>
                        <div class="mb-3">
              <label for="poste" class="form-label">Username</label>
              <input type="text" class="form-control" id="username" v-model="Employe.username" required>
            </div>
            <div class="mb-3">
              <label for="poste" class="form-label">Mot de passe</label>
              <input type="text" class="form-control" id="password" v-model="Employe.password" required>
            </div>

              
            
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="Employe.email" required>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Telephone</label>
              <input type="tel" class="form-control" id="tel" v-model="Employe.telephone" required>
            </div>
            <div class="mb-3">
              <label for="poste" class="form-label">Poste</label>
              <input type="text" class="form-control" id="poste" v-model="Employe.poste" required>
            </div>
            <div class="mb-3">
              <label for="role" class="form-label">Rôle</label>
              <select class="form-select" id="role" v-model="Employe.role" required>
                <option value="employee">Employe</option>
                <option value="admin">Admin</option>
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
import {addService} from "../api/services/add.service"
export default {
  name: 'EmployeModal',
  data() {
    return {
      Employe: { 
        username : '', 
        password : '', 
        nom : '', 
        prenom : '', 
        email : '', 
        telephone : '', 
        poste : '', 
        role : '' 
      }
    }
  },
  methods: {
    async handleSubmit() {
      try {
      const employe = this.Employe;
      const response = await addService.addUSer(employe);
      if(response) alert("Employé crée avec succès !")
      else alert("Erreur lors de la création de l'employé")
        this.$emit('submit');   
        const modal = document.getElementById('employeModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
      } catch (error) {
      console.error("Une erreur est survenue :", error);
      }
    }

  }
}
</script> 

<style>
.modal-backdrop{
    display: none;
}

.modal{
  z-index: 50000;
}
</style>