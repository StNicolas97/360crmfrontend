<script setup>
import { computed } from "vue";
import { NAVIGATION, canAccess } from "@/router/navigation";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import logo from "@/assets/Logo 360 AutoWrap_Blanc.png";

const auth = useAuthStore();
const ui = useUiStore();
const items = computed(() => NAVIGATION.filter((item) => canAccess(item.roles, auth.user?.role)));
</script>

<template>
  <aside class="sidebar" :class="{ open: ui.sidebarOpen }" aria-label="Navigation principale">
    <div class="sidebar-brand">
      <img :src="logo" alt="360 AutoWrap" />
      <button type="button" class="btn btn-icon text-white d-lg-none" aria-label="Fermer le menu" @click="ui.sidebarOpen = false">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>

    <button type="button" class="btn btn-primary sidebar-cta" @click="ui.openTaskForm(); ui.sidebarOpen = false">
      <i class="bi bi-plus-lg me-2"></i>Nouvelle tâche
    </button>

    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="{ name: item.name }"
        class="sidebar-link"
        active-class="active"
        @click="ui.sidebarOpen = false"
      >
        <i class="bi" :class="item.icon" aria-hidden="true"></i>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-footer">
      <RouterLink :to="{ name: 'profile' }" class="sidebar-user" @click="ui.sidebarOpen = false">
        <span class="avatar">{{ (auth.displayName || "?").charAt(0).toUpperCase() }}</span>
        <span class="min-w-0">
          <span class="d-block text-truncate">{{ auth.displayName }}</span>
          <small class="text-white-50">{{ auth.isAdmin ? "Administrateur" : "Employé" }}</small>
        </span>
      </RouterLink>
      <button type="button" class="btn btn-icon text-white-50" title="Se déconnecter" aria-label="Se déconnecter" @click="auth.logout()">
        <i class="bi bi-box-arrow-right"></i>
      </button>
    </div>
  </aside>
  <div v-if="ui.sidebarOpen" class="sidebar-backdrop d-lg-none" @click="ui.sidebarOpen = false"></div>
</template>
