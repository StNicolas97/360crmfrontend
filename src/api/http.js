import axios from "axios";
import { getToken, clearSession } from "./session";

// VITE_API_URL dans .env.local (développement) ou .env.production.
// En développement, l'API locale est utilisée par défaut : jamais la production par accident.
const baseURL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://crm360autowrap-d14c80d68b09.herokuapp.com/");

const instance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Ajoute le JWT à chaque requête
instance.interceptors.request.use((request) => {
  const token = getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// Session expirée ou invalide : retour à la page de connexion
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.replace(/^\//, "") === "login";
    if (error.response?.status === 401 && !isLoginRequest) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
