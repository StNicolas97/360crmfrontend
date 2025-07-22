<template>
  <div class="kanban-bg py-4">
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4 parent">
          <i class="bi bi-folder-plus me-2" data-bs-toggle="modal" data-bs-target="#modaltask"></i>
          <div class="d-flex align-items-center gap-2">
            <div class="text-muted small">
              Total: {{ taches.length }} tâches
            </div>
            <button class="btn btn-outline-secondary btn-sm" @click="refreshTasks" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise" :class="{ 'spin': isLoading }"></i>
            </button>
          </div>
      </div>
      
      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>

      <!-- Message d'erreur -->
      <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = null"></button>
      </div>

      <div class="row parentkanban g-3">
        <div
          v-for="col in columns"
          :key="col.key"
          class="col-12 col-sm-6 col-md-4 col-lg-2 col-xl-1"
        >
          <div
            :class="['kanban-column', col.bgClass, { 'drag-over': dragOverColumn === col.key }]"
            @dragover.prevent="handleDragOver($event, col.key)"
            @dragenter.prevent="handleDragEnter(col.key)"
            @dragleave="handleDragLeave"
            @drop="onDrop($event, col.key)"
          >
            <div class="kanban-column-header d-flex align-items-center justify-content-between mb-3">
              <span class="fw-bold fs-6">{{ col.title }}</span>
              <span :class="['badge', col.badgeClass]">{{ getStatut(col.key).length }}</span>
            </div>
            <div class="kanban-tasks">
              <transition-group name="task-transition" tag="div">
                <div
                  v-for="tache in getStatut(col.key)"
                  :key="tache.id || tache.idTache"
                  class="kanban-task card mb-2"
                  :class="{ 'dragging': draggedTask && (draggedTask.id === tache.id || draggedTask.idTache === tache.idTache) }"
                  draggable="true"
                  @dragstart="startDrag($event, tache)"
                  @dragend="endDrag"
                >
                  <div class="card-body card-body-kanban p-2">
                    <div class="d-flex align-items-start mb-2">
                      <div class="kanban-task-avatar me-2" :class="getPriorityClass(tache.priorite)">
                          <i class="bi bi-folder2"></i>
                      </div>
                      <div class="flex-grow-1 min-width-0">
                        <div class="fw-bold fs-6 text-truncate title" :title="tache.titre">{{ tache.titre }}</div>
                        <div class="text-muted small text-truncate" v-if="tache.datefin">
                          {{ 'À livrer le : ' + formatDate(tache.datefin) }}
                        </div>
                        <div class="text-muted small text-truncate" v-if="tache.client">
                          <i class="bi bi-person-fill me-1"></i>{{ tache.client }}
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2 gap-1">
                      <button 
                        class="btn btn-outline-primary btn-sm flex-shrink-0" 
                        @click="sendEmit(tache.typeTask, tache.id || tache.idTache)"
                        :title="'Voir les détails de la tâche'"
                      >
                        <i class="bi bi-eye"></i>
                      </button>
                      <div class="d-flex gap-1 align-items-center flex-shrink-0">
                        <span class="badge bg-light text-dark border small text-truncate" style="max-width: 80px;">{{ tache.typeTask }}</span>
                        <span v-if="tache.priorite" 
                              class="priority-indicator flex-shrink-0" 
                              :class="getPriorityIndicator(tache.priorite)"
                              :title="'Priorité: ' + tache.priorite">
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </transition-group>
              
              <div v-if="getStatut(col.key).length === 0" class="text-center text-muted py-3 empty-state">
                <i class="bi bi-inbox fs-3"></i><br>
                <span class="small">Aucune tâche</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <TacheModal></TacheModal>
</template>

<script>
import { getService } from '@/api/services/get.service';
import { updateService } from '@/api/services/update.service';
import TacheModal from './TacheModal.vue';

export default {
  components : {
    TacheModal
  },
  data() {
    return {
      taches: [],
      columns: [
        { key: "Leads", title: "Leads", bgClass: "kanban-col-leads", badgeClass: "bg-warning text-dark" },
        { key: "Design", title: "Design", bgClass: "kanban-col-design", badgeClass: "bg-primary" },
        { key: "Approbation", title: "Approbation", bgClass: "kanban-col-approbation", badgeClass: "bg-info" },
        { key: "Impression", title: "Impression", bgClass: "kanban-col-impression", badgeClass: "bg-secondary" },
        { key: "Production", title: "Production", bgClass: "kanban-col-production", badgeClass: "bg-success" },
        { key: "Installation", title: "Installation", bgClass: "kanban-col-installation", badgeClass: "bg-dark" },
        { key: "Facturation", title: "Facturation", bgClass: "kanban-col-facturation", badgeClass: "bg-danger" }
      ],
      error: null,
      isLoading: false,
      draggedTask: null,
      dragOverColumn: null,
    };
  },
  methods: {
    getStatut(statut) {
      return this.taches.filter(item => item.statut === statut);
    },
    
    startDrag(event, tache) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('itemID', tache.idTache || tache.id);
      this.draggedTask = tache;
      
      // Ajouter une classe pour indiquer qu'un élément est en cours de déplacement
      document.body.classList.add('dragging-active');
    },
    
    endDrag() {
      this.draggedTask = null;
      this.dragOverColumn = null;
      document.body.classList.remove('dragging-active');
    },
    
    handleDragOver(event, column) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    
    handleDragEnter(column) {
      this.dragOverColumn = column;
    },
    
    handleDragLeave() {
      // Petit délai pour éviter le flickering
      setTimeout(() => {
        this.dragOverColumn = null;
      }, 50);
    },
    
    async onDrop(event, statut) {
      event.preventDefault();
      this.dragOverColumn = null;
      
      const itemID = event.dataTransfer.getData('itemID');
      const item = this.taches.find(item => (item.idTache || item.id) == itemID);
      
      if (!item) {
        this.showError("Tâche non trouvée");
        return;
      }
      
      if (item.statut === statut) {
        return;
      }
      
      const valider = window.confirm(`Voulez-vous déplacer "${item.titre}" vers "${statut}"?`);
      if (valider) {
        const oldStatut = item.statut;
        item.statut = statut;
        
        try {
          this.isLoading = true;
          const response = await getService.getTaskId("tache", item.idTache);
          const data = response.data;
          const sendData = { ...data, statut: statut };
          
          await updateService.updateMainTask(item.idTache, sendData);
          
          this.showSuccess(`Tâche déplacée vers ${statut}`);
          
        } catch (error) {
          item.statut = oldStatut;
          this.showError("Erreur lors de la mise à jour de la tâche");
          console.error("Erreur lors de la mise à jour de la tâche:", error);
        } finally {
          this.isLoading = false;
        }
      }
      
      this.endDrag();
    },
    
    async fetchTask() {
      try {
        this.isLoading = true;
        this.error = null;
        this.taches = [];
        
        const [ppfResponse, affichageResponse, lettrageResponse, soustraitanceResponse] = await Promise.all([
          getService.getPpf(),
          getService.getAffichage(),
          getService.getLettrage(),
          getService.getSoustraitance()
        ]);
        
        const allTasks = [
          ...ppfResponse.data,
          ...affichageResponse.data,
          ...lettrageResponse.data,
          ...soustraitanceResponse.data
        ];
        
        this.taches = allTasks;
        
      } catch (error) {
        this.showError("Erreur lors de la récupération des tâches");
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    
    async refreshTasks() {
      await this.fetchTask();
    },
    
    sendEmit(typeTask, id) {
      this.$emit('view', typeTask, id);
    },
    
    getPriorityClass(priorite) {
      const priorityClasses = {
        'Urgent': 'bg-danger',
        'Normal': 'bg-light',
        'Basse': 'bg-light'
      };
      return priorityClasses[priorite] || 'bg-secondary';
    },
    
    getPriorityIndicator(priorite) {
      const priorityIndicators = {
        'Urgent': 'priority-urgent',
        'Normal': 'priority-normal',
        'Basse': 'priority-low'
      };
      return priorityIndicators[priorite] || 'priority-normal';
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      } catch (error) {
        return dateString;
      }
    },
    
    showError(message) {
      this.error = message;
      setTimeout(() => {
        this.error = null;
      }, 5000);
    },
    
    showSuccess(message) {
      //console.log('Succès:', message);
    }
  },
  
  mounted() {
    this.fetchTask();
  }
};
</script>

<style>
.kanban-bg {
  background: linear-gradient(120deg, #f7f8fa 60%, #e0e7ef 100%);
  min-height: 100vh;
}

.kanban-column {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(44, 62, 80, 0.08);
  padding: 1rem 0.75rem;
  min-height: 350px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.kanban-column.drag-over {
  background: #f8f9ff;
  box-shadow: 0 4px 20px 0 rgba(13, 110, 253, 0.15);
  border: 2px dashed #0d6efd;
}

/* Couleurs spécifiques pour chaque colonne */
.kanban-col-leads { border-top: 4px solid #ffc107; }
.kanban-col-design { border-top: 4px solid #0d6efd; }
.kanban-col-approbation { border-top: 4px solid #0dcaf0; }
.kanban-col-impression { border-top: 4px solid #6c757d; }
.kanban-col-production { border-top: 4px solid #198754; }
.kanban-col-installation { border-top: 4px solid #212529; }
.kanban-col-facturation { border-top: 4px solid #dc3545; }

.kanban-column-header {
  border-bottom: 1px solid #e0e3e7;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.kanban-task {
  border: none;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(44, 62, 80, 0.07);
  background: #f8fafc;
  transition: all 0.3s ease;
  cursor: grab;
}

.kanban-task:hover {
  background: #eaf1fb;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.13);
  transform: translateY(-1px);
}

.kanban-task.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
}

.kanban-task:active {
  cursor: grabbing;
}

.kanban-task-avatar {
  width: 28px;
  height: 28px;
  background: #e0e7ef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.bi-folder-plus {
  font-size: 1.3rem;
  cursor: pointer;
  color: #0d6efd;
  transition: color 0.2s ease;
}

.bi-folder-plus:hover {
  color: #0b5ed7;
}


.card-body-kanban::-webkit-scrollbar {
  display: none;
}

/* Classe utilitaire pour éviter le débordement */
.min-width-0 {
  min-width: 0;
}

/* Amélioration de la gestion du texte */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-state {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.priority-urgent {
  background-color: #dc3545;
}

.priority-normal {
  background-color: #ffc107;
}

.priority-low {
  background-color: #28a745;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Animations pour les transitions */
.task-transition-enter-active, .task-transition-leave-active {
  transition: all 0.3s ease;
}

.task-transition-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-transition-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-transition-move {
  transition: transform 0.3s ease;
}

/* Indicateur global de drag */
.dragging-active .kanban-column {
  transition: background-color 0.2s ease;
}

.dragging-active .kanban-column:not(.drag-over) {
  background-color: #fafafa;
}

@media (min-width : 1280px){
  .parentkanban{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-evenly;
    align-content: flex-start;
    align-items: flex-start;
    gap: 1%;
    margin: auto 0%;
    position: relative;
    right: 20px;
  }

  .kanban-column {
    flex-grow: 4;
    flex-shrink: 1;
    flex-basis: 20%;
    min-width: 150px;   
  }

  .title{
    font-size: 12px;
  }
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .kanban-column {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .kanban-column {
    min-height: 250px;
  }
  
  .kanban-task {
    margin-bottom: 0.5rem;
  }
  
  .parentkanban {
    gap: 0.5rem;
  }
}
</style>