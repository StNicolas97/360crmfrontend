import instance from "../axios.config";

export const authService = {
  async getProfile() {
    try {
      const response = await instance.get("/user");
      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  },

  async checkLogin(credentials) {
    try {
      const response = await instance.post("/login", credentials);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return { success: true, credentials };
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      return { success: false, message: "Erreur de connexion" };
    }
  },
};
