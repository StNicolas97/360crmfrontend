import instance from "../axios.config";

const handleDelete = async (endpoint, id, successMessage, errorMessage) => {
  try {
    const response = await instance.delete(`/${endpoint}/${id}`);
    console.log(successMessage);
    return response;
  } catch (error) {
    console.error(errorMessage);
  }
};

export const deleteService = {
  async deleteClient(id) {
    return handleDelete(
      "client",
      id,
      "Client suprrimé avec succès",
      "une erreur est survenue lors de la suppression"
    );
  },
  async deleteUser(id) {
    return handleDelete(
      "user",
      id,
      "Utilisateur suprrimé avec succès",
      "une erreur est survenue lors de la suppression"
    );
  },
  async deleteTask(endpoint, id) {
    return handleDelete(
      endpoint,
      id,
      "Tâche suprrimée avec succès",
      "une erreur est survenue lors de la suppression"
    );
  },
  async deletePerte(id) {
    return handleDelete(
      "perte",
      id,
      "Tâche suprrimée avec succès",
      "une erreur est survenue lors de la suppression"
    );
  },
  async deleteNote(id) {
    return handleDelete(
      "notes",
      id,
      "Note suprrimée avec succès",
      "une erreur est survenue lors de la suppression"
    );
  },
  async deleteContact(id) {
    try {
      const response = await instance.delete(`/clientcontact/contact/${id}`);
      console.log("Contact suprrimé avec succès");
      return response;
    } catch (error) {
      console.error("une erreur est survenue lors de la suppression", error);
    }
  },
};
