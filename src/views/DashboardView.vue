<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Bienvenue sur votre tableau de bord</p>
    <button @click="logout" class="logout-button">Se déconnecter</button>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  methods: {
    logout() {
      // Supprimer le token et rediriger vers login
      localStorage.removeItem('token')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 2rem;
}

.logout-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #c0392b;
}
</style> 