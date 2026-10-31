import axios from "axios";
import { getToken, clearSession } from "./session";

// Adresse de l'API :
// - production : VITE_API_URL fourni au build ; à défaut, l'API est appelée sur la même origine (URL relative).
// - développement : l'API locale est utilisée par défaut (jamais la production par accident).
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

if (!API_BASE_URL) {
  console.warn("VITE_API_URL absent : les appels à l'API partent vers l'origine du site.");
}

// Délai maximal d'une requête : sur le wifi de l'atelier, mieux vaut une erreur claire qu'un bouton qui tourne sans fin.
// Les envois et téléchargements de fichiers utilisent un délai plus long (voir api/index.js).
export const DEFAULT_TIMEOUT = 20_000;

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  // Pas de withCredentials : l'authentification passe par l'en-tête Bearer, aucun cookie n'est utilisé.
});

// Ajoute le JWT à chaque requête
instance.interceptors.request.use((request) => {
  const token = getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// Délai laissé à l'utilisateur pour lire l'avertissement avant la redirection
const EXPIRED_REDIRECT_DELAY = 1500;
let redirecting = false;

// Prévient l'utilisateur (toast) sans créer de dépendance circulaire avec les stores
async function warnSessionExpired() {
  try {
    const { useUiStore } = await import("@/stores/ui");
    useUiStore().notify("Votre session a expiré. Reconnectez-vous pour continuer.", "warning", EXPIRED_REDIRECT_DELAY + 500);
  } catch {
    // Pinia indisponible (ex. tests) : la page de connexion affichera de toute façon le message
  }
}

// Session expirée ou invalide : avertissement, puis retour à la connexion en conservant la page courante
function handleUnauthorized() {
  if (redirecting) return; // plusieurs requêtes peuvent échouer en même temps : une seule redirection
  redirecting = true;
  clearSession();
  const { pathname, search, hash } = window.location;
  if (pathname === "/login") {
    redirecting = false;
    return;
  }
  warnSessionExpired();
  const redirect = `${pathname}${search}${hash}`;
  const query = new URLSearchParams({ expired: "1" });
  if (redirect !== "/") query.set("redirect", redirect);
  // Rechargement complet : vide les stores en mémoire (données de l'ancienne session)
  setTimeout(() => window.location.assign(`/login?${query}`), EXPIRED_REDIRECT_DELAY);
}

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.replace(/^\//, "") === "login";
    if (error.response?.status === 401 && !isLoginRequest) handleUnauthorized();
    return Promise.reject(error);
  }
);

export default instance;
