import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// Pinia avant le routeur : les gardes de navigation utilisent le store d'authentification
app.use(createPinia());
app.use(router);

app.config.errorHandler = (error, instance, info) => {
  console.error(`[Vue] ${info}`, error);
};

app.mount("#app");
