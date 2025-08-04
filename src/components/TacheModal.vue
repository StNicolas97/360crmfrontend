<template>
  <div class="modal fade" id="modaltask" tabindex="-1" role="dialog" aria-labelledby="modaltask" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="employeModalLabel">Ajouter une tâche</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label for="travaux" class="form-label">Type de travail</label>
              <select class="form-select" id="travaux" v-model="formData.typeTravel" required>
                <option value="PPF">PPF</option>
                <option value="affichage">Affichage</option>
                <option value="lettrage">Lettrage</option>
                <option value="soustraitant">Sous-traitance</option>
                <option value="note">Note</option>
              </select>
            </div>

            <!-- Champs spécifiques pour PPF -->
            <div v-if="formData.typeTravel === 'PPF'">
              <div class="mb-3">
                <label for="titre" class="form-label">Couverture Choisie</label>
                <select class="form-select" id="titreTache" v-model="ppf.titre" required>
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
                  <option value="Réparation">Réparation</option>
                  <option value="courtoisie">Véhicule de courtoisie</option>
                  <option value="teintées">Vitres teintées</option>
                </select>
                <span class="" id="alertTitre"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="debut">Début</label>
                  <input type="date" value="01/01/2015" v-model="ppf.datedebut" class="form-control" id="dateDebut"
                    name="dateDebut" data-provide="datepicker" required>
                  <span class="icon icon-calendar"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="fin"></label>
                  <input type="time" class="form-control" v-model="ppf.heuredebut" name="heureDebut"
                    data-provide="datepicker">
                  <span class="icon icon-calendar"></span>
                </div>
                <span class="" id="alertDebut"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="debut">Date de ramassage prévu</label>
                  <input type="date" value="01/01/2015" v-model="ppf.datefin" class="form-control" name="dateFin"
                    data-provide="datepicker" required>
                  <span class="icon icon-calendar"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="fin"></label>
                  <input type="time" class="form-control" v-model="ppf.heurefin" name="heureFin"
                    data-provide="datepicker">
                  <span class="icon icon-calendar"></span>
                </div>
                <span class="" id="alertFin"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="client">Client</label>
                  <select v-model="ppf.idClient" class="form-control" id="client" name="client">
                    <option value="" disabled>Sélectionnez un client</option>
                    <option v-for="client in clients" :key="client.id" :value="client.id">
                      {{ client.nom }} {{ client.prenom }}
                    </option>
                  </select>
                  <span class=" bi bi-person-add" @click="addClient"></span>
                  <span id="alertClient"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="employe">Assignés à</label>
                  <select v-model="ppf.idAssigne" class="form-control" id="employe" name="employe">
                    <option value="" disabled>Sélectionnez un employé</option>
                    <option v-for="employe in employes" :key="employe.id" :value="employe.id">
                      {{ employe.nom }} {{ employe.prenom }}
                    </option>
                  </select>
                  <span id="alertAssign"></span>
                </div>
              </div>
              <div class="mb-3">
                <label for="vehicule" class="form-label">Véhicule (modèle/année)</label>
                <input type="text" class="form-control" id="vehicule" v-model="ppf.vehicule" required>
              </div>
              <div class="mb-3">
                <label for="vin" class="form-label">VIN #</label>
                <input type="text" class="form-control" id="vin" v-model="ppf.vin">
              </div>
              <div class="mb-3">
                <label for="text" class="form-label">Couleur</label>
                <input type="text" class="form-control" id="couleur" v-model="ppf.couleur">
              </div>
              <div class="mb-3">
                <label for="vin" class="form-label">Adresse</label>
                <input type="text" class="form-control" id="Adresse" v-model="ppf.adresse">
              </div>
              <div class="mb-3">
                <label for="typeProduits" class="form-label">Type de produits</label>
                <select class="form-select" id="typeProduits" v-model="ppf.produit">
                  <option value="standard"></option>
                  <option value="Ultimate">Xpel Ultimate Plus</option>
                  <option value="Stealth">Xpel Stealth</option>
                  <option value="Fusion">Xpel Fusion</option>
                  <option value="CS">Xpel Prime CS Black</option>
                  <option value="XR">Xpel Prime XR Black</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="teinteVitres" class="form-label">Teinte des vitres</label>
                <input type="text" class="form-control" id="teinteVitres" v-model="ppf.vitre">
              </div>
              <div class="mb-3">
                <label for="prix" class="form-label">Prix avant taxes</label>
                <input type="number" class="form-control" id="prix" v-model="ppf.prix" step="0.01">
                <span id="alertPrix"></span>
              </div>
              <div class="mb-3">
                <label for="financement" class="form-label">Financement</label>
                <select class="form-select" id="financement" v-model="ppf.financemnent">
                  <option value="Interessé">Interessé</option>
                  <option value="recu">A recu l'information</option>
                  <option value="Approuvé">Approuvé</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="vehiculeCourtoisie" class="form-label">Véhicule de courtoisie</label>
                <select class="form-select" id="vehiculeCourtoisie" v-model="ppf.courtoisie">
                  <option value="Ford Fusion #2">Ford Fusion #2</option>
                  <option value="Ford Fusion #3">Ford Fusion #3</option>
                  <option value="Ford Fusion #4">Ford Fusion #4</option>
                  <option value="Ford Fusion #5">Ford Fusion #5</option>
                  <option value="Ford Fusion #6">Ford Fusion #6</option>
                  <option value="Ford Fusion #7">Ford Fusion #7</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="pieceJointe" class="form-label">Pièce jointe</label>
                <input type="file" class="form-control" id="pieceJointe" @change="handleFileUpload">
              </div>
              <div class="mb-3">
                <label for="infoSupp" class="form-label">Informations supplémentaires</label>
                <textarea class="form-control" id="infoSupp" v-model="ppf.informations" rows="3"></textarea>
              </div>
            </div>

            <!-- Champs spécifiques pour Affichage -->
            <div v-if="formData.typeTravel === 'affichage'">
              <div class="mb-3">
                <label for="titreAffichage" class="form-label">Titre</label>
                <input type="text" name="titreAffichage" class="form-control" id="titreAffichage"
                  v-model="affichage.titre" required>
                <span id="alertTitre"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="dateDebutAffichage">Date commandé</label>
                  <input type="date" v-model="affichage.datedebut" class="form-control" name="dateDebutAffichage"
                    id="dateDebut" data-provide="datepicker" required>
                  <span class="icon icon-calendar"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="heureDebutAffichage">Heure Début</label>
                  <input type="time" class="form-control" v-model="affichage.heuredebut" name="heureDebutAffichage"
                    id="heureDebutAffichage" data-provide="datepicker">
                  <span class="icon icon-calendar"></span>
                </div>
                <span id="alertDebut"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="dateFinAffichage">Date de livraison</label>
                  <input type="date" v-model="affichage.datefin" class="form-control" name="dateFinAffichage"
                    id="dateFinAffichage" data-provide="datepicker" required>
                  <span class="icon icon-calendar"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="heureFinAffichage">Heure Fin</label>
                  <input type="time" class="form-control" v-model="affichage.heurefin" name="heureFinAffichage"
                    id="heureFinAffichage" data-provide="datepicker">
                  <span class="icon icon-calendar"></span>
                </div>
                <span id="alertFin"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="client">Client</label>
                  <select v-model="affichage.idClient" class="form-control" id="client" name="client">
                    <option value="" disabled>Sélectionnez un client</option>
                    <option v-for="client in clients" :key="client.id" :value="client.id">
                      {{ client.nom }} {{ client.prenom }}
                    </option>
                  </select>
                  <span id="alertClient"></span>
                  <span class=" bi bi-person-add" @click="addClient"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="employe">Assignés à</label>
                  <select v-model="affichage.idAssigne" class="form-control" id="employe" name="employe">
                    <option value="" disabled>Sélectionnez un employé</option>
                    <option v-for="employe in employes" :key="employe.id" :value="employe.id">
                      {{ employe.nom }} {{ employe.prenom }}
                    </option>
                  </select>
                  <span id="alertAssign"></span>
                </div>
              </div>
              <div class="mb-3">
                <label for="descriptionAffichage" class="form-label">Description</label>
                <textarea name="descriptionAffichage" class="form-control" rows="3" id="descriptionAffichage"
                  v-model="affichage.description"></textarea>
              </div>
              <fieldset class="form-group">
                <legend class="bg-light p-2">Impression</legend>
                <div class="mb-3">
                  <label for="quantiteAffichage" class="form-label">Quantité</label>
                  <input type="number" name="quantiteAffichage" class="form-control" id="quantiteAffichage"
                    v-model="affichage.quantite">
                </div>
                <div class="mb-3">
                  <label for="typePapierAffichage" class="form-label">Type de papier</label>
                  <input type="text" name="typePapierAffichage" class="form-control" id="typePapierAffichage"
                    v-model="affichage.typePapier">
                </div>
                <div class="mb-3">
                  <label for="typeLaminageAffichage" class="form-label">Type de Laminage</label>
                  <input type="text" name="typeLaminageAffichage" class="form-control" id="typeLaminageAffichage"
                    v-model="affichage.typeLaminage">
                </div>
                <div class="row mb-3">
                  <div class="input-with-icon col-md-6 ms-auto">
                    <label for="hauteurAffichage">Hauteur</label>
                    <input type="number" v-model="affichage.hauteur" class="form-control" name="hauteurAffichage"
                      id="hauteurAffichage">
                  </div>
                  <div class="input-with-icon col-md-6">
                    <label for="largeurAffichage">Largeur</label>
                    <input type="number" class="form-control" v-model="affichage.largeur" name="largeurAffichage"
                      id="largeurAffichage">
                  </div>
                </div>
                <div class="mb-3">
                  <label for="imprimanteAffichage" class="form-label">Imprimante</label>
                  <input type="text" name="imprimanteAffichage" class="form-control" id="imprimanteAffichage"
                    v-model="affichage.imprimante">
                </div>
              </fieldset>
              <fieldset class="form-group">
                <legend class="bg-light p-2">Finition</legend>
                <div class="mb-3">
                  <label for="typeMaterielAffichage" class="form-label">Type de Matériel</label>
                  <select class="form-select" name="typeMaterielAffichage" id="typeMaterielAffichage"
                    v-model="affichage.typeMateriel">
                    <option value="coroplast">Coroplast</option>
                    <option value="alupanel">Alupanel</option>
                    <option value="pvc foam">PVC Foam</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </fieldset>
              <div class="mb-3">
                <label for="quantiteOeilletAffichage" class="form-label">Quantité Oeillet</label>
                <input type="number" class="form-control" v-model="affichage.quantiteOeillet"
                  name="quantiteOeilletAffichage" id="quantiteOeilletAffichage">
              </div>
              <div class="mb-3">
                <label for="prixAffichage" class="form-label">Prix</label>
                <input type="number" name="prixAffichage" class="form-control" id="prixAffichage"
                  v-model="affichage.prix">
                <span id="alertPrix"></span>
              </div>
            </div>

            <!-- Champs spécifiques pour Lettrage -->
            <div v-if="formData.typeTravel === 'lettrage'">
              <div class="mb-3">
                <label for="titre" class="form-label">Titre</label>
                <input type="text" name="titre" class="form-control" id="titre" v-model="lettrage.titre" required>
                <span id="alertTitre"></span>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="debut">Début</label>
                  <br>
                  <input type="date" value="01/01/2015" v-model="lettrage.datedebut" class="form-control"
                    name="dateDebut" id="dateDebut" data-provide="datepicker" required>
                  <span class="icon icon-calendar"></span>
                  <span id="alertDebut"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="fin"></label>
                  <input type="time" class="form-control" v-model="lettrage.heuredebut" name="heureDebut"
                    data-provide="datepicker">
                  <span class="icon icon-calendar"></span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="debut">Date de ramassage prévu</label>
                  <input type="date" value="01/01/2015" v-model="lettrage.datefin" class="form-control" name="dateFin"
                    data-provide="datepicker" required>
                  <span class="icon icon-calendar"></span>
                  <span id="alertFin"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="fin"></label>
                  <input type="time" class="form-control" v-model="lettrage.heurefin" name="heureFin"
                    data-provide="datepicker">
                  <span class="icon icon-calendar"></span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="client">Client</label>
                  <select v-model="lettrage.idClient" class="form-control" id="client" name="client">
                    <option value="" disabled>Sélectionnez un client</option>
                    <option v-for="client in clients" :key="client.id" :value="client.id">
                      {{ client.nom }} {{ client.prenom }}
                    </option>
                  </select>
                  <span id="alertclient"></span>
                  <span class=" bi bi-person-add" @click="addClient"></span>
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="employe">Assignés à</label>
                  <select v-model="lettrage.idAssigne" class="form-control" id="employe" name="employe">
                    <option value="" disabled>Sélectionnez un employé</option>
                    <option v-for="employe in employes" :key="employe.id" :value="employe.id">
                      {{ employe.nom }} {{ employe.prenom }}
                    </option>
                  </select>
                  <span id="alertAssign"></span>
                </div>
              </div>
              <fieldset class="form-group ">
                <legend class="bg-light p-2">Travail</legend>
                <div class="mb-3">
                  <label for="modele" class="form-label">Modele</label>
                  <input type="text" name="modele" class="form-control" id="texte" v-model="lettrage.modele">
                </div>
                <div class="mb-3">
                  <label for="specs" class="form-label">Specs(Toit/WB/Boite)</label>
                  <input type="text" name="specs" class="form-control" id="specs" v-model="lettrage.specs">
                </div>
                <div class="mb-3">
                  <label for="annee" class="form-label">Année</label>
                  <input type="number" name="annee" class="form-control" id="annee" v-model="lettrage.annee">
                </div>
                <div class="mb-3">
                  <label for="couleur" class="form-label">Couleur</label>
                  <input type="texte" name="couleur" class="form-control" id="couleur" v-model="lettrage.couleur">
                </div>
              </fieldset>
              <fieldset class="form-group">
                <legend class="bg-light p-2">Impression</legend>
                <div class="mb-3">
                  <label for="description" class="form-label">Description</label>
                  <textarea name="description" class="form-control" rows="3" id="description"
                    v-model="lettrage.description"></textarea>
                </div>
                <div class="mb-3">
                  <label for="papier" class="form-label">Type de papier</label>
                  <input type="text" name="papier" class="form-control" id="papier" v-model="lettrage.typePapier">
                </div>
                <div class="mb-3">
                  <label for="quantite" class="form-label">Type de Laminage</label>
                  <input type="text" name="quantite" class="form-control" id="quantite" v-model="lettrage.typeLaminage">
                </div>
                <div class="mb-3">
                  <label for="decoupe" class="form-label">Decoupe</label>
                  <select class="form-select" name="decoupe" id="decoupe" v-model="lettrage.Decoupe">
                    <option value="oui">oui</option>
                    <option value="non">non</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="imprimante" class="form-label">Imprimante</label>
                  <input type="text" name="imprimante" class="form-control" id="imprimante"
                    v-model="lettrage.imprimante">
                </div>
              </fieldset>
              <div class="mb-3">
                <label for="prix" class="form-label">Prix</label>
                <input type="number" name="prix" class="form-control" id="prix" v-model="lettrage.prix">
                <span id="alertPrix"></span>
              </div>
            </div>

            <!-- Champs spécifique au sous-traitant -->
            <div v-if="formData.typeTravel === 'soustraitant'">
              <div class="mb-3">
                <label for="fournisseur" class="form-label">Titre</label>
                <input type="text" name="fournisseur" class="form-control" id="fournisseur" v-model="soustraitant.titre"
                  required>
                <span id="alertTitre"></span>
              </div>
              <!-- <div class="row mb-3">
                <div class="input-with-icon col-md-6 ms-auto">
                  <label for="largeur" class="form-label">Largeur</label>
                  <input type="number" name="largeur" class="form-control" id="largeur" v-model="soustraitant.largeur">
                </div>
                <div class="input-with-icon col-md-6">
                  <label for="hauteur" class="form-label">Hauteur</label>
                  <input type="number" name="hauteur" class="form-control" id="hauteur" v-model="soustraitant.hauteur">
                </div>
              </div> -->
              <div class="mb-3">
                <label for="quantite" class="form-label">Quantité</label>
                <input type="number" name="quantite" class="form-control" id="quantite" v-model="soustraitant.quantite">
              </div>
              <div class="mb-3">
                <label for="tacheAssigne" class="form-label">Tâche assignée</label>
                <input type="text" name="tacheAssigne" class="form-control" id="tacheAssigne"
                  v-model="soustraitant.tacheAssigne">
              </div>
              <div class="mb-3">
                <label for="sousTraitant" class="form-label">Sous-traitant</label>
                <input type="text" name="sousTraitant" class="form-control" id="sousTraitant"
                  v-model="soustraitant.sousTraitant">
              </div>
              <div class="mb-3">
                <label for="typePapier" class="form-label">Type de produit</label>
                <input type="text" name="typePapier" class="form-control" id="typePapier"
                  v-model="soustraitant.typePapier">
              </div>
              <div class="mb-3">
                <label for="dateEnvoieProduction" class="form-label">Date d'envoi en production</label>
                <input type="date" name="dateEnvoieProduction" class="form-control" id="dateEnvoieProduction"
                  v-model="soustraitant.dateEnvoieProduction">
              </div>
              <div class="mb-3">
                <label for="prix" class="form-label">Prix</label>
                <input type="number" name="prix" class="form-control" id="prix" v-model="soustraitant.prix" step="0.01">
                <span id="alertPrix"></span>
              </div>
            </div>

            <div v-if="formData.typeTravel === 'note'">
              <div class="mb-3">
                <label for="note" class="form-label">Note</label>
                <textarea name="note" class="form-control" rows="3" id="note" v-model="note.commentaire"></textarea>
                <span id="alertNote"></span>
                <div class="row mb-3">
                  <div class="input-with-icon col-md-6 ms-auto">
                    <label for="debut">Début</label>
                    <br>
                    <input type="date" value="01/01/2015" v-model="note.datedebut" class="form-control" name="dateDebut"
                      id="dateDebut" data-provide="datepicker" required>
                    <span class="icon icon-calendar"></span>
                    <span id="alertDebut"></span>
                  </div>
                  <div class="input-with-icon col-md-6 ms-auto">
                    <label for="debut">Date de fin</label>
                    <input type="date" value="01/01/2015" v-model="note.datefin" class="form-control" name="dateFin"
                      data-provide="datepicker" required>
                    <span class="icon icon-calendar"></span>
                    <span id="alertFin"></span>
                  </div>
                </div>
              </div>

            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
              <button type="submit" class="btn btn-danger" v-if="formData.typeTravel === 'PPF'"
                @click.prevent="handleNewPpf">Enregistrer</button>
              <button type="submit" class="btn btn-danger" v-else-if="formData.typeTravel === 'lettrage'"
                @click.prevent="handleNewLettrage">Enregistrer</button>
              <button type="submit" class="btn btn-danger" v-else-if="formData.typeTravel === 'affichage'"
                @click.prevent="handleNewAffichage">Enregistrer</button>
              <button type="submit" class="btn btn-danger" v-else-if="formData.typeTravel === 'soustraitant'"
                @click.prevent="">Enregistrer</button>
              <button type="submit" class="btn btn-danger" v-else-if="formData.typeTravel === 'note'"
                @click.prevent="handleNewNote">Enregistrer</button>

            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  <ClientModal />
</template>

<script>
import { addService } from '@/api/services/add.service'
import { getService } from '@/api/services/get.service'
import { authService } from '../api/services/auth.service'
import ClientModal from "../components/ClientModal.vue"
export default {
  name: 'TacheModal',
  components: {
    ClientModal
  },
  data() {
    return {
      clients: [],
      employes: [],
      formData: {
        typeTravel: 'PPF',
      },
      ppf: {
        titre: '',
        typeTask: 'PPF',
        datedebut: null,
        heuredebut: "07:30",
        datefin: null,
        heurefin: null,
        statut: '',
        priorité: '',
        idClient: null,
        idAssigne: null,
        vehicule: '',
        vin: '',
        couleur: '',
        adresse: '',
        produit: '',
        vitre: '',
        prix: null,
        financemnent: '',
        courtoisie: '',
        fichier: '',
        informations: '',
      },
      lettrage: {
        titre: '',
        typeTask: 'lettrage',
        datedebut: null,
        heuredebut: "07:30",
        datefin: null,
        heurefin: null,
        statut: '',
        priorité: '',
        idClient: null,
        idAssigne: null,
        modele: '',
        specs: '',
        annee: null,
        couleur: '',
        quantite: null,
        typePapier: '',
        typeLaminage: '',
        Decoupe: '',
        imprimante: '',
        description: '',
        prix: null,
      },
      affichage: {
        titre: '',
        typeTask: 'affichage',
        datedebut: null,
        heuredebut: "07:30",
        datefin: null,
        heurefin: null,
        statut: '',
        priorité: '',
        idClient: null,
        idAssigne: null,
        quantite: null,
        typePapier: '',
        typeLaminage: '',
        decoupe: '',
        imprimante: '',
        typeMateriel: '',
        hauteur: null,
        largeur: null,
        quantiteOeillet: null,
        prix: null,
        fichier: '',
        description: '',
      },
      soustraitant: {
        titre: '',
        typeTask: 'soustraitance',
        largeur: null,
        hauteur: null,
        quantite: null,
        tacheAssigne: null,
        sousTraitant: null,
        typePapier: '',
        dateEnvoieProduction: null,
        prix: null

      },
      note: {
        commentaire: '',
        datedebut: null,
        datefin: null
      }
    }
  },
  async mounted() {
    await this.fetchUsers();
    await this.fetchclients();
    this.checkDateClick()
    const modal = document.getElementById('modalclient');
    if (modal) {
      modal.addEventListener('hidden.bs.modal', this.fetchclients);
    }
  },
  beforeUnmount() {
    const modal = document.getElementById('modalclient');
    if (modal) {
      modal.removeEventListener('hidden.bs.modal', this.fetchclients);
    }
  },
  props: {
    date: {
      type: Date
    }
  },
  methods: {
    afterSubmit() {
      this.$emit('submit');
      const modal = document.getElementById('modaltask')
      const bootstrapModal = bootstrap.Modal.getInstance(modal)
      bootstrapModal.hide()
    },
    // Fonction utilitaire pour comparer les dates sans l'heure
    compareDatesOnly(date1, date2) {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      // Réinitialiser l'heure à 00:00:00 pour comparer uniquement les dates
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      
      return d1.getTime() - d2.getTime();
    },
    treatData(obj) {
      let isValid = true;
      if (!obj.titre) {
        const alert = document.getElementById("alertTitre");
        alert.innerText = "Veuillez entrer un titre";
        alert.style.color = 'red';
        isValid = false;
      } else {
        const alert = document.getElementById("alertTitre");
        alert.innerText = "";
      }

      if (!obj.datedebut) {
        const alert = document.getElementById("alertDebut");
        alert.innerText = "Veuillez entrer une date";
        alert.style.color = 'red';
        isValid = false;
      } else {
        const alert = document.getElementById("alertDebut");
        alert.innerText = "";
      }

      /*if (!obj.datefin) {
        const alert = document.getElementById("alertFin");
        alert.innerText = "Veuillez entrer une date";
        alert.style.color = 'red';
        isValid = false;
      } else {
        const alert = document.getElementById("alertFin");
        alert.innerText = "";
      }*/

      if (obj.datedebut > obj.datefin) {
        alert("la date de début doit être inférieure à la date de fin")
        isValid = false;
      }

      //Section traitement Date 
        const today = new Date();
        const dateDebut = new Date(obj.datedebut);
        const dateFin = obj.datefin ? new Date(obj.datefin) : obj.datefin;

        // Vérifier si les dates sont valides
        if (isNaN(dateDebut.getTime())) {
          alert("La date de début n'est pas valide");
          isValid = false;
          return;
        }

        // Vérifier que la date de début n'est pas antérieure à aujourd'hui
        // if (this.compareDatesOnly(dateDebut, today) < 0) {
        //   alert("La date de début ne peut pas être antérieure à aujourd'hui");
        //   isValid = false;
        // }

        // Vérifier que la date de fin n'est pas antérieure à aujourd'hui
        if(dateFin){
          console.log(dateFin, "je ne suis pas null!");
              if (isNaN(dateFin.getTime())) {
              alert("La date de fin n'est pas valide");
              isValid = false;
              return;
            }
              if (this.compareDatesOnly(dateFin, today) < 0) {
              alert("La date de fin ne peut pas être antérieure à aujourd'hui");
              isValid = false;
            }
           // Vérifier que la date de fin n'est pas antérieure à la date de début
            if (this.compareDatesOnly(dateFin, dateDebut) < 0) {
              alert("La date de fin ne peut pas être antérieure à la date de début");
              isValid = false;
            }
        }

      if (!obj.idClient) {
        const alert = document.getElementById("alertClient");
        alert.innerText = "Veuillez selectionner un client"
        alert.style.color = 'red';
        isValid = false;
      } else {
        const alert = document.getElementById("alertClient");
        alert.innerText = "";
      }

      if (!obj.idAssigne) {
        const alert = document.getElementById("alertAssign");
        alert.innerText = "Veuillez selectionner un employé";
        alert.style.color = 'red';
        isValid = false;
      } else {
        const alert = document.getElementById("alertAssign");
        alert.innerText = "";
      }

      if (obj.prix) {
        if (isNaN(obj.prix)) {
          const alert = document.getElementById("alertPrix");
          alert.innerText = "Veuillez entrer une valeur correcte";
          alert.style.color = 'red';
          isValid = false;
        }
      }
      return isValid;
    },
    checkDateClick() {
      if (this.date) {
        document.getElementById("dateDebut").value = this.date;
      }
    },
    async handleNewPpf() {
      try {
        const verif = this.treatData(this.ppf);
        if (verif) {
          const ppf = this.ppf;
          const response = await addService.addTask(ppf);
          if (response) alert("Tâche crée avec succès !")
          else alert("Erreur lors de la création de la tâche !")
          this.afterSubmit();
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout", error);
      }

    },

    async handleNewAffichage() {
      try {
        const verif = this.treatData(this.affichage);
        if (verif) {
          const affichage = this.affichage;
          const response = await addService.addTask(affichage);
          if (response) alert("Tâche crée avec succès !")
          else alert("Erreur lors de la création de la tâche !")
          this.afterSubmit()
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout", error);
        alert("Une erreur est survenue lors de l'ajout de la tâche");
      }
    },

    async handleNewLettrage() {
      try {
        const verif = this.treatData(this.lettrage);
        if (verif) {
          const lettrage = this.lettrage;
          const response = await addService.addTask(lettrage);
          if (response) alert("Tâche crée avec succès !")
          else alert("Erreur lors de la création de la tâche !")
          this.afterSubmit()
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout", error);
      }
    },
    async handleSoustraitance() {
      try {
        const soustraitance = this.soustraitant;
        const response = await addService.addTask(soustraitance);
        if (response) alert("Tâche crée avec succès !")
        else alert("Erreur lors de la création de la tâche !")
        this.afterSubmit();
      } catch (error) {
        console.error("Erreur lors de l'ajout", error);
      }
    },
    async handleNewNote() {
      try {
        const note = this.note;
        const response = await addService.addNote(note);
        if (response) alert("Note crée avec succès !")
        else alert("Erreur lors de la création de la note !")
        this.afterSubmit();
      } catch (error) {
        console.error("Erreur lors de l'ajout", error);
      }
    },
    async fetchUsers() {
      try {
        const response = await authService.getProfile();
        this.employes = response.data;
      } catch (error) {
        this.error = "Erreur lors de la récupération des utilisateurs";
        console.error(error);
      }
    },

    async fetchclients() {
      try {
        const response = await getService.getClient();
        this.clients = response.data;
      } catch (error) {
        this.error = "Erreur lors de la récupération des utilisateurs";
        console.error(error);
      }
    },
    addClient() {
      const modal = document.getElementById('modalclient');
      const modalBoostrap = new bootstrap.Modal(modal);
      modal.style.zIndex = '10000';
      modalBoostrap.show();
    },
    handleFileUpload(event) {
      this.formData.pieceJointe = event.target.files[0]
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

.form-control,
.form-select {
  border: none;
  background: transparent;
  border-bottom: 1px solid #e0e0e0;
  border-radius: 0;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  box-shadow: none;
  border-color: #3498db;
  background: #f8fafc;
}

.form-control:hover,
.form-select:hover {
  background: #f8fafc;
}

/* Style pour les inputs de type date et time */
input[type="date"],
input[type="time"] {
  border: none;
  background: transparent;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
}

input[type="date"]:focus,
input[type="time"]:focus {
  box-shadow: none;
  border-color: #3498db;
  background: #f8fafc;
}

/* Style pour les textarea */
textarea.form-control {
  border: none;
  background: transparent;
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
  min-height: 100px;
}

textarea.form-control:focus {
  box-shadow: none;
  border-color: #3498db;
  background: #f8fafc;
}

/* Style pour les labels */
.form-label {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

/* Style pour les groupes de champs */
.mb-3 {
  margin-bottom: 1.5rem !important;
}

/* Style pour les champs avec icônes */
.input-with-icon {
  position: relative;
}

.input-with-icon .icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}
</style>