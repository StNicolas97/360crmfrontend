<template>
  <div class="d-flex page bg-dark">

    <!-- Section Barre de navigation -->
    <div class="d-flex flex-column flex-shrink-2 p-3 bg-dark sidebar" 
    :class="{'sidebar-mobile': isMobile, 'sidebar-open': isSidebarOpen, 'sidebar-closed': !isSidebarOpen && isMobile}">
      <a href="/" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none justify-content-center">
        <img class="fs-4 img-fluid" src="../assets/Logo 360 AutoWrap_Blanc.png" :style="logoStyle">
      </a>
      <hr class="text-white">
      <ul class="nav nav-pills flex-column mb-auto" @click="clearnav()">
        <li class="nav-item">
          <a href="#" @click.prevent="currentSection = 'dashboard';isSidebarOpen = false" class="nav-link d-flex justify-content-center align-items-center"
            :class="{ 'active': currentSection === 'dashboard' }"
            @mouseenter="hovered = 'dashboard'" @mouseleave="hovered = null">
            <i class="bi bi-house-door" :title="'Dashboard'"></i>
            <span v-if="isSidebarOpen === true" class="text-center mx-2">Dashboard</span>
          </a>
        </li>
        <li>
          <a href="#" @click.prevent="currentSection = 'calendrier';isSidebarOpen = false" class="nav-link d-flex justify-content-center align-items-center text-white"
            :class="{ 'active': currentSection === 'calendrier' }"
            @mouseenter="hovered = 'calendrier'" @mouseleave="hovered = null">
            <i class="bi bi-calendar-range" :title="'Calendrier'"></i>
            <span v-if="isSidebarOpen === true" class="text-center mx-2">Calendrier</span>
          </a>
        </li>
        <li>
          <a href="#" @click.prevent="currentSection = 'table';isSidebarOpen = false" class="nav-link d-flex justify-content-center align-items-center text-white"
            :class="{ 'active': currentSection === 'table' }"
            @mouseenter="hovered = 'table'" @mouseleave="hovered = null">
            <i class="bi bi-table" :title="'Tableau'"></i>
            <span v-if="isSidebarOpen === true" class="text-center mx-2">Tableau</span>
          </a>
        </li>
        <li>
          <a href="#" @click.prevent="currentSection = 'pertes'; fetchPerte(); isSidebarOpen = false"
            class="nav-link d-flex justify-content-center align-items-center text-white"
            :class="{ 'active': currentSection === 'pertes' }" @mouseenter="hovered = 'pertes'"
            @mouseleave="hovered = null">
            <i class="bi bi-archive" :title="'pertes'"></i>
            <span v-if="isSidebarOpen === true" class="text-center mx-2">Pertes</span>
          </a>
        </li>
      </ul>
      <hr class="text-white">
      <div class="dropdown mb-4 d-flex justify-content-center" v-if="!isMobile">
        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle justify-content-center flex-shrink-1" id="dropdownUser1"
          data-bs-toggle="dropdown" aria-expanded="false">
          <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2 img-fluid">
        </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          <li><a class="dropdown-item" href="#" @click.prevent="changeSectionProfil">Profil</a></li>
          <li>
            <hr class="dropdown-divider">
          </li>
          <li><a class="dropdown-item" href="#" @click="logout">Déconnexion</a></li>
        </ul>
      </div>
    </div>

        <!-- Navbar mobile/tablette -->
        <nav class="mobile-navbar d-md-none">
          <button
            class="btn btn-hamburger"
            @click="isSidebarOpen = !isSidebarOpen"
            aria-label="Ouvrir le menu">
            <i class="bi bi-list"></i>
          </button>
          <span class="navbar-title"><img src="../assets/Logo 360 AutoWrap_Blanc.png" alt="" class="img-fluid"
            style="width: 30%;position : relative; left: 30%;"></span>
          <div class="dropdown d-flex justify-content-center" v-if="isMobile">
            <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle justify-content-center flex-shrink-1" id="dropdownUser1"
              data-bs-toggle="dropdown" aria-expanded="false">
              <img src="https://github.com/mdo.png" alt="" class="rounded-circle me-2 img-fluid" style="width: 70%;position : relative; left: 30%;">
            </a>
            <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
              <li><a class="dropdown-item" href="#" @click.prevent="changeSectionProfil">Profil</a></li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li><a class="dropdown-item" href="#" @click="logout">Déconnexion</a></li>
            </ul>
          </div>
        </nav>

    <!-- Contenu principal -->
    <main class="flex-grow-1 p-3 main-content" @click="closeSideBar">  
      <section v-if="currentSection === 'dashboard'" class="section">
        <div class="dashboard-header mb-4">
          <h2 class="dashboard-title">
            <i class="bi bi-list-task me-2"></i>
            Mes Tâches
          </h2>
          <div class="dashboard-stats">
            <div class="stat-item">
              <span class="stat-number">{{ taches.length }}</span>
              <span class="stat-label">Total</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ tachesUrgentes }}</span>
              <span class="stat-label">Urgentes</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ tachesEnCours }}</span>
              <span class="stat-label">En cours</span>
            </div>
            <div class="stat-item stat-retard">
              <span class="stat-number">{{ nbTachesEnRetard }}</span>
              <span class="stat-label">En retard</span>
            </div>
          </div>
        </div>

        <!-- Contrôles de filtrage et recherche -->
        <div class="controls-section mb-4">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="search-container">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  class="form-control search-input" 
                  v-model="searchQueryTaches"
                  placeholder="Rechercher une tâche..."
                  @input="filterTaches"
                >
                <button v-if="searchQueryTaches" @click="clearSearch" class="btn-clear">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select filter-select" v-model="selectedPriorityFilter" @change="filterTaches">
                <option value="">Toutes les priorités</option>
                <option value="Urgent">Urgent</option>
                <option value="Normal">Normal</option>
                <option value="Bas">Bas</option>
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select filter-select" v-model="selectedStatusFilter" @change="filterTaches">
                <option value="">Tous les statuts</option>
                <option value="Leads">Leads</option>
                <option value="Design">Design</option>
                <option value="Approbation">Approbation</option>
                <option value="Impression">Impression</option>
                <option value="Production">Production</option>
                <option value="Installation">Installation</option>
                <option value="Facturation">Facturation</option>
                <option value="Termine">Termine</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tableau  -->
        <div class="table-container">
          <div class="table-responsive">
            <table class="table table-modern">
              <thead>
                <tr>
                  <th @click="sortBy('id')" class="sortable">
                    <div class="th-content">
                      ID
                      <i class="bi bi-arrow-down-up sort-icon"></i>
                    </div>
                  </th>
                  <th @click="sortBy('titre')" class="sortable">
                    <div class="th-content">
                      Type
                      <i class="bi bi-arrow-down-up sort-icon"></i>
                    </div>
                  </th>
                  <th @click="sortBy('datefin')" class="sortable">
                    <div class="th-content">
                      Date d'échéance
                      <i class="bi bi-arrow-down-up sort-icon"></i>
                    </div>
                  </th>
                  <th @click="sortBy('priorite')" class="sortable">
                    <div class="th-content">
                      Priorité
                      <i class="bi bi-arrow-down-up sort-icon"></i>
                    </div>
                  </th>
                  <th @click="sortBy('statut')" class="sortable">
                    <div class="th-content">
                      Statut
                      <i class="bi bi-arrow-down-up sort-icon"></i>
                    </div>
                  </th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tache in paginatedTaches" :key="tache.idTache" 
                    class="table-row" 
                    @click="selectRow(tache)"
                    :class="{ 'selected': selectedTask?.id === tache.id }" 
                    @dblclick="editTask(tache.typeTask, getTaskRealId(tache))">
                  <td>
                    <span class="task-id">#{{ tache.idTache }}</span>
                  </td>
                  <td>
                    <div class="task-title">
                      <i :class="getTaskIcon(tache.typeTask)" class="me-2"></i>
                      {{ tache.titre }}
                    </div>
                  </td>
                  <td>
                    <div class="date-container">
                      <span class="date-text">{{ formatDate(tache.datefin) }}</span>
                      <span v-if="isOverdue(tache.datefin, tache.statut)" class="overdue-badge">
                        <i class="bi bi-exclamation-triangle"></i>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span :class="'badge priority-badge ' + getPriorityClass(tache.priorite)">
                      <i :class="getPriorityIcon(tache.priorite)" class="me-1"></i>
                      {{ tache.priorite }}
                    </span>
                  </td>
                  <td>
                    <span :class="'badge status-badge ' + getTaskStatusClass(tache.statut)">
                      <div class="status-indicator"></div>
                      {{ tache.statut }}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <button 
                        @click="editTask(tache.typeTask, getTaskRealId(tache))"
                        @touchstart="editTask(tache.typeTask, getTaskRealId(tache))"
                        class="btn btn-action btn-view"
                        title="Voir les détails">
                        <i class="bi bi-eye"></i>
                      </button>
                      <!-- <button 
                        @click.stop="quickEdit(tache)"
                        class="btn btn-action btn-edit"
                        title="Modification rapide">
                        <i class="bi bi-pencil"></i>
                      </button> -->
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Message si aucune tâche -->
            <div v-if="filteredTaches.length === 0" class="no-data">
              <i class="bi bi-inbox"></i>
              <p>Aucune tâche trouvée</p>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-container" v-if="totalPages > 1">
            <nav>
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" @click.prevent="changePage(currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </a>
                </li>
                <li class="page-item" 
                    v-for="page in visiblePages" 
                    :key="page"
                    :class="{ active: page === currentPage }">
                  <a class="page-link" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" @click.prevent="changePage(currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </a>
                </li>
              </ul>
            </nav>
            <div class="pagination-info">
              Affichage {{ ((currentPage - 1) * itemsPerPage) + 1 }} à {{ Math.min(currentPage * itemsPerPage, filteredTaches.length) }} sur {{ filteredTaches.length }} tâches
            </div>
          </div>
        </div>
      </section>

      <!-- Section pertes -->
      <section v-if="currentSection === 'pertes'" class="section">
        <h2 class="section-title">Pertes</h2>
        <div
          class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between mb-4 gap-3">
          <!-- <div class="order-2 order-lg-1">
            <p class="mb-0">Affichage {{ ((clientCurrentPage - 1) * clientItemsPerPage) + 1 }} à {{
              Math.min(clientCurrentPage * clientItemsPerPage, filteredClients.length) }} sur {{ filteredClients.length
              }} clients</p>
          </div> -->
          <div
            class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-2 w-100 w-lg-auto order-1 order-lg-2">
            <div class="search-container">
              <!-- <i class="bi bi-search search-icon"></i>
              <input type="text" class="form-control search-input" v-model="searchQueryClients"
                placeholder="Rechercher une perte..." @input="filterClients">
              <button v-if="searchQueryClients" @click="clearClientSearch" class="btn-clear"><i
                  class="bi bi-x"></i></button> -->
              <span class="btn btn-danger">Total Pertes : {{ totalPertes }} $</span>
            </div>
            <div class="text-center text-sm-end">
              <i class="bi bi-archive action-icon" data-bs-toggle="modal" data-bs-target="#perteModal"></i>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-modern">
            <thead>
              <tr>
                <th @click="sortPertes('typeVinyle')" class="sortable">
                  <div class="th-content">Type de Vinyle <i class="bi bi-arrow-down-up sort-icon"></i></div>
                </th>
                <th @click="sortPertes('typeLaminier')" class="sortable">
                  <div class="th-content">Type de Laminier <i class="bi bi-arrow-down-up sort-icon"></i></div>
                </th>
                <th @click="sortPertes('dimensions')" class="sortable d-none d-md-table-cell">
                  <div class="th-content">Dimensions <i class="bi bi-arrow-down-up sort-icon"></i></div>
                </th>
                <th @click="sortPertes('raison')" class="sortable d-none d-lg-table-cell">
                  <div class="th-content">Raison <i class="bi bi-arrow-down-up sort-icon"></i></div>
                </th>
                <th @click="sortPertes('cout')" class="sortable">
                  <div class="th-content">Coût <i class="bi bi-arrow-down-up sort-icon"></i></div>
                </th>
                <th class="sortable">
                  <div class="th-content">Par <i class="bi bi-arrow-down-up sort-icon"></i></div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perte in pertes" :key="perte.id">
                <td>
                  <div class="d-flex flex-column">
                    <span>{{ perte.typeVinyle }}</span>
                    <small class="text-muted d-md-none">{{ perte.typeLaminier }}</small>
                  </div>
                </td>
                <td class="d-none d-md-table-cell">{{ perte.typeLaminier }}</td>
                <td class="d-none d-md-table-cell">{{ perte.dimensions }}</td>
                <td class="d-none d-lg-table-cell">{{ perte.raison }}</td>
                <td>
                  <span class="badge bg-danger">{{ perte.cout }} $</span>
                </td>
                <td class="d-none d-lg-table-cell">{{ perte.prenom }} {{ perte.nom }}</td>
                <td>
                  <i class="bi bi-trash" @click="deletePerte(perte.id)"></i>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- <div v-if="filteredClients.length === 0" class="no-data">
            <i class="bi bi-inbox"></i>
            <p>Aucun client trouvé</p>
          </div>
        </div>
        <div class="pagination-container" v-if="clientTotalPages > 1">
          <nav>
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: clientCurrentPage === 1 }">
                <a class="page-link" @click.prevent="changeClientPage(clientCurrentPage - 1)"><i
                    class="bi bi-chevron-left"></i></a>
              </li>
              <li class="page-item" v-for="page in clientVisiblePages" :key="page"
                :class="{ active: page === clientCurrentPage }">
                <a class="page-link" @click.prevent="changeClientPage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: clientCurrentPage === clientTotalPages }">
                <a class="page-link" @click.prevent="changeClientPage(clientCurrentPage + 1)"><i
                    class="bi bi-chevron-right"></i></a>
              </li>
            </ul>
          </nav>
          <div class="pagination-info">
            Affichage {{ ((clientCurrentPage - 1) * clientItemsPerPage) + 1 }} à {{ Math.min(clientCurrentPage *
              clientItemsPerPage, filteredClients.length) }} sur {{ filteredClients.length }} clients
          </div> -->
        </div>
      </section>

      <section v-if="currentSection === 'calendrier'" class="section" id="calendrier">
        <div class="contain-calendar">
          <Calendar @view="editTask"/>
        </div>
      </section>

      <section v-if="currentSection === 'table'" class="section" id="table">
        <h2 class="section-title">Tableau</h2>
        <Kanban @view="editTask"/>
      </section>
      
      <section v-if="currentSection === 'taskProfile'" class="section">
        <taskProfile :id-task="taskId" :end-point="endpoint" @previous="previous()"
          @delete="refreshSectionTaskAfterDelete()" @updateTask="refreshSectionTask()"
          @showclient="editClient($event, id)"></taskProfile>
      </section>

      <section v-if="currentSection === 'clientProfile'" class="section">
        <clientProfile :client-id="clientId" @previous="previous()" @delete="refreshSectionClient()" @view="editTask"
          @update="refetchSectionClient()">
        </clientProfile>
      </section>

      <section v-if="currentSection === 'myuserProfile'" class="section">
        <myuserProfile :user-id="userId" @previous="previous()"></myuserProfile>
      </section>

      <PerteModal @submitPerte="refreshSectionPerte"></PerteModal>

    </main>
  </div>
</template>

<script>
import Calendar from '../components/Calendar.vue'
import Kanban from '../components/Kanban.vue'
import Dashboard from '../components/Dashboard.vue'
import PerteModal from '@/components/PerteModal.vue'
import taskProfile from '@/components/taskProfile.vue'
import clientProfile from '@/components/clientProfile.vue'
import { getService } from '../api/services/get.service' 
import { deleteService } from '@/api/services/delete.service'
import myuserProfile from '@/components/myuserProfile.vue' 

export default {
  name: 'EmployeView',
  components: {
    Calendar,
    Kanban,
    Dashboard,
    PerteModal,
    taskProfile,
    clientProfile,
    myuserProfile
  },
  data() {
    return {
      currentSection: 'dashboard',
      previousSection: '',
      role: '',
      taches: [],
      filteredTaches: [],
      perte : [],
      historyStack: [],
      taskId: null,
      endpoint: '',
      error: null,
      username: '',
      hovered: null,
      user: null,
      searchQueryTaches: '',
      selectedPriorityFilter: '',
      selectedStatusFilter: '',
      selectedTask: null,
      sortField: 'datedebut',
      sortDirection: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
      isSidebarOpen: false,
      isMobile: false,
    }
  },
  computed: {
    logoStyle() {
      return {
        width: this.isMobile ? '30px' : '60px'
      }
    },
    tachesUrgentes() {
      return this.taches.filter(t => t.priorite === 'Urgent').length
    },
    tachesEnCours() {
      return this.taches.filter(t => !['Facturation'].includes(t.statut)).length
    },
    nbTachesEnRetard() {
      const today = new Date();
      return this.taches.filter(t => {
        const due = new Date(t.datefin);
        return t.statut !== 'Facturation' && due < today;
      }).length;
    },
    paginatedTaches() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredTaches.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredTaches.length / this.itemsPerPage)
    },
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
    totalPertes() {
      let total = 0;
      for (let perte of this.pertes) {
        if (perte && !isNaN(perte.cout)) {
          total += parseFloat(perte.cout); 
        }
      }
      return parseFloat(total.toFixed(2));
    }
  },
  async mounted() {
    await this.getUserTasks()
    await this.fetchPerte();
    this.filterTaches()
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  },
  methods: {
    async getUserTasks() {
      try {
        const user = JSON.parse(localStorage.getItem("user"))
        this.user = user
        const id = user.id
        let toutesLesTaches = []
        const response = await getService.getEmployeAllTask(id)
        toutesLesTaches = response.data
        this.taches = toutesLesTaches.sort((a, b) => new Date(a.datedebut) - new Date(b.datedebut))
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches", error)
      }
    },
    async fetchPerte() {
      try {
        this.perte = [];
        const response = await getService.getPerte();
        this.pertes = response.data;
        console.log("voici les pertes " + response.data);
      } catch (error) {
        this.error = "Erreur lors de la récupération des utilisateurs";
        console.error(error);
      }
    },
    
    filterTaches() {
      let filtered = [...this.taches]
      
      // Filtrage par recherche
      if (this.searchQueryTaches) {
        const query = this.searchQueryTaches.toLowerCase()
        filtered = filtered.filter(tache => 
          tache.titre.toLowerCase().includes(query) ||
          tache.id.toString().includes(query) ||
          tache.statut.toLowerCase().includes(query)
        )
      }
      
      // Filtrage par priorité
      if (this.selectedPriorityFilter) {
        filtered = filtered.filter(tache => tache.priorite === this.selectedPriorityFilter)
      }
      
      // Filtrage par statut
      if (this.selectedStatusFilter) {
        filtered = filtered.filter(tache => tache.statut === this.selectedStatusFilter)
      }
      
      this.filteredTaches = filtered
      this.currentPage = 1 // Reset à la première page
    },
    
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }
      
      this.filteredTaches.sort((a, b) => {
        let aVal = a[field]
        let bVal = b[field]
        
        if (field === 'datefin' || field === 'datedebut') {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }
        
        if (this.sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    },
    
    clearSearch() {
      this.searchQueryTaches = ''
      this.filterTaches()
    },
    checkScreenSize() {
      this.isMobile = window.innerWidth < 768;
    },
    selectRow(tache) {
      this.selectedTask = tache
    },
    async deletePerte(id) {
      try {
        const confirm = window.confirm("voulez vous supprimer cette perte ?")
        if (confirm) {
          const response = await deleteService.deletePerte(id);
          this.refreshSectionPerte();
          if (!response) throw new Error()
        }
      } catch (error) {
        console.error(error);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      })
    },
    
    isOverdue(dateString, statut) {
      const today = new Date();
      const dueDate = new Date(dateString);
      return statut !== 'Facturation' && dueDate < today;
    },
    
    getTaskIcon(type) {
      const icons = {
        'ppf': 'bi bi-file-earmark-text',
        'lettrage': 'bi bi-fonts',
        'affichage': 'bi bi-display',
        'default': 'bi bi-clipboard'
      }
      return icons[type] || icons.default
    },
    
    getPriorityIcon(priority) {
      const icons = {
        'Urgent': 'bi bi-exclamation-triangle-fill',
        'Normal': 'bi bi-circle-fill',
        'Bas': 'bi bi-arrow-down-circle-fill'
      }
      return icons[priority] || 'bi bi-circle-fill'
    },
    
    quickEdit(tache) {
      // Fonction pour modification rapide
    },
    
    connectedUser() {
      const localUser = localStorage.getItem('user')
      this.username = JSON.parse(localUser).username
      this.role = JSON.parse(localUser).role
    },
    
    getTaskRealId(tache) {
      switch (tache.typeTask) {
        case 'ppf': return tache.idPpf
        case 'lettrage': return tache.idLett
        case 'affichage': return tache.idAff
      }
    },
    
     editTask(type, id) {
      try{
      if(!type || !id) throw new Error();
      if (this.historyStack.length === 0) this.historyStack.push(this.currentSection)
      this.historyStack.push('taskProfile')
      this.currentSection = 'taskProfile';
      this.taskId = id;
      this.endpoint = type;
      }catch(error){
        console.error(error);
      }
    },
    editClient(id) {
      if (this.historyStack.length === 0) this.historyStack.push(this.currentSection)
      this.historyStack.push('clientProfile')
      this.currentSection = 'clientProfile';
      this.clientId = id;
    },
    editUser(id) {
      if (this.historyStack.length === 0) this.historyStack.push(this.currentSection)
      this.historyStack.push('userProfile')
      this.currentSection = 'userProfile';
      this.userId = id;
    },
    
    changeSectionProfil() {
      if (this.historyStack.length === 0) this.historyStack.push(this.currentSection)
      this.historyStack.push('myuserProfile')
      this.previousSection = this.currentSection
      this.currentSection = 'myuserProfile'
      if (this.isSidebarOpen) this.isSidebarOpen = false
    },
    
    previous() {
      if (this.historyStack.length > 1) {
        this.historyStack.pop()
        this.currentSection = this.historyStack[this.historyStack.length - 1]
      }
    },
    goTo(section) {
      this.historyStack.push(section)
      this.currentSection = section
    },
    clearnav() {
      this.historyStack.length = 0;
    },
    refreshSectionTask() {
      this.currentSection = 'taches'
      this.taches = []
      this.fetchTask()
    },
    
    refreshSectionUser() {
      this.currentSection = 'employe'
    },
    
    refreshSectionClient() {
      this.currentSection = 'clients'
    },
    refreshSectionPerte() {
      this.currentSection = 'pertes';
      this.fetchPerte();
    },
    
    logout() {
      const confirm = window.confirm("Voulez-vous vraiment vous deconnecter ?")
      if(confirm){
      localStorage.removeItem('user')
      this.$router.push('/login')
      }
    },

    getPriorityClass(priorite) {
      const priorityClasses = {
        'Urgent': 'priority-urgent',
        'Normal': 'priority-normal',
        'Bas': 'priority-low'
      }
      return priorityClasses[priorite] || 'priority-normal'
    },
    
    getTaskStatusClass(statut) {
      const taskStatusClasses = {
        'Leads': 'status-leads',
        'Design': 'status-design',
        'Approbation': 'status-approval',
        'Impression': 'status-print',
        'Production': 'status-production',
        'Installation': 'status-installation',
        'Facturation': 'status-billing'
      }
      return taskStatusClasses[statut] || 'status-default'
    },
    
    getClientStatusClass(statut) {
      const clientStatusClasses = {
        'Actif': 'bg-success',
        'Inactif': 'bg-danger',
        'Prospect': 'bg-info',
      }
      return clientStatusClasses[statut] || 'badge-primary'
    },
    closeSideBar(){
      if(this.isMobile && this.isSidebarOpen) 
      this.isSidebarOpen = false;
    }
  }
}
</script>

<style scoped>
/* Styles de base - main uniquement */
main {
  background-color: white;
  overflow-y: scroll;
}

.page {
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  overflow-x: hidden;
  overflow-y: hidden;
  padding-top: 20px;
}

.sidebar {
  width: 6%;
  min-width: 100px;
  flex-shrink: 0;
}

/* Header du dashboard */
.dashboard-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.dashboard-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 0.5rem;
}

.stat-retard {
  /* background: linear-gradient(135deg, #ff6b6b, #ee5a52); */
  color: white;
  /* border-radius: 12px;
  padding: 0.5rem 1rem;
  margin-left: 0.5rem; */
}
.stat-retard .stat-number {
  color: white;
}
.stat-retard .stat-label {
  color: #fff8;
}

/* Section des contrôles */
.controls-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.btn-clear:hover {
  background-color: #f8f9fa;
}

.filter-select {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

/* Container du tableau */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

/* Styles du tableau moderne */
.table-modern {
  margin: 0;
  border-collapse: separate;
  border-spacing: 0;
}

.table-modern thead th {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: none;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 1rem;
  position: relative;
}

.table-modern thead th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.table-modern thead th.sortable:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-icon {
  opacity: 0.5;
  font-size: 0.8rem;
}

.table-modern tbody tr {
  border-bottom: 1px solid #f1f3f4;
  transition: all 0.3s ease;
}

.table-modern tbody tr:hover {
  background-color: #f8f9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.table-modern tbody tr.selected {
  background-color: #e3f2fd;
  border-left: 4px solid #667eea;
}

.table-modern tbody tr.table-row {
  cursor: pointer;
}

.table-modern td {
  padding: 1rem;
  vertical-align: middle;
  border: none;
}

/* Styles des éléments du tableau */
.task-id {
  font-weight: 600;
  color: #667eea;
  font-family: 'Courier New', monospace;
}

.task-title {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.date-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-text {
  font-size: 0.9rem;
}

.overdue-badge {
  color: #dc3545;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Badges de priorité */
.priority-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
}

.priority-urgent {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
}

.priority-normal {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.priority-low {
  background: linear-gradient(135deg, #45b7d1, #96c93d);
  color: white;
}

/* Badges de statut */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-leads {
  background: linear-gradient(135deg, #ffc107, #ffb300);
  color: #333;
}

.status-design {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.status-approval {
  background: linear-gradient(135deg, #17a2b8, #138496);
  color: white;
}

.status-print {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
}

.status-production {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.status-installation {
  background: linear-gradient(135deg, #343a40, #23272b);
  color: white;
}

.status-billing {
  background: linear-gradient(135deg, #6f42c1, #5a32a3);
  color: white;
}

.status-default {
  background: linear-gradient(135deg, #6c757d, #545b62);
  color: white;
}

/* Boutons d'action */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-view {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-view:hover {
  background: linear-gradient(135deg, #5a6fd8, #6a419a);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-edit {
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
}

.btn-edit:hover {
  background: linear-gradient(135deg, #218838, #1abc9c);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

/* Message aucune donnée */
.no-data {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.no-data i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-data p {
  font-size: 1.1rem;
  margin: 0;
}

/* Pagination */
.pagination-container {
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination .page-link {
  border: 2px solid #e9ecef;
  color: #667eea;
  padding: 0.5rem 1rem;
  margin: 0 2px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-1px);
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
}

.pagination .page-item.disabled .page-link {
  color: #6c757d;
  background-color: #f8f9fa;
  border-color: #e9ecef;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Styles existants pour la navigation */
.nav-link {
  color: white;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  background-color: #b61919;
}

/* Styles existants pour les badges */
.badge {
  padding: 0.5em 0.8em;
  border-radius: 4px;
  font-weight: 500;
}

.badge-success {
  background-color: #198754;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
}

.badge-danger {
  background-color: #dc3545;
}

.badge-info {
  background-color: #0dcaf0;
}

.badge-primary {
  background-color: #0d6efd;
}

/* Styles pour les boutons d'action existants */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.sidebar-tooltip {
  position: absolute;
  left: 60px;
  background: #222;
  color: #fff;
  padding: 4px 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 100;
  font-size: 0.95em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.nav-link {
  position: relative;
  height: 48px;
}

.sidebar .nav-link i {
  font-size: 1.7rem;
}

.table {
  color: #212529;
  background-color: #ffffff;
  margin-top: 1rem;
}

.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  color: #212529;
}

.table tbody tr {
  border-bottom: 1px solid #dee2e6;
  cursor: pointer;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.table td,
.table th {
  padding: 1rem;
  vertical-align: middle;
}

/* Responsive Styles */
@media (max-width: 1199.98px) {
  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 991.98px) {
  .dashboard-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .section-title {
    font-size: 1.3rem;
  }

  .sidebar{
    display: flex;
    flex-direction: column;
    flex-wrap : nowrap;
    justify-content: center;
    align-items: center;
    align-content: center;
  }
}


@media (max-width: 767.98px) {
  .page {
    padding-top: 10px;
  }
  
  .sidebar {
    display: flex;
    flex-direction: column;
    flex-wrap : nowrap;
    justify-content: center;
    align-items: center;
    align-content: center;
    width: 80px;
    min-width: 80px;
    padding: 0.5rem !important;
  }
  
  .sidebar-mobile {
    width: 70px;
    min-width: 70px;
  }

  .rounded-circle{
    width: 10%;
  }
  
  .main-content {
    padding: 1rem !important;
  }
  
  .sidebar .nav-link i {
    font-size: 1.4rem;
  }
  
  .sidebar-tooltip {
    left: 50px;
    font-size: 0.85em;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .search-input {
    min-width: 150px;
  }
  
  .action-icon {
    font-size: 1.1rem;
  }
  
  .table td,
  .table th {
    padding: 0.5rem;
  }
  
  .badge {
    font-size: 0.7rem;
    padding: 0.25em 0.5em;
  }
}

@media (max-width: 575.98px) {
  .sidebar {
    width: 60px;
    min-width: 60px;
  }
  
  .sidebar-mobile {
    width: 50px;
    min-width: 50px;
  }
  
  .main-content {
    padding: 0.5rem !important;
  }
  
  .sidebar .nav-link i {
    font-size: 1.2rem;
  }
  
  .sidebar-tooltip {
    left: 40px;
    font-size: 0.8em;
  }
  
  .section-title {
    font-size: 1.1rem;
  }
  
  .search-input {
    min-width: 120px;
  }
  
  .table td,
  .table th {
    padding: 0.25rem;
    font-size: 0.9rem;
  }
  
  .badge {
    font-size: 0.65rem;
    padding: 0.2em 0.4em;
  }
  
  .action-icon {
    font-size: 1rem;
  }
  
  .dropdown-menu {
    font-size: 0.9rem;
  }
}

@media (orientation : landscape) {
    body{
    scrollbar-width: 20px;
  }

  .img-ls{
    width: 5px;
  }

  .nav-pills{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
    overflow-y: scroll;
    scrollbar-width: none;
  }

  .nav-item{
    flex-basis: 20%;
    flex-shrink: 2;
    flex-grow: 1;
  }

}

.mobile-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 48px;
  background: #111;
  z-index: 3000;
  display: flex;
  align-items: center;
  padding: 0 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.btn-hamburger {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  padding: 4px 8px;
  margin-right: 12px;
  border-radius: 6px;
  transition: background 0.2s;
}
.btn-hamburger:active,
.btn-hamburger:focus {
  background: #222;
}

.navbar-title {
  color: #fff;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 1px;
}

@media (min-width: 768px) {
  .mobile-navbar {
    display: none !important;
  }
}

.sidebar {
  transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s;
  z-index: 1500;
}

@media (max-width: 767.98px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    min-width: 180px;
    max-width: 80vw;
    box-shadow: 2px 0 16px rgba(0,0,0,0.18);
    background: #222;
    transform: translateX(-110%);
  }
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  .sidebar.sidebar-closed {
    transform: translateX(-110%);
  }
}

@media (max-width: 767.98px) {
  .main-content {
    padding-top: 60px !important; 
  }
}
</style>