import instance from "../axios.config";

const handleRequest = async (url, id, data, successMessage, errorMessage) => {
  try {
    const response = await instance.put(`/${url}/${id}`, data);
    console.log(successMessage, response.data);
    return response;
  } catch (error) {
    console.error(errorMessage, error);
  }
};

export const updateService = {
  updateUser(userId, userData) {
    return handleRequest(
      "user",
      userId,
      userData,
      "utilisateur mis à jour avec succès",
      "erreur lors de la mise à jour"
    );
  },

  async updateClient(clientId, clientData) {
    return handleRequest(
      "client",
      clientId,
      clientData,
      "Client mis à jour avec succès",
      "erreur lors de la mise à jour"
    );
  },
  async updateTask(url, taskid, taskdata) {
    return handleRequest(
      url,
      taskid,
      taskdata,
      "Tâche envoyé pour la mise à jour avec succès",
      "erreur lors de la mise à jour"
    );
  },
  async updateMainTask(taskid, taskdata) {
    return handleRequest(
      "tache",
      taskid,
      taskdata,
      "Tâche envoyé pour la mise à jour avec succès",
      "erreur lors de la mise à jour"
    );
  },
  async updateContact(contactId, contactData) {
    try {
      const response = await instance.put(`/clientcontact/contact/${contactId}`, contactData);
      console.log("Contact mis à jour avec succès", response.data);
      return response;
    } catch (error) {
      console.error("erreur lors de la mise à jour", error);
    }
  },
};
