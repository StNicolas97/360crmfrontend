// Accès à l'API, regroupé par ressource.
// Chaque fonction renvoie directement les données et laisse remonter les erreurs :
// c'est l'appelant (store ou vue) qui décide du message à afficher.
import http from "./http";

// Délai plus long pour les fichiers (25 Mo maximum sur un wifi d'atelier)
const FILE_TIMEOUT = 120_000;

const data = (request) => request.then((response) => response.data);

// Message lisible à partir d'une erreur axios
// Le message renvoyé par le serveur est privilégié (ex. 400, 403, 409, 429) : il est rédigé pour l'utilisateur.
export function errorMessage(error, fallback = "Une erreur est survenue") {
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "Le serveur met trop de temps à répondre. Réessayez dans un instant.";
  }
  if (!error?.response) return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  const serverMessage = error.response.data?.message || error.response.data?.error;
  if (typeof serverMessage === "string" && serverMessage) return serverMessage;
  if (error.response.status === 403) return "Vous n'avez pas les droits pour cette action.";
  if (error.response.status === 429) return "Trop de demandes en peu de temps. Réessayez plus tard.";
  return fallback;
}

export const authApi = {
  login: (credentials) => data(http.post("/login", credentials)),
  me: () => data(http.get("/login")),
};

export const usersApi = {
  list: () => data(http.get("/user")),
  get: (id) => data(http.get(`/user/${id}`)),
  create: (user) => data(http.post("/user", user)),
  update: (id, user) => data(http.put(`/user/${id}`, user)),
  remove: (id) => data(http.delete(`/user/${id}`)),
  tasks: (id) => data(http.get(`/tache/employe/${id}`)),
};

export const clientsApi = {
  list: () => data(http.get("/client")),
  get: (id) => data(http.get(`/client/${id}`)),
  create: (client) => data(http.post("/client", client)),
  update: (id, client) => data(http.put(`/client/${id}`, client)),
  remove: (id) => data(http.delete(`/client/${id}`)),
  tasks: (id) => data(http.get(`/tache/client/${id}`)),
};

export const contactsApi = {
  list: (clientId) => data(http.get(`/clientcontact/client/${clientId}/contacts`)),
  create: (clientId, contact) => data(http.post(`/clientcontact/client/${clientId}/contacts`, contact)),
  update: (id, contact) => data(http.put(`/clientcontact/contact/${id}`, contact)),
  remove: (id) => data(http.delete(`/clientcontact/contact/${id}`)),
};

// endpoint = ppf | lettrage | affichage
export const tasksApi = {
  listByType: (endpoint) => data(http.get(`/${endpoint}`)),
  get: (endpoint, subId) => data(http.get(`/${endpoint}/${subId}`)),
  create: (endpoint, task) => data(http.post(`/${endpoint}`, task)),
  update: (endpoint, taskId, task) => data(http.put(`/${endpoint}/${taskId}`, task)),
  remove: (endpoint, taskId) => data(http.delete(`/${endpoint}/${taskId}`)),
  // Mise à jour des champs communs (statut, dates) sans connaître le type
  patch: (taskId, fields) => data(http.put(`/tache/${taskId}`, fields)),
  // Toutes les tâches, tous types confondus (une seule requête)
  all: () => data(http.get("/tache/all")),
  // Facturation QuickBooks (admin) : le serveur calcule le montant et le client à partir de la tâche.
  // Réponses : 201 { qboInvoiceId, qboInvoiceNumber } ; 409 déjà facturée ; 400 configuration des taxes manquante.
  invoice: (idTache) => data(http.post("/auth/createInvoice", { idTache })),
};

export const subcontractsApi = {
  byTask: (taskId) => data(http.get(`/soustraitance/tache/${taskId}`)),
  create: (subcontract) => data(http.post("/soustraitance", subcontract)),
  remove: (id) => data(http.delete(`/soustraitance/${id}`)),
};

export const notesApi = {
  list: () => data(http.get("/notes")),
  create: (note) => data(http.post("/notes", note)),
  update: (id, note) => data(http.put(`/notes/${id}`, note)),
  remove: (id) => data(http.delete(`/notes/${id}`)),
};

export const pertesApi = {
  list: () => data(http.get("/perte")),
  create: (perte) => data(http.post("/perte", perte)),
  remove: (id) => data(http.delete(`/perte/${id}`)),
};

export const mailApi = {
  send: (mail) => data(http.post("/rappel/simpleMail", mail)),
};

export const filesApi = {
  byTask: (taskId) => data(http.get(`/upload/task/${taskId}`)),
  upload: (taskId, file) => {
    const form = new FormData();
    form.append("file", file);
    form.append("idTache", taskId);
    return data(
      http.post("/upload/single", form, { headers: { "Content-Type": "multipart/form-data" }, timeout: FILE_TIMEOUT })
    );
  },
  remove: (id) => data(http.delete(`/upload/${id}`)),
  // Les fichiers sont protégés (JWT) et servis en téléchargement forcé : on récupère le contenu (blob)
  // avec le jeton ; l'appelant déclenche ensuite le téléchargement (voir utils/download.js).
  download: (file) => data(http.get(fileApiPath(file), { responseType: "blob", timeout: FILE_TIMEOUT })),
};

// Chemin d'un fichier sur l'API, relatif à la base axios.
// Nouveau contrat : file.url = "/uploads/<filename>". Les anciennes fiches contiennent une URL absolue
// (ex. https://ancien-hote/uploads/x.pdf) : on n'en garde que le chemin /uploads/..., jamais l'hôte.
export function fileApiPath(file) {
  const url = typeof file?.url === "string" ? file.url : "";
  const index = url.indexOf("/uploads/");
  if (index !== -1) return url.slice(index).split(/[?#]/)[0];
  return `/uploads/${encodeURIComponent(file?.filename ?? "")}`;
}
