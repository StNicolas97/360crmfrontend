<template>
  <div class="login-container min-vh-100 d-flex justify-content-center align-items-center bg-light">
        <div class="col-12 col-sm-10 col-md-8 col-lg-12">
          <div class="login-card card shadow-lg border-0">
            <div class="card-body p-4 p-sm-5">
              <!-- Header avec logo -->
              <div class="text-center mb-4">
                <img 
                  src="../../assets/Logo 360 AutoWrap_Noir.png" 
                  class="img-fluid logo mb-3" 
                  alt="360 AutoWrap Logo"
                  style="max-width: 120px;"
                >
                <h2 class="h4 text-dark mb-0 d-none d-sm-block">Connexion</h2>
              </div>

              <!-- Formulaire -->
              <form @submit.prevent="handleLogin">
                <!-- Alert -->
                <div id="alert" class="alert alert-danger d-none mb-3" role="alert"></div>

                <!-- Champ nom d'utilisateur -->
                <div class="form-floating mb-3">
                  <input 
                    type="text" 
                    class="form-control" 
                    id="username" 
                    v-model="login.username" 
                    required 
                    placeholder="Votre identifiant"
                  >
                  <label for="username">
                    <i class="bi bi-person me-2"></i>Nom d'utilisateur
                  </label>
                </div>

                <!-- Champ mot de passe -->
                <div class="form-floating mb-4">
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="login.password" 
                    required 
                    placeholder="Votre mot de passe"
                  >
                  <label for="password">
                    <i class="bi bi-lock me-2"></i>Mot de passe
                  </label>
                </div>

                <!-- Bouton de connexion -->
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg py-3"
                    :disabled="!login.username || !login.password"
                  >
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Se connecter
                  </button>
                </div>
              </form>

              <!-- Footer optionnel -->
              <div class="text-center mt-4 d-none d-sm-block">
                <small class="text-muted">
                  © 2025 360AutoWrap - CRM
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        this.showError("Nom d'utilisateur ou mot de passe incorrect !");
        console.error('Erreur de connexion:', error);
      }
    },

    showError(message) {
      const alert = document.getElementById("alert");
      alert.textContent = message;
      alert.classList.remove('d-none');
      alert.classList.add('d-block');
            setTimeout(() => {
        alert.classList.remove('d-block');
        alert.classList.add('d-none');
      }, 5000);
    },

    lancer(){
      localStorage.setItem("user", JSON.stringify({username: 'aroy', password: 'Tech123!', role : "admin"}) )
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
}

.login-card {
  border-radius: 15px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.login-card .card-body {
  border-radius: 15px;
}

.form-floating > label {
  color: #6c757d;
  font-weight: 500;
}

.form-control {
  border: 2px solid #e9ecef;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #01090f;
  box-shadow: 0 0 0 0.2rem rgba(1, 9, 15, 0.25);
}

.btn-primary {
  background: linear-gradient(45deg, #01090f, #333);
  border: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(45deg, #333, #01090f);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(1, 9, 15, 0.3);
}

.btn-primary:disabled {
  background: #6c757d;
  opacity: 0.6;
}

.logo {
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Media queries pour les très petits écrans */
@media (max-width: 576px) {
  .login-container {
    padding: 1rem 0.5rem;
  }
  
  .login-card .card-body {
    padding: 2rem 1.5rem !important;
  }
  
  .btn-lg {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }
  
  .logo {
    max-width: 100px !important;
  }
}

/* Media queries pour les tablettes */
@media (min-width: 768px) and (max-width: 1999px) {
  .login-card {
    margin: 2rem 0;
  }

  .login-card{
    margin: 0 auto;
  }
}

/* Media queries pour les grands écrans */
@media (min-width: 1200px) {
  .login-card .card-body {
    padding: 3rem !important;
  }

  .login-card{
    position: relative;
    left: 50%;
    right: 50%;
  }


}

/* Mode sombre pour les préférences système
@media (prefers-color-scheme: dark) {
  .login-container {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .login-card {
    background: rgba(52, 73, 94, 0.95);
    color: white;
  }
  
  .form-control {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  .form-control::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .form-floating > label {
    color: rgba(255, 255, 255, 0.8);
  }
} */
</style>