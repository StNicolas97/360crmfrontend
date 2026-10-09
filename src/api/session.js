// Stockage de la session (jeton + utilisateur connecté).
// Le rôle sert uniquement à l'affichage : les droits réels sont vérifiés par l'API.

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const ROLES = { ADMIN: "admin", EMPLOYE: "employee" };

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

