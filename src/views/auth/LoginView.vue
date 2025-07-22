<template>
  <div class="login-container d-flex justify-content-center  align-items-center bg-white">
    <div class="login-card">
      <!-- <h2>Connexion</h2> -->
      <header>

      </header>
      <form @submit.prevent="handleLogin">
        <div class="card-header d-flex justify-content-center align-items-center bg-white flex-grow-1 flex-shrink-1 mb-3">
          <img src="../../assets/Logo 360 AutoWrap_Noir.png" class="img-fluid logo" alt="">
        </div>
        <span id="alert"></span>
        <div class="form-group">
          <label for="email">Nom d'utilisateur</label>
          <input type="text" id="email" v-model="login.username" required placeholder="Votre identifiant" />
        </div>
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="login.password" required placeholder="Votre mot de passe" />
        </div>
        <button type="submit" class="login-button">Se connecter</button>
      </form>
    </div>
  </div>
  <!-- <button @click="lancer"></button> -->
</template>

<script>
import {authService} from '../../api/services/auth.service'

export default {
  name: 'LoginView',
  data() {
    return {
      login : {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      try {
        const login = this.login;
        const response = await authService.checkLogin(login);
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("voici le user", user)
        if(user.role === "admin"){
          this.$router.push("/home");
        }else if(user.role === "employee"){
          this.$router.push("/user");
        }
      } catch (error) {
        const alert = document.getElementById("alert");
        alert.textContent = "Nom d'utilisateur ou mot de passe incorrect ! "
        alert.style.color = 'red';
        console.error('Erreur de connexion:', error);
      }
    },

    lancer(){
      localStorage.setItem("user", JSON.stringify({username: 'aroy', password: 'Tech123!', role : "admin"}) )

    }
  }
}

</script>

<style scoped>
.login-container {
  position: relative;
  margin: auto;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: auto;
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #ec0d0d;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #01090f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #dd1212;
}

.logo{
  width : 5.5rem
}


</style>