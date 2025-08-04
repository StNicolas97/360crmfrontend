<template>
    <div class="container py-4">
      <!-- En-tête -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button class="btn btn-link p-0 me-3" @click="previous">
            <i class="bi bi-arrow-left fs-4"></i>
          </button>
          <span class="fs-4 fw-bold text-capitalize">{{ task.typeTask }}</span>
          <span class="badge ms-2" :class="getTaskStatusClass(task.statut)">{{ task.statut }}</span>
        </div>
        <div>
          <button class="btn btn-outline-primary me-2" @click="updateTask" title="Modifier">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-outline-danger me-2" @click="deleteTask" title="Supprimer">
            <i class="bi bi-trash"></i>
          </button>
          <button class="btn btn-outline-success" @click="createInvoice" title="Facture">
            <i class="bi bi-receipt"></i>
          </button>
        </div>
      </div>
  
      <div class="row g-4">
        <!-- Colonne gauche : Infos générales -->
        <div class="col-12 col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title mb-3">Informations générales</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><strong>Date de début :</strong> <input type="date" class="form-control" v-model="task.datedebut"></li>
                <li class="list-group-item"><strong>Date de fin :</strong> <input type="date" class="form-control" v-model="task.datefin"></li>
                <li class="list-group-item">
                  <strong>Status :</strong>
                  <select class="form-select" v-model="task.statut">
                    <option value="Leads">Leads</option>
                    <option value="Design">Design</option>
                    <option value="Approbation">Approbation</option>
                    <option value="Impression">Impression</option>
                    <option value="Production">Production</option>
                    <option value="Installation">Installation</option>
                    <option value="Facturation">Facturation</option>
  
                  </select>
                </li>
                <li class="list-group-item">
                  <strong>Priorité :</strong>
                  <select class="form-select" v-model="task.priorite">
                    <option value="Urgent">Urgent</option>
                    <option value="Normal">Normal</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </li>
                <li class="list-group-item"><strong>Client :</strong> {{ task.nom }} {{ task.prenom }}</li>
                <li class="list-group-item"><strong>Identifiant :</strong> {{ task.idTache }}</li>
                <li class="list-group-item"><strong>Prix :</strong> <input type="number" class="form-control" v-model="task.prix"></li>
                <li class="list-group-item"><strong>Assigné :</strong> {{task.nomEmploye}}</li>
              </ul>
            </div>
          </div>
        </div>
  
        <!-- Colonne droite : Détails spécifiques -->
        <div class="col-12 col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <h5 class="card-title mb-3">Détails</h5>
              <ul class="list-group list-group-flush">
                <!-- PPF -->
                <template v-if="task.typeTask === 'PPF'">
                  <li class="list-group-item">
                    <strong>Titre :</strong>
                    <select class="form-select" v-model="task.titre">
                      <option value=""></option>
                      <option value="Argent">Argent</option>
                      <option value="Argentp">Argent +</option>
                      <option value="Autres">Autres</option>
                      <option value="Bronze">Bronze</option>
                      <option value="Custom">Custom</option>
                      <option value="Disponibilité">Disponibilité</option>
                      <option value="Entretien">Entretien Annuel</option>
                      <option value="Kit">Kit de Van</option>
                      <option value="Nano">Nano</option>
                      <option value="Or">Or</option>
                      <option value="Platinium">Platinium</option>
                      <option value="René">René</option>
                      <option value="Réparation">Réparation</option>
                      <option value="courtoisie">Véhicule de courtoisie</option>
                      <option value="teintées">Vitres teintées</option>
                    </select>
                  </li>
                  <li class="list-group-item"><strong>Heure Début :</strong> <input type="time" class="form-control" v-model="task.heuredebut"></li>
                  <li class="list-group-item"><strong>Heure Fin :</strong> <input type="time" class="form-control" v-model="task.heurefin"></li>
                  <li class="list-group-item"><strong>Véhicule (modèle/année) :</strong> <input type="text" class="form-control" v-model="task.vehicule"></li>
                  <li class="list-group-item"><strong>VIN # :</strong> <input type="text" class="form-control" v-model="task.vin"></li>
                  <li class="list-group-item"><strong>Couleur :</strong> <input type="text" class="form-control" v-model="task.couleur"></li>
                  <li class="list-group-item"><strong>Adresse :</strong> <input type="text" class="form-control" v-model="task.adresse"></li>
                  <li class="list-group-item">
                    <strong>Type de produits :</strong>
                    <select class="form-select" v-model="task.produit">
                      <option value="Ultimate">Xpel Ultimate Plus</option>
                      <option value="Stealth">Xpel Stealth</option>
                      <option value="Fusion">Xpel Fusion</option>
                      <option value="esthétique">Wrap esthétique</option>
                      <option value="commercial">Wrap commercial</option>
                      <option value="CS">Xpel Prime CS Black</option>
                      <option value="XR">Xpel Prime XR Black</option>
                    </select>
                  </li>
                  <li class="list-group-item"><strong>Teinte des vitres :</strong> <input type="text" class="form-control" v-model="task.vitre"></li>
                  <li class="list-group-item">
                    <strong>Financement :</strong>
                    <select class="form-select" v-model="task.financement">
                      <option value="Interessé">Interessé</option>
                      <option value="recu">A recu l'information</option>
                      <option value="Approuvé">Approuvé</option>
                    </select>
                  </li>
                  <li class="list-group-item">
                    <strong>Véhicule de courtoisie :</strong>
                    <select class="form-select" v-model="task.courtoisie">
                      <option value="#2">Ford Fusion #2</option>
                      <option value="#3">Ford Fusion #3</option>
                      <option value="#4">Ford Fusion #4</option>
                      <option value="#5">Ford Fusion #5</option>
                      <option value="#6">Ford Fusion #6</option>
                      <option value="#7">Ford Fusion #7</option>
                    </select>
                  </li>
                  <li class="list-group-item"><strong>Pièce jointe :</strong> <input type="file" class="form-control" @change="handleFileUpload"></li>
                  <li class="list-group-item"><strong>Informations supplémentaires :</strong> <textarea class="form-control" rows="3" v-model="task.description"></textarea></li>
                </template>
  
                <!-- Lettrage -->
                <template v-else-if="task.typeTask === 'lettrage'">
                  <li class="list-group-item"><strong>Modèle :</strong> <input type="text" class="form-control" v-model="task.modele"></li>
                  <li class="list-group-item"><strong>Specs (Toit/WB/Boite) :</strong> <input type="text" class="form-control" v-model="task.specs"></li>
                  <li class="list-group-item"><strong>Année :</strong> <input type="number" class="form-control" v-model="task.annee"></li>
                  <li class="list-group-item"><strong>Couleur :</strong> <input type="text" class="form-control" v-model="task.couleur"></li>
                  <li class="list-group-item"><strong>Quantité :</strong> <input type="number" class="form-control" v-model="task.quantite"></li>
                  <li class="list-group-item"><strong>Type de papier :</strong> <input type="text" class="form-control" v-model="task.typePapier"></li>
                  <li class="list-group-item">
                    <strong>Découpe :</strong>
                    <select class="form-select" v-model="task.decoupe">
                      <option value="oui">oui</option>
                      <option value="non">non</option>
                    </select>
                  </li>
                  <li class="list-group-item"><strong>Imprimante :</strong> <input type="text" class="form-control" v-model="task.imprimante"></li>
                  <li class="list-group-item"><strong>Description :</strong> <textarea class="form-control" rows="3" v-model="task.description"></textarea></li>
                </template>
  
                <!-- Affichage -->
                <template v-else-if="task.typeTask === 'affichage'">
                  <li class="list-group-item"><strong>Quantité :</strong> <input type="number" class="form-control" v-model="task.quantite"></li>
                  <li class="list-group-item"><strong>Type de papier :</strong> <input type="text" class="form-control" v-model="task.typePapier"></li>
                  <li class="list-group-item"><strong>Type de laminage :</strong> <input type="text" class="form-control" v-model="task.typeLaminage"></li>
                  <li class="list-group-item">
                    <strong>Découpe :</strong>
                    <select class="form-select" v-model="task.decoupe">
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                  </li>
                  <li class="list-group-item"><strong>Hauteur :</strong> <input type="number" class="form-control" v-model="task.hauteur"></li>
                  <li class="list-group-item"><strong>Largeur :</strong> <input type="number" class="form-control" v-model="task.largeur"></li>
                  <li class="list-group-item"><strong>Imprimante :</strong> <input type="text" class="form-control" v-model="task.imprimante"></li>
                  <li class="list-group-item">
                    <strong>Type de matériel :</strong>
                    <select class="form-select" v-model="task.typeMateriel">
                      <option value="coroplast">Coroplast</option>
                      <option value="alupanel">Alupanel</option>
                      <option value="pvc foam">PVC Foam</option>
                      <option value="autre">Autre</option>
                    </select>
                  </li>
                  <li class="list-group-item"><strong>Quantité oeillet :</strong> <input type="number" class="form-control" v-model="task.quantiteOeillet"></li>
                  <li class="list-group-item"><strong>Description :</strong> <textarea class="form-control" rows="3" v-model="task.description"></textarea></li>
                </template>
  
                <!-- Soustraitance -->
                <template v-else-if="task.typeTask === 'soustraitance'">
                  <li class="list-group-item"><strong>Largeur :</strong> <input type="number" class="form-control" v-model="task.largeur"></li>
                  <li class="list-group-item"><strong>Hauteur :</strong> <input type="number" class="form-control" v-model="task.hauteur"></li>
                  <li class="list-group-item"><strong>Quantité :</strong> <input type="number" class="form-control" v-model="task.quantite"></li>
                  <li class="list-group-item"><strong>Type de papier :</strong> <input type="text" class="form-control" v-model="task.typePapier"></li>
                  <li class="list-group-item"><strong>Date d'envoi en production :</strong> <input type="date" class="form-control" v-model="task.dateEnvoi"></li>
                </template>
              </ul>
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
  import { addService } from '@/api/services/add.service';
  export default {
      name: 'TaskProfile',
      data() {
          return {
              task: {
              },
              role: ''
          }
      },
      props: {
          idTask: {
              type: Number,
              default: null
          },
          endPoint: {
              type: String,
              default: ''
          }
      },
      async mounted() {
          await this.fetchTask();
      }
      , methods: {
          async fetchTask() {
              const id = this.idTask;
              const lien = this.endPoint;
              try {
                  const response = await getService.getTaskId(lien, id);
                  this.task = response.data;
              } catch (error) {
                  console.error("Erreur lors de la récupération de la tâche :", error);
              }
          },
          async deleteTask() {
              const id = this.task.idTache;
              const lien = this.endPoint
              const supprimer = window.confirm("Voulez vous vraiment supprimer cette tâche?");
              if (supprimer) {
                  try {
                      const response = await deleteService.deleteTask(lien, id);
                      this.$emit('delete');
                      alert("Vous avez supprimé cette tâche !");
                  } catch (error) {
                      alert("une erreur est survenue !");
                  }
              }
          },
          async updateTask() {
              const id = this.task.idTache;
              const url = this.task.typeTask;
              const data = this.task;
              const valider = window.confirm("Confirmer les modifications de cette tâche?");
  
              if (valider) {
                  try {
                      const response = await updateService.updateTask(url, id, data);
                      this.$emit('updateTask');
                      if(!response){
                          alert("Erreur lors de la modification !");
                      } 
                      else{
                          alert("Tâche modifiée avec succès");
                      }
                      await this.fetchTask();
                  } catch (error) {
                      console.error("Erreur lors de la mise à jour de la tâche :", error);
                      alert("Une erreur est survenue lors de la mise à jour de la tâche.");
                  }
              }
          },
          async createInvoice(){
              try{
              const data = this.task;
              const valider =  window.confirm("Confirmer la création de la facture");
  
              if(valider){
                  const response = await addService.addInvoice(data);
                  if(!response){
                      alert("Erreur lors de la creation de la facture !");
                  }else{
                      alert("Facture crée avec succès");
                  }
              }
          }catch(error){
              console.error(error.message)
          }
          },
          connectedUser() {
              const localUser = localStorage.getItem('user');
              this.username = JSON.parse(localUser).username;
              this.role = JSON.parse(localUser).role;
          },
          previous(){
              this.$emit('previous');
          },
  
          getTaskStatusClass(statut) {
              const taskStatusClasses = {
                  'Leads': 'bg-warning',
                  'Design': 'bg-primary',
                  'Approbation': 'bg-info',
                  'Impression': 'bg-secondary',
                  'Production' : 'bg-success',
                  'Installation' : 'bg-dark',
                  'Facturation' : 'bg-danger'
              }
              return taskStatusClasses[statut] || 'bg-dark'
          },
          getPriorityClass(priorite) {
              const priorityClasses = {
                  'Urgent': 'bg-danger',
                  'Normal': 'bg-success',
                  'Basse': 'bg-info'
              }
              return priorityClasses[priorite] || 'bg-dark'
          },
      },
  };
  </script>
  
  <style>
  body, .container {
      background: #f7f8fa !important;
      color : #000000
  }
  
  .container {
      padding-top: 2.5rem;
      padding-bottom: 2.5rem;
  }
  
  .table-head, .table-product {
      background: #fff;
  }
  
  .form-control:focus,
  .form-select:focus {
      outline: none;
      box-shadow: none;
  }
  
  .table-product {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 25px 0;
      box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      overflow: hidden;
      background: white;
  }
  
  .table-product td {
      padding: 18px 20px;
      border-bottom: 1px solid #f0f0f0;
  }
  
  .table-product td:first-child {
      font-weight: 500;
      color: #00050a;
      background-color: #f8fafc;
      width: 30%;
  }
  
  .table-product .form-control,
  .table-product .form-select {
      width: 100%;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      transition: all 0.3s ease;
  }
  
  .table-product .form-control:focus,
  .table-product .form-select:focus {
      outline: none;
      background-color: #f1f5f9;
  }
  
  .table-product .form-control:disabled,
  .table-product .form-select:disabled {
      opacity: 0.7;
      cursor: not-allowed;
  }
  
  .table-product textarea.form-control {
      min-height: 120px;
      resize: vertical;
  }
  
  .table-product::before {
      display: block;
      height: 4px;
      background: linear-gradient(to right, #000203, #010c14);
  }
  
  .table-product select.form-select {
      cursor: pointer;
      appearance: none;
      background-position: right 12px center;
      padding-right: 35px;
  }
  
  .table-product input[type="file"] {
      padding: 10px;
      border: 2px dashed #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
  }
  
  .table-product tr:hover td:first-child {
      background-color: #f1f5f9;
      color: #000000;
  }
  
  .table-head {
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      margin: 20px 0;
  }
  
  .table-head td {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
  }
  
  .table-head .form-control,
  .table-head .form-select {
      border: none;
      background: transparent;
      padding: 8px 0;
      width: 100%;
  }
  
  .table-head .form-control:focus,
  .table-head .form-select:focus {
      outline: none;
      background: #f8fafc;
  }
  
  .table-head .bi {
      font-size: 1.2rem;
      cursor: pointer;
  }
  
  .table-head .bi-trash:hover {
      color: #e74c3c;
  }
  
  
  .table-head .bi-receipt:hover{
      color : green;
  }
  .bi-box-arrow-left{
  font-size: 1.5rem;
  cursor: pointer;
  }
  
  .card {
    border-radius: 1rem;
  }
  .card-title {
    font-weight: 600;
  }
  .list-group-item {
    background: transparent;
    border: none;
    padding-left: 0;
    padding-right: 0;
  }
  .badge {
    font-size: 1em;
    vertical-align: middle;
  }
  
  </style>