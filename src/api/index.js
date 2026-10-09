// Accès à l'API, regroupé par ressource.
// Chaque fonction renvoie directement les données et laisse remonter les erreurs :
// c'est l'appelant (store ou vue) qui décide du message à afficher.
import http from "./http";

const data = (request) => request.then((response) => response.data);

// Message lisible à partir d'une erreur axios
export function errorMessage(error, fallback = "Une erreur est survenue") {
  if (!error?.response) return "Impossible de joindre le serveur. Vérifiez votre connexion.";
  if (error.response.status === 403) return "Vous n'avez pas les droits pour cette action.";
  return error.response.data?.message || error.response.data?.error || fallback;
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
  calendar: () => data(http.get("/tache/all")),
  invoice: (task) => data(http.post("/auth/createInvoice", task)),
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
    return data(http.post("/upload/single", form, { headers: { "Content-Type": "multipart/form-data" } }));
  },
  remove: (id) => data(http.delete(`/upload/${id}`)),
  // Les fichiers sont protégés : on les télécharge avec le jeton, puis on les ouvre localement
  download: (filename) =>
    data(http.get(`/uploads/${encodeURIComponent(filename)}`, { responseType: "blob" })),
};
