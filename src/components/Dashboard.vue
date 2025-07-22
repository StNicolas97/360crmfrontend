<template>
    <div class="container">
        <div class="row">
            <div class="col-sm-12 col-md-3">
                <div class="card mb-3 widget-chart bg-dark custom-chart" style="max-height: 290px;">
                    <div v-if="notifications.length" class="dashboard-notifications mb-3">
                        <div v-for="(notif, idx) in notifications" :key="idx"
                            class="alert alert-warning d-flex align-items-center" role="alert">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            <span>{{ notif.message }}</span>
                        </div>
                    </div>
                    <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
                </div>
            </div>
            <div class="col-sm-12 col-md-6">
                <div class="card border-custom" style="max-height: 290px;">
                    <h4 class="card-header-custom">
                        Tâches du jour
                    </h4>
                    <div class="card-body overflow-auto">
                        <ul class="list-group list-group-flush" v-if="tacheJour.length > 0">
                            <li class="list-group-item custom-list-item" v-for="task in tacheJour" :key="task.id"
                                @dblclick="showTache(task.typeTask, task.id)">{{ task.titre }} - {{ task.priorite }} -
                                {{
                                    task.statut }}</li>
                        </ul>
                        <ul class="list-group list-group-flush" v-else>
                            <li class="list-group-item custom-list-item" style="margin: auto;">
                                <p class="text-center">Aucune tâche aujourd'hui !</p>             
                                <i class="bi bi-inbox" style="position: relative; left: 40%;"></i>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-3">
                <div class="card border-custom" style="max-height: 290px;">
                    <h4 class="card-header-custom">
                        Clients
                    </h4>
                    <div class="card-body scroll-body overflow-auto">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item custom-list-item" v-for="client in clientsActive"
                                :key="client.id" @dblclick="showClient(client.id)">{{ client.nom }} - {{ client.statut
                                }}</li>

                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="row d-flex" style="max-height: 290px;">
            <div class="col-sm-12 col-md-3 col-xl-4 d-flex d-flex-wrap">
                <div class="row w-100">
                    <!-- Stat global -->
                    <div class="col-md-12 mb-2 mt-2 ms-1">
                        <div class="card stat-card bg-light text-dark text-center" style="height: 100%;">
                            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3" style="height: 100%;">
                                <div class="stat-block my-1">
                                    <h5>Tâches</h5>
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="stat-label-small mx-3">En cours : </span>
                                        <span class="stat-value-small text-primary me-2" style="font-size:1.5rem">{{ tachesEnCours }}</span>
                                        <i class="bi bi-hourglass-split" style="font-size:1.2rem;color:#0d6efd;"></i>
                                    </div>
                                </div>
                                <div class="stat-block my-1">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="stat-label-small mx-3">En retard : </span>
                                        <span class="stat-value-small text-danger me-2" style="font-size:1.5rem">{{nbTachesEnRetard}}</span>
                                        <i class="bi bi-exclamation-triangle" style="font-size:1.2rem;color:#dc3545;"></i>
                                    </div>
                                </div>
                                <div class="stat-block my-1">
                                    <div class="d-flex align-items-center justify-content-center">
                                        <span class="stat-label-small mx-3">Urgentes : </span>
                                        <span class="stat-value-small text-warning me-2" style="font-size:1.5rem">{{ taskUrgent.length }}</span>
                                        <i class="bi bi-lightning-charge" style="font-size:1.2rem;color:#ffc107;"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-12 col-md-9 col-xl-8">
                <div class="row">
                    <div class="col-md-7">
                        <div class="card border-custom" style="max-height: 290px;">
                            <h5 class="card-header-custom">
                                Assignés
                            </h5>
                            <div class="card-body">
                                <ul class="list-unstyled mb-0">
                                    <li v-for="[nom, nb] in topEmployes" :key="nom">
                                        <i class="bi bi-person-circle me-2"></i> {{ nom }} : <b>{{ nb }}</b> tâche(s)
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="card border-custom" style="max-height: 290px;background-color:#ff9c8a;">
                            <h5 class="card-header-custom">
                                Tâches Urgente
                            </h5>
                            <div class="card-body overflow-auto">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item custom-list-item" v-for="urgent in taskUrgent"
                                        @dblclick="showTache(urgent.typeTask, urgent.id)">{{ urgent.titre }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getService } from '@/api/services/get.service';
export default {
    name: 'Dashboard',
    data() {
        return {
            clientsActive: [],
            employeActive: [],
            tacheJour: [],
            taskUrgent: [],
            allTaches: [],
            notifications: [],
            task: {
                id: Date.now(),
                name: '',
                statut: ''
            },
        };
    },

    async mounted() {
        this.cli = this.getTask();
        await this.fetchClientsWithActiveTasks();
        await this.fetchEmployesWithActiveTasks();
        await this.fetchAllTaches();
    },

    methods: {
        addTask() {
            const taskStringified = JSON.stringify(this.task);
            this.Tasks.push({ ...this.task });
            localStorage.setItem("task", taskStringified);
        },
        getTask() {
            const task = localStorage.getItem("task");
            return task ? JSON.parse(task) : null;
        },

        async fetchClientsWithActiveTasks() {
            try {
                const response = await getService.getClientsWithActiveTasks();
                this.clientsActive = response.data;
            } catch (error) {
                this.error = "Erreur lors de la récupération des utilisateurs";
                console.error(error);
            }
        },
        async fetchEmployesWithActiveTasks() {
            try {
                const response = await getService.getEmployesWithActiveTasks();
                this.employeActive = response.data.filter((active) => active.statut !== 'facturation');
                this.taskUrgent = response.data.filter((urgent) => urgent.priorite === 'Urgent');
                this.tacheJour = response.data.filter((today) => today.datefin === new Date().toISOString().slice(0, 10));
            } catch (error) {
                this.error = "Erreur lors de la récupération des utilisateurs";
                console.error(error);
            }
        },
        async fetchAllTaches() {
            try {
                const response = await getService.getPpf();
                const response2 = await getService.getAffichage();
                const response3 = await getService.getLettrage();
                const response4 = await getService.getSoustraitance();
                let toutesLesTaches = [];
                if (response.data.length > 0) {
                    toutesLesTaches = [...toutesLesTaches, ...response.data];
                }
                if (response2.data.length > 0) {
                    toutesLesTaches = [...toutesLesTaches, ...response2.data];
                }
                if (response3.data.length > 0) {
                    toutesLesTaches = [...toutesLesTaches, ...response3.data];
                }
                if (response4.data.length > 0) {
                    toutesLesTaches = [...toutesLesTaches, ...response4.data];
                }
                this.allTaches = toutesLesTaches;
                this.notifications = [];
                const today = new Date();
                this.allTaches.forEach(t => {
                    const due = new Date(t.datefin);
                    if (t.statut !== 'Facturation' && due < today) {
                        this.notifications.push({
                            type: 'retard',
                            message: `La tâche #${t.id} ("${t.titre}") est en retard !`,
                            tacheId: t.id
                        });
                    }
                });
            } catch (error) {
                this.error = "Erreur lors de la récupération des tâches";
                console.error(error);
            }
        },
        showEmploye(id) {
            this.$emit('showemploye', id);
        },
        showTache(url, id) {
            alert("voici endpoint", url)
            this.$emit('showtache', url, id);
        },
        showClient(id) {
            this.$emit('showclient', id);

        }
    },
    computed: {
        // Nombre total de tâches en cours
        totalTachesEnCours() {
            return this.allTaches.filter(t => t.statut !== 'Facturation').length;
        },
        // Répartition des tâches en cours par employé
        workloadByEmploye() {
            const map = {};
            this.allTaches.forEach(t => {
                if (t.statut !== 'Facturation') {
                    const nom = t.nomEmploye || t.assigne || 'Non assigné';
                    map[nom] = (map[nom] || 0) + 1;
                }
            });
            return map;
        },
        // Top 3 employés les plus chargés
        topEmployes() {
            const arr = Object.entries(this.workloadByEmploye);
            arr.sort((a, b) => b[1] - a[1]);
            return arr;
        },
        // Répartition par statut
        tachesParStatut() {
            const map = {};
            this.allTaches.forEach(t => {
                map[t.statut] = (map[t.statut] || 0) + 1;
            });
            return map;
        },
        // Charge de travail moyenne
        workloadMoyenne() {
            const employes = Object.keys(this.workloadByEmploye).length;
            return employes ? (this.totalTachesEnCours / employes).toFixed(1) : 0;
        },
        nbTachesEnRetard() {
            const today = new Date();
            return this.allTaches.filter(t => t.statut !== 'Facturation' && new Date(t.datefin) < today).length;
        },
        tachesEnCours() {
        return this.allTaches.filter(t => !['Facturation'].includes(t.statut)).length
        },

    }
};
</script>

<style lang="scss" scoped>
$card-bg: #f1f3f6;
$border-color: #e0e3e7;
$text-color: #222831;
$hover-bg: #fff;
$dashboard-bg: #f7f8fa;

body,
.container {
    background: $dashboard-bg !important;
}

.card {
    background: $card-bg;
    border-radius: 16px;
    box-shadow: 0 4px 24px 0 rgba(44, 62, 80, 0.08);
    border: 1px solid $border-color;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    color: $text-color;

    &:hover {
        background: $hover-bg;
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 8px 32px 0 rgba(44, 62, 80, 0.13);
    }
}

.border-custom {
    border: 1px solid $border-color;
}

.card-header-custom {
    color: $text-color;
    background: transparent;
    padding: 1rem;
    margin: 0;
    border-bottom: 1px solid $border-color;
    font-weight: 600;
    font-size: 1.15rem;
    letter-spacing: 0.5px;
}

.custom-list-item {
    background: transparent;
    border: none;
    border-bottom: 1px solid $border-color;
    color: $text-color;
    padding: 0.75rem 1rem;
    transition: background-color 0.2s;
    cursor: pointer;

    &:hover {
        background-color: $card-bg;
    }

    &:last-child {
        border-bottom: none;
    }
}

.stat-card {
    border-radius: 16px;
    margin-bottom: 1rem;
    box-shadow: 0 2px 12px rgba(44, 62, 80, 0.07);
}

.stat-title {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    opacity: 0.9;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
}

.custom-chart {
    background: linear-gradient(145deg, #f7f8fa, #eceff1);
    border: 1px solid $border-color;
    overflow-y: scroll;
    scrollbar-width: none;
}

i {
    font-size: 2.2em;
    color: #b0b4b9;
    transition: transform 0.3s, color 0.2s;

    &:hover {
        transform: scale(1.1);
        color: #3498db;
    }
}

::-webkit-scrollbar {
    display: none;
}

.dashboard-notifications {
    z-index: 10;
    margin-bottom: 0.5rem;
}

.alert {
    font-size: 0.85rem;
    padding: 0.35rem 0.75rem;
    border-radius: 16px;
    margin-bottom: 0.3rem;
    box-shadow: 0 2px 8px rgba(255, 193, 7, 0.10);
    display: flex;
    align-items: center;
    min-height: 28px;
    background: linear-gradient(90deg, #fffbe6 80%, #ffe0b2 100%);
    border: 1px solid #ffe082;
    color: #b26a00;
}

.alert i {
    font-size: 1.1em;
    margin-right: 0.5em;
    color: #ff9800;
}

@media (max-width: 768px) {
    .stat-card {
        margin-bottom: 1rem;
    }

    .card {
        margin-bottom: 1rem;
    }
}
</style>