// App entry point. Creates the Vue app, installs Pinia (state management)
// and Vue Router, then mounts the app to the DOM.

import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router/index.js";
import App from "./App.vue";
import "./assets/main.css";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
