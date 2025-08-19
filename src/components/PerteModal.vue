<template>
      <div class="modal fade" id="perteModal" tabindex="-1" role="dialog" aria-labelledby="perteModal" aria-hidden="true">

        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="perteModalLabel">Nouvelle perte</h5>
              <button
                type="button"
                class="close"
                data-dismiss="modal"
                aria-label="Fermer"
                @click="closeModal"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
  
            <form @submit.prevent="submitPerte">
              <div class="modal-body">
                <!-- Type de vinyle -->
                <div class="form-group">
                  <label for="vinyle">Type de vinyle</label>
                  <input
                    type="text"
                    id="vinyle"
                    class="form-control"
                    v-model="perte.typeVinyle"
                  />
                </div>
  
                <!-- Type de laminage -->
                <div class="form-group">
                  <label for="laminage">Type de laminage</label>
                  <input
                    type="text"
                    id="laminage"
                    class="form-control"
                    v-model="perte.typeLaminage"
                  />
                </div>
  
                <!-- Dimensions -->
                <div class="form-group">
                  <label for="dimensions">Dimensions</label>
                  <input
                    type="text"
                    id="dimensions"
                    class="form-control"
                    v-model="perte.dimensions"
                  />
                </div>

                <!-- Dimensions -->
              <div class="form-group">
                  <label for="cout">Coût</label>
                  <input
                    type="number"
                    id="cout"
                    class="form-control"
                    v-model="perte.cout"
                  />
                </div>
  
                <!-- Raison -->
                <div class="form-group">
                  <label for="raison">Raison</label>
                  <textarea
                    id="raison"
                    class="form-control"
                    v-model="perte.raison"
                  ></textarea>
                </div>
              </div>

  
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-dismiss="modal"
                  @click="closeModal"
                >
                  Fermer
                </button>
                <button type="submit" class="btn btn-danger">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  </template>
  
  <script>
  import { addService } from '@/api/services/add.service';
  
  export default {
    name: "PerteModal",
    data() {
      return {
        perte: {
          typeVinyle: "",
          typeLaminage: "",
          dimensions: "",
          raison: "",
          idAssigne: null,
          cout : null,
        },
      };
    },
    mounted(){
        this.perte.idAssigne = JSON.parse(localStorage.getItem("user"))?.id;
    },
    methods: {
      async submitPerte() {
        try {
            if(!this.perte.idAssigne)this.perte.idAssigne = JSON.parse(localStorage.getItem("user"))?.id;
          const response = await addService.addPerte(this.perte);
          if(!response) throw new Error();
          alert("perte ajoutée avec succès !")
          this.$emit('submitPerte')
          this.closeModal();
        } catch (error) {
          console.error("Erreur lors de l'enregistrement :", error);
          alert("Impossible d'enregistrer la perte.");
        }
      },  
      closeModal(){
        const modal = document.getElementById('perteModal')
        const bootstrapModal = bootstrap.Modal.getInstance(modal)
        bootstrapModal.hide()
        console.log(this.idAssigne)
      }
    },
  };
  </script>
  