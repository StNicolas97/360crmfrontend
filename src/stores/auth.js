import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { authApi, errorMessage } from "@/api";
import { getToken, getUser, saveSession, clearSession, ROLES } from "@/api/session";

// Utilisateur connecté et droits d'affichage.
// Les droits réels sont toujours vérifiés par l'API ; ici on décide seulement quoi montrer.
export const useAuthStore = defineStore("auth", () => {
  const user = ref(getUser());
  const token = ref(getToken());

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const isAdmin = computed(() => user.value?.role === ROLES.ADMIN);
  const displayName = computed(
    () => [user.value?.prenom, user.value?.nom].filter(Boolean).join(" ") || user.value?.username || ""
  );

  async function login(credentials) {
    try {
      const response = await authApi.login(credentials);
      saveSession(response.token, response.user);
      token.value = response.token;
      user.value = response.user;
      return { success: true };
    } catch (error) {
      clearSession();
      const status = error.response?.status;
      const message =
        status === 401 || status === 400
          ? "Nom d'utilisateur ou mot de passe incorrect"
          : errorMessage(error, "Connexion impossible, réessayez plus tard");
      return { success: false, message };
    }
  }

  // Met à jour le nom affiché après une modification du profil
  function updateLocalUser(fields) {
    user.value = { ...user.value, ...fields };
    saveSession(token.value, user.value);
  }

  function logout() {
    clearSession();
    // Rechargement complet : vide proprement tous les stores en mémoire
    window.location.assign("/login");
  }

  return { user, token, isAuthenticated, isAdmin, displayName, login, logout, updateLocalUser };
});
