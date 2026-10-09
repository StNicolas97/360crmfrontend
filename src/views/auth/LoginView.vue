<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import logo from "@/assets/Logo 360 AutoWrap_Noir.png";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const credentials = ref({ username: "", password: "" });
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Retour à la page demandée avant la connexion (chemins internes uniquement)
function redirectTarget() {
  const target = route.query.redirect;
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//") ? target : { name: "dashboard" };
}

async function submit() {
  loading.value = true;
  errorMessage.value = "";
  const result = await auth.login(credentials.value);
  loading.value = false;
  if (!result.success) {
    errorMessage.value = result.message;
    credentials.value.password = "";
    return;
  }
  router.replace(redirectTarget());
}
</script>

<template>
  <div class="login-page">
    <form class="login-card" novalidate @submit.prevent="submit">
      <img :src="logo" alt="360 AutoWrap" class="login-logo" />
      <h1 class="h4 text-center mb-1">Connexion</h1>
      <p class="text-muted text-center small mb-4">Gestion des travaux de l'atelier</p>

      <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
        <i class="bi bi-exclamation-circle me-1"></i>{{ errorMessage }}
      </div>

      <div class="mb-3">
        <label for="username" class="form-label">Nom d'utilisateur</label>
        <input id="username" v-model.trim="credentials.username" type="text" class="form-control form-control-lg" autocomplete="username" autofocus required />
      </div>

      <div class="mb-4">
        <label for="password" class="form-label">Mot de passe</label>
        <div class="input-group input-group-lg">
          <input
            id="password"
            v-model="credentials.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="btn btn-outline-secondary"
            :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            @click="showPassword = !showPassword"
          >
            <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
          </button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-lg w-100" :disabled="loading || !credentials.username || !credentials.password">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
        Se connecter
      </button>

      <p class="text-center text-muted small mt-4 mb-0">© {{ new Date().getFullYear() }} 360 AutoWrap</p>
    </form>
  </div>
</template>
