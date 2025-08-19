import instance from "../axios.config";

const handleRequest = async (url, successMessage, errorMessage) => {
  try {
    const response = await instance.get(url);
    console.log(successMessage, response.data);
    return response;
  } catch (error) {
    console.error(errorMessage, error);
  }
};

export const getService = {
  getClient: () =>
    handleRequest(
      "/client",
      "Liste des clients récupérée",
      "Erreur lors de la récupération des clients"
    ),

  getPpf: () =>
    handleRequest(
      "/ppf",
      "Liste des PPF récupérée avec succès",
      "Erreur lors de la récupération des PPF"
    ),

  getAffichage: () =>
    handleRequest(
      "/affichage",
      "Liste des affichages récupérées",
      "Erreur lors de la récupération des affichages"
    ),

  getLettrage: () =>
    handleRequest(
      "/lettrage",
      "Liste des lettrages récupérées",
      "Erreur lors de la récupération des lettrages"
    ),
  getNote: () =>
    handleRequest(
      "/notes",
      "Liste des notes récupérées",
      "Erreur lors de la récupération des notes"
    ),

  getSoustraitance: () =>
    handleRequest(
      "/soustraitance",
      "Liste des sous-traitances récupérées",
      "Erreur lors de la récupération des sous-traitances"
    ),

  getTask: () =>
    handleRequest(
      "/tache",
      "Liste des tâches récupérées",
      "Erreur lors de la récupération des tâches"
    ),

  getDataCalendar: () =>
    handleRequest(
      "tache/all",
      "Liste des tâches récupérées",
      "Erreur lors de la récupération des tâches"
    ),

  getUserID: (id) =>
    handleRequest(
      `user/${id}`,
      "Informations de l'utilisateur récupérées",
      "Erreur lors de la récupération de l'utilisateur"
    ),

  getClientId: (id) =>
    handleRequest(
      `client/${id}`,
      "Informations du client récupérées",
      "Erreur lors de la récupération du client"
    ),

  getClientAllTask: (id) =>
    handleRequest(
      `/tache/client/${id}`,
      "Tâches du client récupérées",
      "Erreur lors de la récupération des tâches du client"
    ),

  getEmployeAllTask: (id) =>
    handleRequest(
      `/tache/employe/${id}`,
      "Informations de la tâche récupérées",
      "Erreur lors de la récupération de la tâche"
    ),

  getTaskId: (lien, id) =>
    handleRequest(
      `${lien}/${id}`,
      "Informations de la tâche récupérées",
      "Erreur lors de la récupération de la tâche"
    ),

  getPerte: () =>
    handleRequest(
      `/perte`,
      "Informations de la tâche récupérées",
      "Erreur lors de la récupération de la tâche"
    ),
  getUrgentTasks: () =>
    handleRequest(
      "tache/urgent",
      "Informations de la tâche récupérées",
      "Erreur lors de la récupération de la tâche"
    ),

  getClientsWithActiveTasks: () =>
    handleRequest(
      "tache/clients/active",
      "Informations des clients avec active récupérées",
      "Erreur lors de la récupération de la tâche"
    ),
  getEmployesWithActiveTasks: () =>
    handleRequest(
      "tache/employes/active",
      "Informations des employés avec tâche active récupérées",
      "Erreur lors de la récupération de la tâche"
    ),
};
