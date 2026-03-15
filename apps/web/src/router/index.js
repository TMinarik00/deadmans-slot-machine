// Vue Router configuration.
// Defines all the app routes. Right now just the health check page.
// Auth routes and game routes will be added in later cycles.

import { createRouter, createWebHistory } from "vue-router";
import HealthView from "../views/HealthView.vue";

const routes = [
  {
    path: "/",
    name: "health",
    component: HealthView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
