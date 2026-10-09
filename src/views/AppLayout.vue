<script setup>
import AppSidebar from "@/components/layout/AppSidebar.vue";
import TaskFormModal from "@/components/tasks/TaskFormModal.vue";
import { useUiStore } from "@/stores/ui";
import logo from "@/assets/Logo 360 AutoWrap_Blanc.png";

const ui = useUiStore();
</script>

<template>
  <div class="app-shell">
    <AppSidebar />

    <div class="app-main">
      <!-- Barre mobile / tablette -->
      <header class="topbar d-lg-none">
        <button type="button" class="btn btn-icon text-white" aria-label="Ouvrir le menu" @click="ui.sidebarOpen = true">
          <i class="bi bi-list fs-4"></i>
        </button>
        <img :src="logo" alt="360 AutoWrap" class="topbar-logo" />
        <button type="button" class="btn btn-icon text-white" aria-label="Nouvelle tâche" @click="ui.openTaskForm()">
          <i class="bi bi-plus-lg fs-5"></i>
        </button>
      </header>

      <main class="app-content">
        <RouterView v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath" />
        </RouterView>
      </main>
    </div>

    <!-- Une seule modale de création, partagée par toutes les vues -->
    <TaskFormModal />
  </div>
</template>
