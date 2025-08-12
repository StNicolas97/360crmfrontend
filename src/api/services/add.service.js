import instance from "../axios.config";

const handleAdd = async (endpoint, data, successMessage, errorMessage) => {
  try {
    const response = await instance.post(`/${endpoint}`, data);
    console.log(successMessage, response.data);
    return response;
  } catch (error) {
    console.error(errorMessage);
  }
};

export const addService = {
  async addUSer(user) {
    return handleAdd(
      "user",
      user,
      "utilisateur ajouté avec succès",
      "une erreur est survenue lors de l'ajout "
    );
  },

  async addClient(client) {
    return handleAdd(
      "client",
      client,
      "Client ajouté avec succès",
      "une erreur est survenue lors de l'ajout "
    );
  },

  async addTask(task) {
    return handleAdd(
      task.typeTask,
      task,
      "Tâche ajoutée avec succès",
      "une erreur est survenue lors de l'ajout "
    );
  },
  async addInvoice(task) {
    return handleAdd(
      "auth/createInvoice",
      task,
      "Facture ajoutée avec succès",
      "une erreur est survenue lors de l'ajout "
    );
  },
  async addNote(note) {
    return handleAdd(
      "notes",
      note,
      "Note ajoutée avec succès",
      "une erreur est survenue lors de l'ajout "
    );
  },
  async addMail(mail) {
    return handleAdd(
      "rappel",
      mail,
      "Mail ajoutée avec succès",
      "une erreur est survenue lors de l'ajout "
    );
  },
};
